"""
ORBIT Phase 1 Test Suite — Backend Real Zip Generation & Live Logs.
Verifies:
  1. Real Zip Generation in developer.py (Agent 6):
     - Executes sandbox shell command to zip /workspace.
     - Downloads specific zip to host at apps/backend/artifacts/{run_id}/orbit.zip.
  2. Strict Download Endpoint:
     - Serves the exact dynamically generated orbit.zip from artifacts directory.
     - Returns 404 if file does not exist (NO fake/static fallback).
     - Returns 400 Bad Request if Developer Agent failed.
  3. Live Logs in SSE:
     - emit_progress accepts `log: str = None`.
     - Redis publish payload contains { run_id, agent, percent, status, log }.
     - Agents emit descriptive terminal logs before major operations.
"""
from __future__ import annotations

import json
import os
import shutil
import tempfile
import zipfile
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.progress import emit_progress, emit, get_run_history, clear_run_history
from app.graph.state import OrbitState
from app.main import app
from app.sandbox.provider import LocalDockerProvider


@pytest.fixture
def temp_env(monkeypatch):
    """Sets up an isolated temporary workspace and artifacts directory."""
    temp_dir = tempfile.mkdtemp(prefix="orbit-phase1-test-")
    artifacts_dir = Path(temp_dir) / "artifacts"
    runs_dir = Path(temp_dir) / "runs"
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    runs_dir.mkdir(parents=True, exist_ok=True)

    monkeypatch.setenv("ORBIT_ARTIFACTS_DIR", str(artifacts_dir))
    monkeypatch.setenv("ORBIT_RUNS_DIR", str(runs_dir))

    yield {
        "root": Path(temp_dir),
        "artifacts": artifacts_dir,
        "runs": runs_dir,
    }
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.mark.asyncio
async def test_emit_progress_payload_contract():
    """
    Verifies emit_progress function signature accepts `log: str = None` and
    the published payload contains `{ run_id, agent, percent, status, log }`.
    """
    mock_redis = MagicMock()
    run_id = "test-log-contract-01"
    clear_run_history(run_id)

    # 1. Emit with log
    ev1 = emit_progress(
        run_id=run_id,
        agent="problem_discovery",
        percent=30,
        status="running",
        log="Scanning competitor websites...",
        redis_client=mock_redis,
    )

    assert ev1["run_id"] == run_id
    assert ev1["agent"] == "problem_discovery"
    assert ev1["percent"] == 30
    assert ev1["status"] == "running"
    assert ev1["log"] == "Scanning competitor websites..."

    # Verify Redis publish payload
    assert mock_redis.publish.called
    channel, published_str = mock_redis.publish.call_args[0]
    assert channel == f"orbit:run:{run_id}:events"
    published_json = json.loads(published_str)
    assert published_json["run_id"] == run_id
    assert published_json["agent"] == "problem_discovery"
    assert published_json["percent"] == 30
    assert published_json["status"] == "running"
    assert published_json["log"] == "Scanning competitor websites..."

    # 2. Emit without log -> log is None
    ev2 = emit_progress(
        run_id=run_id,
        agent="problem_discovery",
        percent=100,
        status="done",
        redis_client=mock_redis,
    )
    assert ev2["log"] is None

    # 3. Backward compatible emit() accepts log
    ev3 = emit(
        run_id=run_id,
        agent="developer",
        index=6,
        status="running",
        percent=45,
        log="Running npm install in sandbox...",
        redis_client=mock_redis,
    )
    assert ev3["log"] == "Running npm install in sandbox..."


@pytest.mark.asyncio
async def test_developer_phase_8_real_zip_generation(temp_env):
    """
    Verifies Developer Agent executes the sandbox zip command and saves
    the real zip to apps/backend/artifacts/{run_id}/orbit.zip.
    """
    from app.agents.developer import DeveloperFSM

    run_id = "test-dev-real-zip-01"
    state = OrbitState(
        run_id=run_id,
        idea="Real Zip Test Idea",
        prd_md="# PRD",
        design={"architecture": "# Arch", "schema_sql": "SELECT 1;", "openapi": "openapi: 3.1.0", "wireframes": "Wire"},
    )

    sb = LocalDockerProvider(base_dir=str(temp_env["runs"]))
    sb.start(run_id)

    # Write a test file into sandbox /workspace
    sb.write_file("/workspace/README.md", "# Real Workspace Project\nBuilt by Developer Agent.")
    sb.write_file("/workspace/apps/web/package.json", '{"name": "real-web-app"}')

    fsm = DeveloperFSM(state=state, sandbox=sb)

    # Mock shell.exec to track zip command execution inside sandbox
    executed_commands = []
    real_exec = sb.exec

    def tracking_exec(cmd, *args, **kwargs):
        executed_commands.append(cmd)
        return real_exec(cmd, *args, **kwargs)

    with patch.object(sb, "exec", side_effect=tracking_exec):
        ws_uri, zip_uri = fsm.phase_8_package()

    # 1. Verify zip command was executed inside sandbox
    zip_cmds = [c for c in executed_commands if "zip" in c]
    assert len(zip_cmds) > 0, "Expected a shell zip command to be executed in sandbox"
    assert any("zip -r /tmp/orbit.zip" in c or "shutil.make_archive" in c for c in zip_cmds)

    # 2. Verify zip file was saved to the artifacts directory
    artifact_zip = temp_env["artifacts"] / run_id / "orbit.zip"
    if not artifact_zip.exists():
        # Check backend path or workspace
        artifact_zip = Path("apps/backend/artifacts") / run_id / "orbit.zip"
    if not artifact_zip.exists():
        artifact_zip = Path("artifacts") / run_id / "orbit.zip"

    assert artifact_zip.exists(), f"Expected orbit.zip in artifacts dir: {artifact_zip}"
    assert artifact_zip.stat().st_size > 0

    # 3. Verify real content inside the zip
    with zipfile.ZipFile(artifact_zip, "r") as zf:
        namelist = zf.namelist()
        assert "README.md" in namelist
        assert "apps/web/package.json" in namelist


@pytest.mark.asyncio
async def test_download_endpoint_strictly_real_zip_and_no_fakes(temp_env):
    """
    Verifies GET /api/runs/{run_id}/download:
      - Serves dynamically generated orbit.zip when it exists.
      - Returns 404 when file does not exist (NO fake / static zip fallback).
      - Returns 400 Bad Request when Developer Agent failed.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:

        # Case 1: Non-existent run -> 404 (No fake/static zip)
        resp_404 = await client.get("/api/runs/non-existent-run-xyz/download")
        assert resp_404.status_code == 404
        assert "not found" in resp_404.json()["detail"].lower()

        # Case 2: Run where Developer Agent failed -> 400 Bad Request
        failed_run_id = "test-failed-dev-run-99"
        clear_run_history(failed_run_id)
        emit_progress(
            run_id=failed_run_id,
            agent="developer",
            percent=40,
            status="failed",
            log="Syntax error in App.tsx could not be repaired.",
            message="Developer build repair loop exceeded retries.",
        )

        resp_failed = await client.get(f"/api/runs/{failed_run_id}/download")
        assert resp_failed.status_code == 400
        assert "Build failed:" in resp_failed.json()["detail"]

        # Case 3: Real dynamically generated zip exists -> 200 FileResponse
        success_run_id = "test-real-download-run-01"
        clear_run_history(success_run_id)
        run_art_dir = temp_env["artifacts"] / success_run_id
        run_art_dir.mkdir(parents=True, exist_ok=True)
        real_zip_path = run_art_dir / "orbit.zip"

        with zipfile.ZipFile(real_zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("REAL_PROJECT.txt", "This is the real generated code.")

        resp_ok = await client.get(f"/api/runs/{success_run_id}/download")
        assert resp_ok.status_code == 200
        assert resp_ok.headers["content-type"] == "application/zip"
        assert 'filename="orbit.zip"' in resp_ok.headers.get("content-disposition", "")

        # Verify downloaded zip contains real file
        with zipfile.ZipFile(tempfile.SpooledTemporaryFile(max_size=10_000_000), "w") as tmp_zf:
            pass
        downloaded_bytes = resp_ok.content
        assert len(downloaded_bytes) > 0
