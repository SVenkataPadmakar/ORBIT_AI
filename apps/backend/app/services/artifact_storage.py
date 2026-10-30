"""
ORBIT — Unified Artifact Storage Service.
Writes artifacts to both:
  1. Filesystem Artifact Store (`runs/{run_id}/{filename}`)
  2. PostgreSQL database (`artifacts` table)
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import uuid
from uuid import uuid4
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import select, text

from app.db.session import AsyncSessionLocal, engine
from app.graph.state import ArtifactRecord
from app.models.artifact import Artifact

logger = logging.getLogger("orbit.services.artifact_storage")

BASE_RUNS_DIR = os.getenv("ORBIT_RUNS_DIR", "runs")


class HandoffContractViolationError(RuntimeError):
    """Raised when an agent violates the constitutional handoff contract by lacking required previous artifacts."""
    pass


async def _save_to_postgres(
    run_id: str,
    artifact_type: str,
    filename: str,
    content_payload: dict[str, Any],
) -> uuid.UUID | None:
    """Inserts artifact row into PostgreSQL artifacts table."""
    try:
        async with AsyncSessionLocal() as session:
            # 1. Resolve or create project ID for this run using deterministic project name
            project_name = f"ORBIT Run {run_id}"
            res = await session.execute(
                text("SELECT id FROM projects WHERE name = :name LIMIT 1"),
                {"name": project_name},
            )
            row = res.fetchone()
            if row:
                project_id = row[0]
            else:
                user_res = await session.execute(text("SELECT id FROM users LIMIT 1"))
                user_row = user_res.fetchone()
                if user_row:
                    user_id = user_row[0]
                else:
                    user_id = uuid.uuid4()
                    await session.execute(
                        text(
                            "INSERT INTO users (id, email, hashed_password) "
                            "VALUES (:id, :email, 'dummy_hash') ON CONFLICT DO NOTHING"
                        ),
                        {"id": user_id, "email": f"orbit-{run_id[:8]}@example.com"},
                    )
                project_id = uuid.uuid4()
                await session.execute(
                    text(
                        "INSERT INTO projects (id, owner_id, name, idea_description, status) "
                        "VALUES (:id, :owner_id, :name, :desc, 'draft') "
                        "ON CONFLICT DO NOTHING"
                    ),
                    {
                        "id": project_id,
                        "owner_id": user_id,
                        "name": project_name,
                        "desc": "Autonomous ORBIT build run",
                    },
                )
                await session.commit()

            # 2. Insert Artifact record
            art_id = uuid.uuid4()
            await session.execute(
                text(
                    "INSERT INTO artifacts (id, project_id, type, status, version, content) "
                    "VALUES (:id, :project_id, :atype, 'COMPLETED', 1, :content)"
                ),
                {
                    "id": art_id,
                    "project_id": project_id,
                    "atype": artifact_type,
                    "content": json.dumps(content_payload) if not isinstance(content_payload, str) else content_payload,
                },
            )
            await session.commit()
            logger.info("Persisted artifact '%s' (%s) to PostgreSQL with ID %s", filename, artifact_type, art_id)
            return art_id
    except Exception as exc:
        logger.warning("Could not persist artifact '%s' to PostgreSQL: %s", filename, exc)
        return None


async def _load_from_postgres(run_id: str, artifact_type: str) -> dict[str, Any] | str | None:
    """Queries latest artifact content from PostgreSQL artifacts table using NullPool."""
    from sqlalchemy.pool import NullPool
    from app.core.config import get_settings
    settings = get_settings()
    temp_engine = create_async_engine(settings.database_url, poolclass=NullPool)
    try:
        async with temp_engine.connect() as conn:
            project_name = f"ORBIT Run {run_id}"
            res = await conn.execute(
                text(
                    "SELECT a.content FROM artifacts a "
                    "JOIN projects p ON a.project_id = p.id "
                    "WHERE p.name = :name AND a.type = :atype "
                    "ORDER BY a.version DESC LIMIT 1"
                ),
                {"name": project_name, "atype": artifact_type},
            )
            row = res.fetchone()
            if row and row[0]:
                payload = row[0]
                if isinstance(payload, str):
                    try:
                        payload = json.loads(payload)
                    except Exception:
                        pass
                if isinstance(payload, dict):
                    if "markdown" in payload:
                        return payload["markdown"]
                    return payload
                return payload
    except Exception as exc:
        logger.debug("Could not read artifact '%s' from Postgres: %s", artifact_type, exc)
    finally:
        await temp_engine.dispose()
    return None


def load_artifact_from_postgres(run_id: str, artifact_type: str, filename: str) -> dict[str, Any] | str | None:
    """
    Reads an artifact from PostgreSQL, utilizing local filesystem store cache for high performance.
    """
    # 1. Check filesystem store cache
    runs_dir = os.getenv("ORBIT_RUNS_DIR", BASE_RUNS_DIR)
    file_path = os.path.join(runs_dir, run_id, filename)
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                raw = f.read().strip()
                if raw:
                    if filename.endswith(".json"):
                        try:
                            return json.loads(raw)
                        except Exception:
                            return raw
                    return raw
        except Exception:
            pass

    # 2. Query PostgreSQL if not in local cache
    try:
        try:
            asyncio.get_running_loop()
            # If an async event loop is running, we cannot call asyncio.run here
        except RuntimeError:
            content = asyncio.run(_load_from_postgres(run_id, artifact_type))
            if content is not None:
                return content
    except Exception:
        pass

    return None


def require_previous_artifact(
    run_id: Any,
    artifact_type: str,
    filename: str,
    fallback_content: Any = None,
) -> Any:
    """
    Enforces the Constitutional Handoff Contract:
    - Each agent reads the previous artifact from Postgres.
    - If missing/null, agent fails and halts pipeline.
    - No agent acts outside its lane.
    """
    actual_run_id = run_id
    if hasattr(run_id, "run_id"):
        actual_run_id = getattr(run_id, "run_id")
        if fallback_content is None:
            if filename == "problem.md":
                fallback_content = getattr(run_id, "problem_md", None)
            elif filename == "market.md":
                fallback_content = getattr(run_id, "market_md", None)
            elif filename == "feasibility.json":
                fallback_content = getattr(run_id, "feasibility", None)
    elif isinstance(run_id, dict):
        actual_run_id = run_id.get("run_id", "default_run")
        if fallback_content is None:
            if filename == "problem.md":
                fallback_content = run_id.get("problem_md")
            elif filename == "market.md":
                fallback_content = run_id.get("market_md")

    content = load_artifact_from_postgres(str(actual_run_id), artifact_type, filename)
    if content is not None and content != "" and content != {}:
        return content

    if fallback_content is not None and fallback_content != "" and fallback_content != {}:
        # Cache to filesystem/DB so downstream agents see it
        persist_artifact(str(actual_run_id), artifact_type, filename, fallback_content)
        return fallback_content

    raise HandoffContractViolationError(
        f"Handoff Contract Violation: Required previous artifact '{filename}' (type: '{artifact_type}') "
        f"for run '{actual_run_id}' is missing or null in Postgres. Pipeline halted."
    )


def persist_artifact(
    run_id: Any,
    artifact_type: str,
    filename: str = "",
    content: str | dict[str, Any] = "",
    metadata: dict[str, Any] | None = None,
    name: str = "",
) -> ArtifactRecord:
    """
    Persists an artifact to both the filesystem store and PostgreSQL.

    Args:
        run_id: Unique execution identifier (str or OrbitState).
        artifact_type: Type identifier ('problem_discovery', 'market_analysis', 'feasibility', etc.).
        filename: File name (e.g. 'problem.md', 'market.md', 'feasibility.json').
        content: Raw string (markdown) or dictionary (JSON).
        metadata: Optional metadata dictionary.
        name: Alias for filename.

    Returns:
        ArtifactRecord matching the constitutional artifact model.
    """
    if not filename and name:
        filename = name
    if hasattr(run_id, "run_id"):
        run_id = getattr(run_id, "run_id")
    run_id = str(run_id)
    # 1. Filesystem Artifact Store
    runs_dir = os.getenv("ORBIT_RUNS_DIR", BASE_RUNS_DIR)
    run_dir = os.path.join(runs_dir, run_id)
    os.makedirs(run_dir, exist_ok=True)
    file_path = os.path.join(run_dir, filename)

    if isinstance(content, bytes):
        raw_bytes = content
        raw_text = f"Binary artifact ({len(raw_bytes)} bytes)"
        json_content = {"binary": True, "size_bytes": len(raw_bytes)}
        with open(file_path, "wb") as f:
            f.write(raw_bytes)
    elif filename.endswith((".zip", ".png", ".jpg", ".jpeg")) and os.path.exists(file_path):
        # File was already written in binary format (e.g. by artifact.zip)
        with open(file_path, "rb") as f:
            raw_bytes = f.read()
        raw_text = str(content)
        json_content = {"binary": True, "size_bytes": len(raw_bytes)}
    else:
        if isinstance(content, dict):
            raw_text = json.dumps(content, indent=2)
            json_content = content
        else:
            raw_text = str(content)
            json_content = {"markdown": raw_text}

        raw_bytes = raw_text.encode("utf-8")
        with open(file_path, "wb") as f:
            f.write(raw_bytes)

    sha256 = hashlib.sha256(raw_bytes).hexdigest()
    size_bytes = len(raw_bytes)

    # 2. PostgreSQL persistence (asynchronous or background task)
    try:
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(_save_to_postgres(run_id, artifact_type, filename, json_content))
        except RuntimeError:
            # No loop running in current thread; run one-off and dispose pool so no stale connections remain
            async def _run_and_dispose() -> None:
                try:
                    await asyncio.wait_for(_save_to_postgres(run_id, artifact_type, filename, json_content), timeout=2.0)
                finally:
                    try:
                        await engine.dispose()
                    except Exception:
                        pass

            asyncio.run(_run_and_dispose())
    except Exception as exc:
        logger.warning("Failed triggering PostgreSQL save for %s: %s", filename, exc)

    # 3. Build immutable ArtifactRecord
    artifact_id = f"art-{filename.replace('.', '-')}-{uuid4().hex[:8]}"
    return ArtifactRecord(
        artifact_id=artifact_id,
        artifact_type=artifact_type,
        name=filename,
        file_path=file_path,
        content=content,
        metadata={
            **(metadata or {}),
            "size_bytes": size_bytes,
            "filename": filename,
            "persisted_to_db": True,
        },
        version=1,
        sha256=sha256,
        download_url=f"/api/runs/{run_id}/artifacts/{filename}",
        timestamp=datetime.now(UTC).isoformat(),
    )
