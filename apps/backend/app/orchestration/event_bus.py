"""
Asynchronous Real-Time Event Bus for Streaming Agent Activity, Debates, and Consensus to the Frontend.
Supports in-memory fanout with replay buffer for connected SSE clients.
"""
import asyncio
import json
from collections import defaultdict
from collections.abc import AsyncGenerator
from typing import Any

import structlog

logger = structlog.get_logger("orchestration.event_bus")


class AgentEventBus:
    """Manages real-time pub/sub event streams per project."""

    def __init__(self) -> None:
        self._subscribers: dict[str, set[asyncio.Queue[dict[str, Any]]]] = defaultdict(set)
        self._history: dict[str, list[dict[str, Any]]] = defaultdict(list)
        self._max_history = 100

    async def publish(self, project_id: str, event_type: str, data: dict[str, Any]) -> None:
        """Publish an event to all subscribers for a given project."""
        event_payload = {
            "event": event_type,
            "project_id": str(project_id),
            "data": data,
        }

        # Store in historical buffer for late-joining clients
        history = self._history[str(project_id)]
        history.append(event_payload)
        if len(history) > self._max_history:
            history.pop(0)

        # Broadcast to all active listener queues
        queues = self._subscribers.get(str(project_id), set())
        for q in list(queues):
            try:
                q.put_nowait(event_payload)
            except Exception as e:
                logger.warning("failed_to_enqueue_event", error=str(e), project_id=project_id)

    async def subscribe(self, project_id: str) -> AsyncGenerator[dict[str, str], None]:
        """Async generator yielding SSE formatted events for a project."""
        str_pid = str(project_id)
        queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue()
        self._subscribers[str_pid].add(queue)

        try:
            # First, send initial connected handshake
            yield {
                "event": "connected",
                "data": json.dumps({"project_id": str_pid, "status": "listening"}),
            }

            # Replay recent history if available
            recent = list(self._history.get(str_pid, []))
            for item in recent[-10:]:
                yield {
                    "event": item["event"],
                    "data": json.dumps(item["data"]),
                }

            # Stream live events as they arrive
            while True:
                try:
                    # Timeout after 15s to send keepalive heartbeat
                    event_payload = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield {
                        "event": event_payload["event"],
                        "data": json.dumps(event_payload["data"]),
                    }
                except TimeoutError:
                    yield {
                        "event": "heartbeat",
                        "data": json.dumps({"status": "alive"}),
                    }
        finally:
            self._subscribers[str_pid].discard(queue)
            if not self._subscribers[str_pid]:
                self._subscribers.pop(str_pid, None)

    def get_recent_events(self, project_id: str) -> list[dict[str, Any]]:
        """Retrieve recent buffered events for a project."""
        return list(self._history.get(str(project_id), []))


# Global singleton instance
agent_event_bus = AgentEventBus()
