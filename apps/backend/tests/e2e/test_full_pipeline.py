"""
ORBIT — Full End-to-End Pipeline & Real Integration Test Suite.
Validates the complete ORBIT constitutional build lifecycle:
  1. POST /api/runs { idea: "AI-powered interview assistant website" }
  2. Open SSE /progress, assert events for all 7 agents arrive in strictly ascending order:
     problem_discovery -> market_analysis -> feasibility ->
     prd_generator -> design -> developer -> risk_analysis
  3. Feasibility gate enforcement: if score < 80, pipeline stops immediately.
  4. orbit.zip deliverable is generated, verified, and downloadable.
  5. Unzip in a fresh container directory, inspect docker-compose.yml,
     verify healthcheck configuration, and probe /healthz -> 200 OK.
  6. Assert all 7 primary constitutional artifacts exist in GET /api/runs/{run_id}/artifacts.
"""
from __future__ import annotations

import importlib.util
import json
import logging
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path
from unittest.mock import patch

# Ensure backend root is in sys.path
backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import pytest
from httpx import ASGITransport, AsyncClient

from app.graph.pipeline import pipeline
from app.graph.progress import clear_run_history, get_run_history
from app.graph.state import OrbitState
from app.main import app

logger = logging.getLogger("orbit.tests.e2e")

EXPECTED_7_PHASES = [
    (1, "Problem Discovery"),
    (2, "Market Analysis"),
    (3, "Feasibility Assessment"),
    (4, "Product Requirements"),
    (5, "Architecture & Design"),
    (6, "Development & Build"),
    (7, "Risk Analysis & Security"),
]


@pytest.fixture
def clean_runs_env():
    """Provides an isolated sandbox runs directory for the test."""
    temp_dir = tempfile.mkdtemp(prefix="orbit-e2e-runs-")
    old_env = os.environ.get("ORBIT_RUNS_DIR")
    os.environ["ORBIT_RUNS_DIR"] = temp_dir
    yield temp_dir
    if old_env is not None:
        os.environ["ORBIT_RUNS_DIR"] = old_env
    else:
        os.environ.pop("ORBIT_RUNS_DIR", None)
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
async def e2e_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_full_pipeline_end_to_end_execution(e2e_client, clean_runs_env):
    """
    TEST SPECIFICATION:
      1. POST /api/runs { idea: "AI-powered interview assistant website" }
      2. Open SSE /progress, assert events for all 7 agents arrive in order.
      4. Assert orbit.zip exists at end.
      5. Unzip in a fresh container, verify docker compose up specs & curl /healthz -> 200.
      6. Assert all 7 artifacts are in /artifacts response.
      7. Model Routing: Gemini for 1, 4, 5, 7; DeepSeek for 6.
    """
    # Human-in-the-loop key validation
    gemini_key = (
        os.getenv("GEMINI_API_KEY_2", "")
        or os.getenv("GEMINI_API_KEY", "")
        or os.getenv("GOOGLE_GEMINI_API_KEY", "")
    ).strip()
    deepseek_key = os.getenv("DEEPSEEK_API_KEY", "").strip()

    missing_keys = []
    if not gemini_key:
        missing_keys.append("GEMINI_API_KEY")
    if not deepseek_key:
        missing_keys.append("DEEPSEEK_API_KEY")
    if missing_keys:
        pytest.fail(f"🛑 API KEY REQUIRED: Missing {', '.join(missing_keys)}")

    # Verify model routing: Gemini for 1, 4, 5, 7; DeepSeek for 6
    from app.graph.manifest import LANE_MODEL_ROUTING, PINNED_MODELS

    assert LANE_MODEL_ROUTING["problem_discovery"] == "default"
    assert PINNED_MODELS[LANE_MODEL_ROUTING["problem_discovery"]] == "gemini-2.0-flash"

    assert LANE_MODEL_ROUTING["prd_generator"] == "default"
    assert PINNED_MODELS[LANE_MODEL_ROUTING["prd_generator"]] == "gemini-2.0-flash"

    assert LANE_MODEL_ROUTING["design"] == "default"
    assert PINNED_MODELS[LANE_MODEL_ROUTING["design"]] == "gemini-2.0-flash"

    assert LANE_MODEL_ROUTING["developer"] == "coder"
    assert PINNED_MODELS[LANE_MODEL_ROUTING["developer"]] == "deepseek-coder"

    assert LANE_MODEL_ROUTING["risk_analysis"] == "default"
    assert PINNED_MODELS[LANE_MODEL_ROUTING["risk_analysis"]] == "gemini-2.0-flash"

    idea_prompt = "AI-powered interview assistant website"
    logger.info("Executing End-to-End Run for: '%s'", idea_prompt)

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 1: POST /api/runs { idea: ... }
    # ─────────────────────────────────────────────────────────────────────────
    post_resp = await e2e_client.post(
        "/api/runs",
        json={"idea": idea_prompt},
    )
    assert post_resp.status_code == 200, f"POST /api/runs failed: {post_resp.text}"
    run_data = post_resp.json()

    assert "run_id" in run_data
    run_id = run_data["run_id"]
    assert run_data["status"] == "done"
    assert f"/api/runs/{run_id}/progress" in run_data["progress_stream_url"]
    assert f"/api/runs/{run_id}/artifacts" in run_data["artifacts_url"]
    assert f"/api/runs/{run_id}/download/orbit.zip" in run_data["download_url"]

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 2: Open SSE /progress, assert events for all 7 agents arrive in order
    # ─────────────────────────────────────────────────────────────────────────
    stream_resp = await e2e_client.get(f"/api/runs/{run_id}/progress?timeout=1.0")
    assert stream_resp.status_code == 200
    assert "text/event-stream" in stream_resp.headers["content-type"]

    sse_lines = [
        line.replace("data: ", "").strip()
        for line in stream_resp.text.split("\n")
        if line.startswith("data: ")
    ]
    assert len(sse_lines) >= 7, f"Expected at least 7 SSE events, got {len(sse_lines)}"

    events = [json.loads(line) for line in sse_lines]

    # Verify Rule 9 server-side projection
    for ev in events:
        assert "agent" not in ev, f"Security Violation: agent name leaked in user SSE stream: {ev}"
        assert "tokens" not in ev, f"Security Violation: tokens leaked in user SSE stream: {ev}"
        assert "error" not in ev, f"Security Violation: error leaked in user SSE stream: {ev}"

    # Extract sequential phase index progression
    phase_indices_observed: list[int] = []
    for ev in events:
        idx = ev.get("phase_index")
        if idx and (not phase_indices_observed or phase_indices_observed[-1] != idx):
            phase_indices_observed.append(idx)

    # Assert all 7 agents executed in strictly ascending sequential order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7
    expected_indices = [1, 2, 3, 4, 5, 6, 7]
    assert phase_indices_observed == expected_indices, (
        f"Agents did not arrive in order! Observed: {phase_indices_observed}, Expected: {expected_indices}"
    )

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 4: Assert orbit.zip exists at end and is downloadable
    # ─────────────────────────────────────────────────────────────────────────
    zip_on_disk = Path(clean_runs_env) / run_id / "orbit.zip"
    if not zip_on_disk.exists():
        zip_on_disk = Path("runs") / run_id / "orbit.zip"
    assert zip_on_disk.exists(), f"orbit.zip does not exist on disk: {zip_on_disk}"

    # Download via API
    dl_resp = await e2e_client.get(f"/api/runs/{run_id}/download/orbit.zip")
    assert dl_resp.status_code == 200
    assert dl_resp.headers["content-type"] == "application/zip"
    assert 'attachment; filename="orbit.zip"' in dl_resp.headers["content-disposition"]
    assert len(dl_resp.content) > 0

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 5: Unzip in a fresh container directory, verify compose & curl /healthz -> 200
    # ─────────────────────────────────────────────────────────────────────────
    unzip_dir = Path(clean_runs_env) / "fresh_container_inspection"
    unzip_dir.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(zip_on_disk, "r") as zf:
        zf.extractall(unzip_dir)

    # Zero hardcoded secrets verification
    assert not (unzip_dir / ".env").exists(), "Security Violation: .env with raw secrets packaged into zip!"
    assert (unzip_dir / ".env.example").exists(), "Missing required .env.example configuration template"

    # Verify docker-compose.yml specs
    compose_file = unzip_dir / "docker-compose.yml"
    assert compose_file.exists(), "Missing docker-compose.yml in deliverable zip"
    compose_content = compose_file.read_text(encoding="utf-8")
    assert "healthcheck:" in compose_content
    assert "/healthz" in compose_content

    # Verify unzipped FastAPI app boots and returns 200 on /healthz
    api_main_path = unzip_dir / "apps" / "api" / "main.py"
    assert api_main_path.exists(), "Missing apps/api/main.py in deliverable zip"

    # Dynamically import unzipped FastAPI module in container environment
    sys.path.insert(0, str(unzip_dir))
    try:
        spec = importlib.util.spec_from_file_location("unzipped_orbit_api", api_main_path)
        assert spec is not None and spec.loader is not None
        unzipped_mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(unzipped_mod)
        unzipped_app = getattr(unzipped_mod, "app")
    finally:
        if str(unzip_dir) in sys.path:
            sys.path.remove(str(unzip_dir))

    # Curl / Probe /healthz on the unzipped deliverable app
    unzipped_transport = ASGITransport(app=unzipped_app)
    async with AsyncClient(transport=unzipped_transport, base_url="http://container-test") as container_client:
        probe_resp = await container_client.get("/healthz")
        assert probe_resp.status_code == 200, f"Unzipped deliverable healthz returned {probe_resp.status_code}"
        assert probe_resp.json().get("status") == "ok"

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 6: Assert all 7 primary constitutional artifacts are in /artifacts
    # ─────────────────────────────────────────────────────────────────────────
    arts_resp = await e2e_client.get(f"/api/runs/{run_id}/artifacts")
    assert arts_resp.status_code == 200
    arts_data = arts_resp.json()

    artifacts_returned = arts_data["artifacts"]
    names_present = {a["name"] for a in artifacts_returned}

    constitutional_7_artifacts = [
        "problem.md",          # Agent 1: problem_discovery
        "market.md",           # Agent 2: market_analysis
        "feasibility.json",    # Agent 3: feasibility
        "PRD.md",              # Agent 4: prd_generator
        "architecture.md",     # Agent 5: design
        "orbit.zip",           # Agent 6: developer
        "risk.md",             # Agent 7: risk_analysis
    ]

    for expected_art in constitutional_7_artifacts:
        assert expected_art in names_present, (
            f"Missing constitutional deliverable '{expected_art}' in /artifacts response: {names_present}"
        )


@pytest.mark.asyncio
async def test_feasibility_gate_halts_under_80():
    """
    TEST SPECIFICATION (STEP 3):
      Assert feasibility gate behaves: if score < 80, pipeline stops immediately.
      No PRD. No build. Status must be 'stopped_low_feasibility'.
    """
    low_feas_state = OrbitState(
        run_id="run-gate-test-low-score",
        tenant_id="tenant-gate",
        user_id="user-gate",
        idea="Perpetual Over-Unity Energy Generator App",
        feasibility={"score": 42, "verdict": "no_go", "passed": False},
    )

    result = pipeline.invoke(low_feas_state)

    # 1. Pipeline immediately terminated
    assert result["status"] == "stopped_low_feasibility", (
        f"Expected status 'stopped_low_feasibility', got: {result['status']}"
    )

    # 2. Gate blocked subsequent nodes
    assert result["prd_md"] is None, "PRD was generated despite feasibility failure!"
    assert result["design"] == {}, "Architecture/Design was generated despite feasibility failure!"
    assert result["workspace_uri"] is None, "Developer ran workspace build despite feasibility failure!"
    assert result["zip_uri"] is None, "Deliverable zip was generated despite feasibility failure!"
    assert result["risk_md"] is None, "Risk report was generated despite feasibility failure!"

    # 3. Only agents 1, 2, 3 executed
    progress = result.get("progress", {})
    assert progress.get("problem_discovery") == 100
    assert progress.get("market_analysis") == 100
    assert progress.get("feasibility") == 100
    assert "prd_generator" not in progress
    assert "developer" not in progress
    assert "risk_analysis" not in progress
