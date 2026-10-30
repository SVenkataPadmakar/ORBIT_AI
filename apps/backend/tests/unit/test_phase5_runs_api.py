"""
Unit test suite for Phase 5: Backend Reality Check & API Endpoints in apps/backend/app/api/runs.py.
Verifies:
  1. POST /api/runs executes via BackgroundTasks and returns immediately.
  2. GET /api/runs/{run_id}/stream yields Redis/in-memory SSE events.
  3. GET /api/runs/{run_id}/artifacts/{agent_name} retrieves .md and .json as text/json.
  4. GET /api/runs/{run_id}/download returns FileResponse for orbit.zip.
"""
from __future__ import annotations

import json
import os
import tempfile
import zipfile
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.graph.progress import emit
from app.main import app


@pytest.fixture
def temp_run_env(tmp_path, monkeypatch):
    run_dir = tmp_path / "runs"
    run_dir.mkdir(parents=True, exist_ok=True)
    monkeypatch.setenv("ORBIT_RUNS_DIR", str(run_dir))
    return run_dir


@pytest.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_post_runs_uses_background_tasks(async_client, monkeypatch):
    """
    1. POST /api/runs must return immediately with status='queued'
    and add a background task to invoke the pipeline.
    """
    with patch("app.api.runs._execute_pipeline_in_background", new_callable=AsyncMock) as mock_bg:
        resp = await async_client.post(
            "/api/runs",
            json={"idea": "Uber for Autonomous AI Agents"},
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert "run_id" in data
        assert data["status"] == "queued"
        assert "/api/runs/" in data["stream_url"]
        assert "/stream" in data["stream_url"]
        assert "/download" in data["download_url"]


@pytest.mark.asyncio
async def test_get_run_stream_sse_format(async_client):
    """
    2. GET /api/runs/{run_id}/stream must yield SSE lines in format:
       data: {"run_id": "...", "agent": "problem_discovery", "percent": 100, "status": "done"}\n\n
    """
    test_run_id = "test-stream-run-999"
    # Emit progress event
    emit(
        run_id=test_run_id,
        agent="problem_discovery",
        index=1,
        status="done",
        percent=100,
        message="Problem discovery finished successfully",
    )

    resp = await async_client.get(f"/api/runs/{test_run_id}/stream?timeout=1.0")
    assert resp.status_code == 200
    assert "text/event-stream" in resp.headers["content-type"]

    data_lines = [line for line in resp.text.split("\n") if line.startswith("data: ")]
    assert len(data_lines) >= 1
    first_event = json.loads(data_lines[0].replace("data: ", "").strip())
    assert first_event["run_id"] == test_run_id
    assert first_event["agent"] == "problem_discovery"
    assert first_event["percent"] == 100
    assert first_event["status"] == "done"


@pytest.mark.asyncio
async def test_get_run_artifacts_by_agent_name(async_client, temp_run_env):
    """
    3. GET /api/runs/{run_id}/artifacts/{agent_name} reads the .md or .json file
       and returns it as plain text or JSON.
    """
    test_run_id = "test-art-run-001"
    run_dir = temp_run_env / test_run_id
    run_dir.mkdir(parents=True, exist_ok=True)

    # 1. Problem discovery markdown
    prob_file = run_dir / "problem.md"
    prob_file.write_text("# Problem Statement\nAI agents need fast verification.", encoding="utf-8")

    # 2. Feasibility JSON
    feas_file = run_dir / "feasibility.json"
    feas_file.write_text(json.dumps({"score": 88, "viable": True}), encoding="utf-8")

    # Fetch via agent name 'problem_discovery'
    resp_prob = await async_client.get(f"/api/runs/{test_run_id}/artifacts/problem_discovery")
    assert resp_prob.status_code == 200
    assert "Problem Statement" in resp_prob.text
    assert "text/plain" in resp_prob.headers["content-type"]

    # Fetch via direct filename 'problem.md'
    resp_prob_direct = await async_client.get(f"/api/runs/{test_run_id}/artifacts/problem.md")
    assert resp_prob_direct.status_code == 200
    assert "Problem Statement" in resp_prob_direct.text

    # Fetch feasibility JSON
    resp_feas = await async_client.get(f"/api/runs/{test_run_id}/artifacts/feasibility")
    assert resp_feas.status_code == 200
    assert resp_feas.json()["score"] == 88
    assert "application/json" in resp_feas.headers["content-type"]


@pytest.mark.asyncio
async def test_get_run_download_orbit_zip(async_client, temp_run_env):
    """
    4. GET /api/runs/{run_id}/download must return generated orbit.zip via FileResponse.
    """
    test_run_id = "test-zip-run-002"
    run_dir = temp_run_env / test_run_id
    run_dir.mkdir(parents=True, exist_ok=True)

    # Create generated orbit.zip artifact in run directory
    with zipfile.ZipFile(run_dir / "orbit.zip", "w") as zf:
        zf.writestr("README.md", "# ORBIT Generated Project\n")

    # Request /download - serves the real generated orbit.zip
    resp_dl = await async_client.get(f"/api/runs/{test_run_id}/download")
    assert resp_dl.status_code == 200
    assert resp_dl.headers["content-type"] == "application/zip"
    assert "orbit.zip" in resp_dl.headers.get("content-disposition", "")
    assert len(resp_dl.content) > 0

    # Verify download/orbit.zip endpoint alias as well
    resp_dl_alias = await async_client.get(f"/api/runs/{test_run_id}/download/orbit.zip")
    assert resp_dl_alias.status_code == 200
    assert resp_dl_alias.headers["content-type"] == "application/zip"

