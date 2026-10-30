"""
ORBIT — Core Progress Event Emitter & Event Bus.
Emits SSE progress events and terminal logs adhering to the ORBIT contract and publishes
them to Redis PubSub channel `orbit:run:{run_id}:events`, with an in-memory buffer
for instantaneous replay and fallback in local/testing environments.
"""
from __future__ import annotations

import asyncio
from collections import defaultdict
import json
import logging
from datetime import UTC, datetime
from typing import Any, AsyncGenerator, Literal, Optional

import redis

from app.core.config import get_settings

logger = logging.getLogger("orbit.core.progress")

# Singleton Redis client for synchronous event publishing
_redis_client: redis.Redis | None = None

# In-memory history buffer per run_id to ensure zero event loss on late connection
_run_history: dict[str, list[dict[str, Any]]] = defaultdict(list)

# In-memory async queues for local development / testing without Redis daemon
_async_listeners: dict[str, list[asyncio.Queue[dict[str, Any]]]] = defaultdict(list)

AGENT_INDEX_MAP: dict[str, int] = {
    "problem_discovery": 1,
    "market_analysis": 2,
    "feasibility": 3,
    "prd_generator": 4,
    "design": 5,
    "developer": 6,
    "risk_analysis": 7,
    "pipeline": 0,
}


def get_redis_client() -> redis.Redis:
    """Returns a shared synchronous Redis client instance."""
    global _redis_client
    if _redis_client is None:
        settings = get_settings()
        _redis_client = redis.Redis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_connect_timeout=0.5,
            socket_timeout=0.5,
        )
    return _redis_client


def get_run_history(run_id: str) -> list[dict[str, Any]]:
    """Retrieves all previously emitted progress events for a run."""
    # Check in-memory history first
    history = list(_run_history.get(run_id, []))
    if history:
        return history

    # Fallback to Redis history list if present
    try:
        client = get_redis_client()
        raw_items = client.lrange(f"orbit:run:{run_id}:history", 0, -1)
        if raw_items:
            return [json.loads(item) for item in raw_items]
    except Exception:
        pass

    return []


def clear_run_history(run_id: str) -> None:
    """Clears history buffer for a given run."""
    _run_history.pop(run_id, None)
    _async_listeners.pop(run_id, None)


def emit_progress(
    run_id: str,
    agent: str,
    percent: int,
    status: Literal["pending", "running", "done", "failed", "stopped_low_feasibility"] | str = "running",
    log: str | None = None,
    message: str | None = None,
    index: int | None = None,
    eta_seconds: int | None = None,
    redis_client: Any | None = None,
) -> dict[str, Any]:
    """
    Emits a structured progress event with live terminal log and publishes it
    to Redis PubSub channel `orbit:run:{run_id}:events`.

    Args:
        run_id: Unique execution identifier.
        agent: Agent name (e.g. 'problem_discovery', 'market_analysis', etc.).
        percent: Percentage completed (0..100).
        status: Current agent execution status ('pending'|'running'|'done'|'failed').
        log: Real-time terminal log/thought string (e.g. 'Scanning competitor websites...').
        message: Human-friendly status update message.
        index: 1-based index of the agent in the linear pipeline (1..7).
        eta_seconds: Estimated time remaining in seconds, or None.
        redis_client: Optional custom/mock Redis client.

    Returns:
        dict[str, Any]: The emitted event dictionary containing:
            { "run_id": str, "agent": str, "percent": int, "status": str, "log": str | None }
    """
    agent_idx = index if index is not None else AGENT_INDEX_MAP.get(agent, 1)
    display_message = message or log or (f"Completed {agent}" if percent >= 100 or status == "done" else f"Executing {agent} ({percent}%)...")

    # Contract payload strictly including: run_id, agent, percent, status, log
    event_payload: dict[str, Any] = {
        "run_id": str(run_id),
        "agent": str(agent),
        "percent": int(percent),
        "status": str(status),
        "log": log,
        "message": display_message,
        "agent_index": agent_idx,
        "index": agent_idx,
        "eta_seconds": eta_seconds,
        "timestamp": datetime.now(UTC).isoformat(),
    }

    # 1. Store in in-memory run history buffer
    _run_history[run_id].append(event_payload)

    # 2. Dispatch to local async queue listeners
    for q in _async_listeners.get(run_id, []):
        try:
            q.put_nowait(event_payload)
        except Exception:
            pass

    # 3. Publish to Redis PubSub and persist to Redis history
    channel = f"orbit:run:{run_id}:events"
    try:
        client = redis_client if redis_client is not None else get_redis_client()
        serialized = json.dumps(event_payload)
        client.publish(channel, serialized)
        client.rpush(f"orbit:run:{run_id}:history", serialized)
        logger.debug("Published progress to %s: %s (%d%%) [log: %s]", channel, agent, percent, log)
    except Exception as exc:
        # Avoid crashing pipelines if Redis is unavailable in local/test environments
        logger.debug("Could not publish progress event to Redis channel '%s': %s", channel, exc)

    return event_payload


def emit(
    run_id: str,
    agent: str,
    index: int = 1,
    status: Literal["pending", "running", "done", "failed", "stopped_low_feasibility"] | str = "running",
    percent: int = 0,
    message: str = "",
    eta_seconds: int | None = None,
    redis_client: Any | None = None,
    log: str | None = None,
) -> dict[str, Any]:
    """Backward-compatible alias for emit_progress with positional index/status/percent."""
    return emit_progress(
        run_id=run_id,
        agent=agent,
        percent=percent,
        status=status,
        log=log,
        message=message,
        index=index,
        eta_seconds=eta_seconds,
        redis_client=redis_client,
    )


async def subscribe_run_events(
    run_id: str,
    timeout_seconds: float = 300.0,
) -> AsyncGenerator[dict[str, Any], None]:
    """
    Async generator that yields progress events for a run.
    Replays previously emitted events first, then streams new events in real time.
    Terminates when the pipeline completes or fails.
    """
    # Create local queue for real-time dispatch
    q: asyncio.Queue[dict[str, Any]] = asyncio.Queue()
    _async_listeners[run_id].append(q)

    # Keep track of events already yielded to prevent duplicates
    yielded_keys: set[tuple[str, int, int, str, Optional[str]]] = set()

    try:
        # 1. Replay cached history
        history = get_run_history(run_id)
        is_completed = False
        for ev in history:
            key = (
                ev.get("agent", ""),
                ev.get("index", 0),
                ev.get("percent", 0),
                ev.get("status", ""),
                ev.get("log"),
            )
            if key not in yielded_keys:
                yielded_keys.add(key)
                yield ev
                if ev.get("status") == "done" and ev.get("percent") == 100 and ev.get("agent") in ("risk_analysis", "developer"):
                    is_completed = True
                elif ev.get("status") in ("failed", "stopped_low_feasibility"):
                    is_completed = True

        if is_completed:
            return

        # 2. Stream subsequent real-time events
        start_time = asyncio.get_event_loop().time()
        while True:
            time_left = timeout_seconds - (asyncio.get_event_loop().time() - start_time)
            if time_left <= 0:
                logger.warning("Event stream for run %s timed out after %ds", run_id, timeout_seconds)
                break

            try:
                ev = await asyncio.wait_for(q.get(), timeout=min(5.0, time_left))
                key = (
                    ev.get("agent", ""),
                    ev.get("index", 0),
                    ev.get("percent", 0),
                    ev.get("status", ""),
                    ev.get("log"),
                )
                if key not in yielded_keys:
                    yielded_keys.add(key)
                    yield ev

                    if ev.get("status") == "done" and ev.get("percent") == 100 and ev.get("agent") == "risk_analysis":
                        break
                    if ev.get("status") in ("failed", "stopped_low_feasibility"):
                        break
            except asyncio.TimeoutError:
                # Heartbeat keep-alive check: check if run finalized in history
                latest = get_run_history(run_id)
                if (
                    latest
                    and latest[-1].get("status") in ("done", "failed", "stopped_low_feasibility")
                    and latest[-1].get("agent") == "risk_analysis"
                ):
                    break
                continue
    finally:
        # Clean up queue listener
        if q in _async_listeners.get(run_id, []):
            _async_listeners[run_id].remove(q)
