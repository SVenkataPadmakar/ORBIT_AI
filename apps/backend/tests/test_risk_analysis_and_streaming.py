"""
ORBIT — Risk Analysis Agent & Telemetry Streaming Test Suite.
Verifies:
  1. Agent 7 (risk_analysis) generates risk.md with all 5 mandatory sections:
     - Technical risks (with mitigation)
     - Market risks (with mitigation)
     - Execution risks (with mitigation)
     - Regulatory/compliance risks
     - Top 3 to watch (ranked)
  2. Progress reporting emits on >= 10 risks evaluated (% = risks_identified / 10).
  3. Full 7-agent linear pipeline runs end-to-end on "AI interview assistant".
  4. SSE User Progress endpoint (/api/runs/{run_id}/progress) enforces Rule 9:
     server-side projection hides agent names, tokens, and errors.
  5. SSE Admin Stream endpoint (/api/runs/{run_id}/admin/stream) yields full fidelity.
  6. Artifact listing (/api/runs/{run_id}/artifacts) returns all 10 constitutional deliverables.
  7. orbit.zip download (/api/runs/{run_id}/download/orbit.zip) sets Content-Disposition.
"""
from __future__ import annotations

import json
import os
import shutil
import tempfile
import zipfile
from pathlib import Path
from unittest.mock import patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.agents.risk_analysis import risk_analysis
from app.graph.pipeline import pipeline
from app.graph.progress import clear_run_history, emit
from app.graph.state import OrbitState
from app.main import app
from app.sandbox.provider import LocalDockerProvider


@pytest.fixture
def clean_runs_dir():
    temp_dir = tempfile.mkdtemp(prefix="orbit-runs-test-")
    old_dir = os.environ.get("ORBIT_RUNS_DIR")
    os.environ["ORBIT_RUNS_DIR"] = temp_dir
    yield temp_dir
    if old_dir is not None:
        os.environ["ORBIT_RUNS_DIR"] = old_dir
    else:
        os.environ.pop("ORBIT_RUNS_DIR", None)
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


def test_agent_7_risk_analysis_sections_and_progress(clean_runs_dir):
    """
    Verifies Agent 7 output risk.md has all 5 mandatory sections and emits progress
    for at least 10 evaluated risks.
    """
    run_id = "run-risk-test-01"
    state = OrbitState(
        run_id=run_id,
        tenant_id="tenant-acme",
        user_id="user-founder",
        idea="AI interview assistant",
        problem_md="# Problem\nScheduling latency and recruiter screening fatigue.",
        market_md="# Market\n$4.2B HR Tech assessment market.",
        feasibility={"score": 88, "passed": True},
        prd_md="# PRD\nAutonomous AI technical interviewer.",
    )

    emitted_events = []

    def mock_emit(*args, **kwargs):
        ev = emit(*args, **kwargs)
        emitted_events.append(ev)
        return ev

    with patch("app.agents.risk_analysis.emit", side_effect=mock_emit):
        result = risk_analysis(state)

    # 1. State updates
    assert result["status"] == "done"
    assert result["progress"]["risk_analysis"] == 100
    risk_content = result["risk_md"]
    assert risk_content is not None

    # 2. Check 5 mandatory sections in risk.md
    assert "## 1. Technical Risks (with Mitigation)" in risk_content
    assert "## 2. Market Risks (with Mitigation)" in risk_content
    assert "## 3. Execution Risks (with Mitigation)" in risk_content
    assert "## 4. Regulatory & Compliance Risks (with Mitigation)" in risk_content
    assert "## 5. Top 3 to Watch (Ranked)" in risk_content

    # Check top 3 ranked risks
    assert "Rank 1:" in risk_content
    assert "Rank 2:" in risk_content
    assert "Rank 3:" in risk_content

    # 3. Check progress events: at least 10 evaluated risks
    risk_events = [e for e in emitted_events if e["agent"] == "risk_analysis"]
    assert len(risk_events) >= 11  # At least 10 running + 1 done
    assert risk_events[-1]["status"] == "done"
    assert risk_events[-1]["percent"] == 100

    # 4. Check artifact persisted to disk
    persisted_path = Path(clean_runs_dir) / run_id / "risk.md"
    if not persisted_path.exists():
        persisted_path = Path("runs") / run_id / "risk.md"
    assert persisted_path.exists()
    assert persisted_path.read_text(encoding="utf-8") == risk_content


def test_full_pipeline_end_to_end_on_ai_interview_assistant(clean_runs_dir):
    """
    SUCCESS CRITERION:
      Full pipeline runs end-to-end on 'AI interview assistant'.
      Advances through all 7 nodes:
        problem_discovery -> market_analysis -> feasibility ->
        prd_generator -> design -> developer -> risk_analysis -> END
    """
    run_id = "run-e2e-ai-interviewer-01"
    state = OrbitState(
        run_id=run_id,
        tenant_id="tenant-e2e",
        user_id="user-founder",
        idea="AI interview assistant",
    )

    result = pipeline.invoke(state)

    # 1. Pipeline status is done
    assert result["status"] == "done"

    # 2. All 7 outputs populated
    assert result["problem_md"] is not None
    assert result["market_md"] is not None
    assert result["feasibility"]["score"] >= 80
    assert result["prd_md"] is not None
    assert "architecture" in result["design"]
    assert "schema_sql" in result["design"]
    assert "openapi" in result["design"]
    assert "wireframes" in result["design"]
    assert result["workspace_uri"] is not None
    assert result["zip_uri"] is not None
    assert result["risk_md"] is not None

    # 3. Progress is 100% across all 7 agents
    expected_agents = [
        "problem_discovery",
        "market_analysis",
        "feasibility",
        "prd_generator",
        "design",
        "developer",
        "risk_analysis",
    ]
    for ag in expected_agents:
        assert result["progress"].get(ag) == 100, f"Expected 100% for agent {ag}"

    # 4. Workspace and zip exist
    ws_dir = Path(result["workspace_uri"])
    if not ws_dir.exists():
        ws_dir = Path(clean_runs_dir) / run_id / "workspace"
    assert ws_dir.exists()
    zip_path = Path(clean_runs_dir) / run_id / "orbit.zip"
    if not zip_path.exists():
        zip_path = Path("runs") / run_id / "orbit.zip"
    assert zip_path.exists()


@pytest.mark.asyncio
async def test_streaming_user_projection_rbac(async_client, clean_runs_dir):
    """
    CONSTITUTION RULE 9:
      - GET /api/runs/{run_id}/progress
      - Yields server-side projected events for users:
        Shows phase, phase_index, status, percent, message.
        STRIPS agent names, tokens, and errors.
    """
    run_id = "run-stream-user-01"
    clear_run_history(run_id)

    # Pre-emit a raw agent event
    emit(
        run_id=run_id,
        agent="problem_discovery",
        index=1,
        status="running",
        percent=50,
        message="Analyzing problem space for AI interview assistant",
        eta_seconds=20,
    )
    emit(
        run_id=run_id,
        agent="problem_discovery",
        index=1,
        status="done",
        percent=100,
        message="Problem discovery complete",
        eta_seconds=0,
    )

    # Connect to user progress stream
    response = await async_client.get(f"/api/runs/{run_id}/progress?timeout=0.5")
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]

    content = response.text
    assert "event: progress" in content

    # Parse data payloads
    lines = [line for line in content.split("\n") if line.startswith("data: ")]
    assert len(lines) >= 2

    first_event = json.loads(lines[0].replace("data: ", ""))
    # RULE 9 VERIFICATION:
    assert "agent" not in first_event, "Agent name must NOT be present in user projection"
    assert "tokens" not in first_event, "Tokens must NOT be present in user projection"
    assert "error" not in first_event, "Raw errors must NOT be present in user projection"

    # User fields present
    assert first_event["phase"] == "Problem Discovery"
    assert first_event["phase_index"] == 1
    assert first_event["percent"] == 50
    assert first_event["status"] == "running"


@pytest.mark.asyncio
async def test_streaming_admin_full_fidelity_rbac(async_client, clean_runs_dir):
    """
    RBAC VERIFICATION:
      - GET /api/runs/{run_id}/admin/stream
      - Admin sees full fidelity events (including raw agent names).
    """
    run_id = "run-stream-admin-01"
    clear_run_history(run_id)

    emit(
        run_id=run_id,
        agent="developer",
        index=6,
        status="running",
        percent=85,
        message="Building Next.js 15 pages in sandbox",
        eta_seconds=10,
    )

    # Connect with admin role header
    response = await async_client.get(
        f"/api/runs/{run_id}/admin/stream?timeout=0.5",
        headers={"X-Admin-Role": "admin"},
    )
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]

    content = response.text
    assert "event: admin_progress" in content

    lines = [line for line in content.split("\n") if line.startswith("data: ")]
    assert len(lines) >= 1

    admin_event = json.loads(lines[0].replace("data: ", ""))
    # Full fidelity verification:
    assert admin_event["agent"] == "developer"
    assert admin_event["index"] == 6
    assert admin_event["percent"] == 85


@pytest.mark.asyncio
async def test_artifacts_listing_and_zip_download(async_client, clean_runs_dir):
    """
    VERIFIES:
      1. GET /api/runs/{run_id}/artifacts returns JSON listing all constitutional artifacts.
      2. GET /api/runs/{run_id}/download/orbit.zip streams zip with Content-Disposition.
    """
    run_id = "run-artifacts-test-01"
    run_dir = Path(clean_runs_dir) / run_id
    run_dir.mkdir(parents=True, exist_ok=True)

    # Create dummy artifacts
    (run_dir / "problem.md").write_text("# Problem", encoding="utf-8")
    (run_dir / "market.md").write_text("# Market", encoding="utf-8")
    (run_dir / "feasibility.json").write_text('{"score": 90}', encoding="utf-8")
    (run_dir / "PRD.md").write_text("# PRD", encoding="utf-8")
    (run_dir / "architecture.md").write_text("# Architecture", encoding="utf-8")
    (run_dir / "schema.sql").write_text("CREATE TABLE test();", encoding="utf-8")
    (run_dir / "openapi.yaml").write_text("openapi: 3.1.0", encoding="utf-8")
    (run_dir / "wireframes.md").write_text("# Wireframes", encoding="utf-8")
    (run_dir / "risk.md").write_text("# Risk Report", encoding="utf-8")

    # Create real zip
    zip_path = run_dir / "orbit.zip"
    with zipfile.ZipFile(zip_path, "w") as zf:
        zf.writestr("docker-compose.yml", "version: '3.8'\nservices:\n  api:\n    image: orbit-api\n")
        zf.writestr(".env.example", "PORT=3000\n")

    # 1. Test Artifacts Listing
    resp_arts = await async_client.get(f"/api/runs/{run_id}/artifacts")
    assert resp_arts.status_code == 200
    data = resp_arts.json()

    assert data["run_id"] == run_id
    assert "artifacts" in data
    assert "files" in data

    names = {a["name"] for a in data["artifacts"]}
    assert "problem.md" in names
    assert "market.md" in names
    assert "feasibility.json" in names
    assert "PRD.md" in names
    assert "architecture.md" in names
    assert "schema.sql" in names
    assert "openapi.yaml" in names
    assert "wireframes.md" in names
    assert "orbit.zip" in names
    assert "risk.md" in names

    # 2. Test Download orbit.zip
    resp_dl = await async_client.get(f"/api/runs/{run_id}/download/orbit.zip")
    assert resp_dl.status_code == 200
    assert resp_dl.headers["content-type"] == "application/zip"
    assert 'attachment; filename="orbit.zip"' in resp_dl.headers["content-disposition"]
    assert len(resp_dl.content) > 0

    # Test zip bootable contents
    with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp_f:
        tmp_f.write(resp_dl.content)
        tmp_name = tmp_f.name

    try:
        with zipfile.ZipFile(tmp_name, "r") as zf:
            extracted_names = zf.namelist()
            assert "docker-compose.yml" in extracted_names
            assert ".env.example" in extracted_names
    finally:
        os.unlink(tmp_name)
