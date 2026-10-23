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


async def _save_to_postgres(
    run_id: str,
    artifact_type: str,
    filename: str,
    content_payload: dict[str, Any],
) -> uuid.UUID | None:
    """Inserts artifact row into PostgreSQL artifacts table."""
    try:
        async with AsyncSessionLocal() as session:
            # 1. Resolve or create project ID for this run
            res = await session.execute(text("SELECT id FROM projects LIMIT 1"))
            row = res.fetchone()
            if row:
                project_id = row[0]
            else:
                project_id = uuid.uuid4()
                await session.execute(
                    text(
                        "INSERT INTO projects (id, name, slug, description, status) "
                        "VALUES (:id, :name, :slug, :desc, 'ACTIVE') "
                        "ON CONFLICT DO NOTHING"
                    ),
                    {
                        "id": project_id,
                        "name": f"ORBIT Run {run_id}",
                        "slug": f"run-{run_id[:16]}",
                        "desc": "Autonomous ORBIT build run",
                    },
                )
                await session.commit()

            # 2. Insert Artifact record
            art = Artifact(
                project_id=project_id,
                type=artifact_type,
                status="COMPLETED",
                version=1,
                content=content_payload,
            )
            session.add(art)
            await session.commit()
            logger.info("Persisted artifact '%s' (%s) to PostgreSQL with ID %s", filename, artifact_type, art.id)
            return art.id
    except Exception as exc:
        logger.warning("Could not persist artifact '%s' to PostgreSQL: %s", filename, exc)
        return None


def persist_artifact(
    run_id: str,
    artifact_type: str,
    filename: str,
    content: str | dict[str, Any],
    metadata: dict[str, Any] | None = None,
) -> ArtifactRecord:
    """
    Persists an artifact to both the filesystem store and PostgreSQL.

    Args:
        run_id: Unique execution identifier.
        artifact_type: Type identifier ('problem_discovery', 'market_analysis', 'feasibility', etc.).
        filename: File name (e.g. 'problem.md', 'market.md', 'feasibility.json').
        content: Raw string (markdown) or dictionary (JSON).
        metadata: Optional metadata dictionary.

    Returns:
        ArtifactRecord matching the constitutional artifact model.
    """
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
                await _save_to_postgres(run_id, artifact_type, filename, json_content)
                await engine.dispose()

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
