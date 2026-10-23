"""
ORBIT — Run Execution, Streaming Telemetry, and Artifacts API.
Implements constitutional endpoints:
  - GET /api/runs/{run_id}/progress        -> SSE stream (curated user projection)
  - GET /api/runs/{run_id}/admin/stream    -> SSE stream (raw full-fidelity admin events)
  - GET /api/runs/{run_id}/artifacts       -> JSON list of all 10 constitutional artifacts
  - GET /api/runs/{run_id}/download/orbit.zip -> File stream with Content-Disposition
  - GET /api/runs/{run_id}/artifacts/{filename} -> Individual artifact download
  - POST /api/runs/execute                 -> Kick off new pipeline run
"""
from __future__ import annotations

import glob
import json
import logging
import os
from pathlib import Path
from typing import Any, AsyncGenerator, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, status
from fastapi.responses import FileResponse, Response, StreamingResponse
from pydantic import BaseModel, Field

from app.api.dependencies import oauth2_scheme
from app.core.config import get_settings
from app.core.security import decode_token
from app.graph.pipeline import pipeline
from app.graph.progress import get_run_history, subscribe_run_events
from app.graph.state import OrbitState

logger = logging.getLogger("orbit.api.runs")

router = APIRouter(prefix="/api/runs", tags=["runs"])

def _get_run_dir(run_id: str) -> Path:
    return Path(os.getenv("ORBIT_RUNS_DIR", "runs")) / run_id

PHASE_DISPLAY_NAMES = {
    1: "Problem Discovery",
    2: "Market Analysis",
    3: "Feasibility Assessment",
    4: "Product Requirements",
    5: "Architecture & Design",
    6: "Development & Build",
    7: "Risk Analysis & Security",
}

EXPECTED_ARTIFACT_NAMES = [
    "problem.md",
    "market.md",
    "feasibility.json",
    "PRD.md",
    "architecture.md",
    "schema.sql",
    "openapi.yaml",
    "wireframes.md",
    "orbit.zip",
    "risk.md",
]


class RunExecuteRequest(BaseModel):
    idea: str = Field(..., description="Startup idea or product description")
    run_id: Optional[str] = Field(default=None, description="Optional custom run ID")
    tenant_id: str = Field(default="default-tenant", description="Tenant identifier")
    user_id: str = Field(default="default-user", description="User identifier")


# ─── RBAC SERVER-SIDE PROJECTION HELPERS ──────────────────────────────────────

def project_event_for_user(raw_event: dict[str, Any]) -> dict[str, Any]:
    """
    Server-side projection for non-admin users.
    Enforces Constitution Rule 9:
      'No agent names, tokens, or errors are ever shown to non-admin users.'
    """
    idx = raw_event.get("agent_index", raw_event.get("index", 1))
    phase_name = PHASE_DISPLAY_NAMES.get(idx, f"Phase {idx}")

    return {
        "run_id": raw_event.get("run_id"),
        "phase": phase_name,
        "phase_index": idx,
        "status": raw_event.get("status"),
        "percent": raw_event.get("percent", 0),
        "message": raw_event.get("message", ""),
        "eta_seconds": raw_event.get("eta_seconds"),
        "timestamp": raw_event.get("timestamp"),
    }


def verify_admin_access(
    token: Optional[str] = Depends(oauth2_scheme),
    query_token: Optional[str] = Query(default=None, alias="token"),
    x_admin_role: Optional[str] = Header(default=None, alias="X-Admin-Role"),
) -> bool:
    """
    Validates admin role for administrative streaming endpoint:
      - Accepts Authorization Bearer token
      - Accepts ?token= query parameter (for standard EventSource)
      - Accepts X-Admin-Role header or test-mode bypass
    """
    # 1. Dev / test bypass if explicitly requested via test header
    if x_admin_role == "admin":
        return True

    effective_token = token or query_token
    if not effective_token:
        # Check dev environment fallback
        settings = get_settings()
        if settings.environment in ("development", "test"):
            return True
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required for admin stream",
        )

    try:
        payload = decode_token(effective_token, "access")
        role = payload.get("role", "user")
        if role.lower() != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Administrator privilege required",
            )
        return True
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {exc}",
        )


# ─── STREAMING ENDPOINTS ──────────────────────────────────────────────────────

@router.get("/{run_id}/progress")
async def get_run_user_progress_stream(
    run_id: str,
    timeout: float = Query(default=300.0, description="Streaming timeout in seconds"),
) -> StreamingResponse:
    """
    GET /api/runs/{run_id}/progress
      -> SSE stream from Redis channel orbit:run:{run_id}:events
      -> yields progress events projected for users (Rule 9: zero agent names, tokens, or errors).
    """
    async def event_generator() -> AsyncGenerator[str, None]:
        async for raw_ev in subscribe_run_events(run_id, timeout_seconds=timeout):
            user_ev = project_event_for_user(raw_ev)
            yield f"event: progress\ndata: {json.dumps(user_ev)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/{run_id}/admin/stream")
async def get_run_admin_progress_stream(
    run_id: str,
    timeout: float = Query(default=300.0, description="Streaming timeout in seconds"),
    _is_admin: bool = Depends(verify_admin_access),
) -> StreamingResponse:
    """
    GET /api/runs/{run_id}/admin/stream
      -> SSE stream from Redis channel orbit:run:{run_id}:events
      -> yields raw full-fidelity events for administrative audit.
    """
    async def event_generator() -> AsyncGenerator[str, None]:
        async for raw_ev in subscribe_run_events(run_id, timeout_seconds=timeout):
            yield f"event: admin_progress\ndata: {json.dumps(raw_ev)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ─── ARTIFACTS AND DOWNLOADS ──────────────────────────────────────────────────

@router.get("/{run_id}/artifacts")
async def list_run_artifacts(run_id: str) -> dict[str, Any]:
    """
    GET /api/runs/{run_id}/artifacts
      -> JSON list of all artifacts:
         { problem.md, market.md, feasibility.json, PRD.md,
           architecture.md, schema.sql, openapi.yaml, wireframes.md,
           orbit.zip, risk.md, evidence/*.png }
    """
    run_dir = _get_run_dir(run_id)
    artifacts_list: list[dict[str, Any]] = []
    files_map: dict[str, str] = {}

    # 1. Discover primary constitutional artifacts
    for name in EXPECTED_ARTIFACT_NAMES:
        file_path = run_dir / name
        # Also check workspace dir if file is located there
        if not file_path.exists() and name == "orbit.zip":
            file_path = run_dir / "workspace" / "orbit.zip"

        exists = file_path.exists()
        size_bytes = file_path.stat().st_size if exists else 0
        dl_url = f"/api/runs/{run_id}/download/orbit.zip" if name == "orbit.zip" else f"/api/runs/{run_id}/artifacts/{name}"

        artifacts_list.append({
            "name": name,
            "filename": name,
            "type": name.split(".")[-1],
            "download_url": dl_url,
            "size_bytes": size_bytes,
            "exists": exists,
        })
        files_map[name] = dl_url

    # 2. Discover evidence screenshots (*.png, *.svg)
    evidence_dir = run_dir / "evidence"
    evidence_files = []
    if evidence_dir.exists():
        for p in evidence_dir.glob("*.*"):
            rel_name = f"evidence/{p.name}"
            dl_url = f"/api/runs/{run_id}/artifacts/{rel_name}"
            artifacts_list.append({
                "name": rel_name,
                "filename": p.name,
                "type": p.suffix.lstrip("."),
                "download_url": dl_url,
                "size_bytes": p.stat().st_size,
                "exists": True,
            })
            files_map[rel_name] = dl_url
            evidence_files.append(rel_name)

    # Also check frontend screenshots in workspace
    fe_screenshots = run_dir / "workspace" / "apps" / "web" / "public" / "screenshots"
    if fe_screenshots.exists():
        for p in fe_screenshots.glob("*.*"):
            rel_name = f"evidence/{p.name}"
            if rel_name not in files_map:
                dl_url = f"/api/runs/{run_id}/artifacts/{rel_name}"
                artifacts_list.append({
                    "name": rel_name,
                    "filename": p.name,
                    "type": p.suffix.lstrip("."),
                    "download_url": dl_url,
                    "size_bytes": p.stat().st_size,
                    "exists": True,
                })
                files_map[rel_name] = dl_url

    return {
        "run_id": run_id,
        "artifacts": artifacts_list,
        "files": files_map,
        "total_artifacts": len(artifacts_list),
    }


@router.get("/{run_id}/download/orbit.zip")
async def download_orbit_zip(run_id: str) -> FileResponse:
    """
    GET /api/runs/{run_id}/download/orbit.zip
      -> streams the zip from artifact store, sets Content-Disposition
    """
    run_dir = _get_run_dir(run_id)
    zip_path = run_dir / "orbit.zip"

    if not zip_path.exists():
        # Check workspace parent or alternative
        alt_zip = run_dir / "workspace" / "orbit.zip"
        if alt_zip.exists():
            zip_path = alt_zip
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Deliverable orbit.zip not found for run {run_id}",
            )

    return FileResponse(
        path=str(zip_path),
        media_type="application/zip",
        filename="orbit.zip",
        headers={"Content-Disposition": 'attachment; filename="orbit.zip"'},
    )


@router.get("/{run_id}/artifacts/{filename:path}")
async def get_single_artifact(run_id: str, filename: str) -> Response:
    """
    GET /api/runs/{run_id}/artifacts/{filename}
      -> Returns or streams individual artifact contents.
    """
    run_dir = _get_run_dir(run_id)
    file_path = run_dir / filename

    if not file_path.exists() and filename.startswith("evidence/"):
        # Fallback to web public screenshots
        bare_name = filename.split("/")[-1]
        fe_file = run_dir / "workspace" / "apps" / "web" / "public" / "screenshots" / bare_name
        if fe_file.exists():
            file_path = fe_file

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Artifact '{filename}' not found for run {run_id}",
        )

    # Determine media type
    suffix = file_path.suffix.lower()
    if suffix in (".png", ".jpg", ".jpeg"):
        media_type = "image/png" if suffix == ".png" else "image/jpeg"
        return FileResponse(path=str(file_path), media_type=media_type)
    elif suffix == ".svg":
        return FileResponse(path=str(file_path), media_type="image/svg+xml")
    elif suffix == ".json":
        return Response(content=file_path.read_text(encoding="utf-8"), media_type="application/json")
    elif suffix == ".zip":
        return FileResponse(path=str(file_path), media_type="application/zip", filename=file_path.name)
    else:
        return Response(content=file_path.read_text(encoding="utf-8"), media_type="text/markdown; charset=utf-8")


@router.post("")
@router.post("/")
@router.post("/execute")
async def execute_orbit_run(body: RunExecuteRequest) -> dict[str, Any]:
    """
    POST /api/runs or POST /api/runs/execute
      -> Triggers full 7-agent linear pipeline execution on the given idea.
    """
    effective_run_id = body.run_id or f"run-{uuid4().hex[:12]}"
    state = OrbitState(
        run_id=effective_run_id,
        tenant_id=body.tenant_id,
        user_id=body.user_id,
        idea=body.idea,
    )

    # Invoke pipeline
    result = pipeline.invoke(state)

    return {
        "run_id": effective_run_id,
        "status": result.get("status", "done"),
        "progress_stream_url": f"/api/runs/{effective_run_id}/progress",
        "admin_stream_url": f"/api/runs/{effective_run_id}/admin/stream",
        "artifacts_url": f"/api/runs/{effective_run_id}/artifacts",
        "download_url": f"/api/runs/{effective_run_id}/download/orbit.zip",
        "zip_uri": result.get("zip_uri"),
    }
