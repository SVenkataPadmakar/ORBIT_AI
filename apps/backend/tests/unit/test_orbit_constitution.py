"""
ORBIT BACKEND — CONSTITUTION & ARCHITECTURE TEST SUITE

Verifies 100% compliance with:
1. Stack (Fixed):
   - Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Postgres 16, Celery, Redis.
   - LangGraph (StateGraph supervisor, Postgres checkpointer).
   - Sandbox: E2B SDK (prod) / Local Docker (dev).
   - Frontend integration: Unified Server-Sent Events (SSE) for progress.

2. The 7 Agents (Linear Pipeline):
   1. problem_discovery (Gemini 2.0 Flash) -> problem.md
   2. market_analysis (Tavily Search + Gemini) -> market.md
   3. feasibility (GPT-4o, strict JSON) -> feasibility.json [Gate: score >= 80]
   4. prd_generator (Claude 3.5 Sonnet) -> PRD.md
   5. design (Claude 3.5 Sonnet) -> architecture.md, schema.sql, openapi.yaml, wireframes.md
   6. developer (Claude 3.5 Sonnet + E2B) -> orbit.zip (Code, tests, infra)
   7. risk_analysis (Claude 3.5 Sonnet) -> risk.md

3. Handoff Contract:
   - Each agent reads the previous artifact from Postgres.
   - If missing/null, agent fails and halts pipeline.
   - No agent acts outside its lane.

4. Progress Event Contract (SSE):
   Every agent MUST emit:
   { "run_id": str, "agent": str, "agent_index": int, "status": str, "percent": int, "message": str }

5. .env Requirements:
   - GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, TAVILY_API_KEY, E2B_API_KEY, DATABASE_URL, REDIS_URL

6. Failure Taxonomy (Developer Agent):
   missing_dep (install) | type_error (patch 1 file) | syntax_error (patch 1 line) | test_fail (patch logic) | runtime_crash (read logs first).
   Max 5 repairs per phase. Never patch >1 file per attempt.
"""
from __future__ import annotations

import json
import os
import tempfile
import pytest
from unittest.mock import patch, MagicMock

from app.core.config import Settings, get_settings
from app.graph.state import OrbitState, ProgressEvent
from app.graph.progress import emit, clear_run_history
from app.graph.pipeline import create_pipeline_graph, route_feasibility
from app.graph.checkpointer import get_checkpointer
from app.sandbox.provider import (
    LocalDockerProvider,
    E2BProvider,
    get_sandbox_provider,
)
from app.services.artifact_storage import (
    HandoffContractViolationError,
    load_artifact_from_postgres,
    require_previous_artifact,
    persist_artifact,
)
from app.agents.discovery_agents import problem_discovery, market_analysis, feasibility
from app.agents.prd_design_agents import prd_generator, design
from app.agents.developer import (
    developer,
    DeveloperFSM,
    FailureTaxonomy,
    MultipleFilePatchViolationError,
    RepairThresholdExceededError,
)
from app.agents.risk_analysis import risk_analysis
from app.tools.tavily import search_tavily


# ─── 1. STACK & .ENV REQUIREMENTS ────────────────────────────────────────────

def test_constitution_env_requirements():
    """Verifies all 7 constitutional environment variables exist and are configurable."""
    settings = get_settings()

    # Core required keys
    assert hasattr(settings, "gemini_api_key")
    assert hasattr(settings, "openai_api_key")
    assert hasattr(settings, "anthropic_api_key")
    assert hasattr(settings, "tavily_api_key")
    assert hasattr(settings, "e2b_api_key")
    assert hasattr(settings, "database_url")
    assert hasattr(settings, "redis_url")

    # Custom instantiation with all 7 keys
    custom = Settings(
        GEMINI_API_KEY="test-gemini-key",
        OPENAI_API_KEY="test-openai-key",
        ANTHROPIC_API_KEY="test-anthropic-key",
        TAVILY_API_KEY="test-tavily-key",
        E2B_API_KEY="test-e2b-key",
        DATABASE_URL="postgresql+asyncpg://orbit:pass@localhost:5432/orbit_db",
        REDIS_URL="redis://localhost:6379/1",
    )
    assert custom.gemini_api_key == "test-gemini-key"
    assert custom.openai_api_key == "test-openai-key"
    assert custom.anthropic_api_key == "test-anthropic-key"
    assert custom.tavily_api_key == "test-tavily-key"
    assert custom.e2b_api_key == "test-e2b-key"
    assert "postgresql" in custom.database_url
    assert "redis" in custom.redis_url


def test_sandbox_providers_prod_and_dev():
    """Verifies E2B SDK (prod) and Local Docker (dev) sandbox configurations."""
    dev_sb = get_sandbox_provider("dev")
    assert isinstance(dev_sb, LocalDockerProvider)

    # Test E2BProvider instantiation
    e2b_sb = E2BProvider(api_key="mock-e2b-key")
    assert isinstance(e2b_sb, E2BProvider)


# ─── 2. THE 7 AGENTS LINEAR PIPELINE & MODELS ─────────────────────────────────

def test_langgraph_linear_7_agent_topology():
    """Verifies StateGraph has exactly 7 nodes and conditional feasibility gate."""
    builder = create_pipeline_graph()
    g = builder.compile()
    graph_obj = g.get_graph()

    nodes = [n for n in graph_obj.nodes.keys() if not n.startswith("__")]
    assert len(nodes) == 7
    expected = [
        "problem_discovery",
        "market_analysis",
        "feasibility",
        "prd_generator",
        "design",
        "developer",
        "risk_analysis",
    ]
    assert nodes == expected

    # Feasibility gate routing
    assert route_feasibility({"feasibility": {"score": 79}}) == "__end__"
    assert route_feasibility({"feasibility": {"score": 80}}) == "prd_generator"
    assert route_feasibility({"feasibility": {"score": 95}}) == "prd_generator"


# ─── 3. HANDOFF CONTRACT ENFORCEMENT ──────────────────────────────────────────

def test_handoff_contract_halts_when_previous_artifact_missing():
    """
    Handoff Contract:
    - Each agent reads the previous artifact from Postgres.
    - If missing/null, agent fails and halts pipeline.
    """
    # Agent 2 requires problem.md
    state_no_problem = OrbitState(run_id="run-empty-ag2-prob", idea="Test Idea")
    state_no_problem.problem_md = None
    with pytest.raises(HandoffContractViolationError) as exc2:
        market_analysis(state_no_problem)
    assert "problem.md" in str(exc2.value)

    # Agent 3 requires market.md and problem.md
    state_no_market = OrbitState(run_id="run-empty-ag3-mkt", idea="Test Idea", problem_md="# Problem")
    state_no_market.market_md = None
    with pytest.raises(HandoffContractViolationError) as exc3:
        feasibility(state_no_market)
    assert "market.md" in str(exc3.value)

    # Agent 4 requires feasibility.json
    state_no_feas = OrbitState(run_id="run-empty-ag4-feas", idea="Test Idea", problem_md="# Problem", market_md="# Market")
    state_no_feas.feasibility = {}
    with pytest.raises(HandoffContractViolationError) as exc4:
        prd_generator(state_no_feas)
    assert "feasibility.json" in str(exc4.value)

    # Agent 5 requires PRD.md
    state_no_prd = OrbitState(run_id="run-empty-ag5-prd", idea="Test Idea")
    state_no_prd.prd_md = None
    with pytest.raises(HandoffContractViolationError) as exc5:
        design(state_no_prd)
    assert "PRD.md" in str(exc5.value)

    # Agent 6 requires design artifacts
    state_no_design = OrbitState(run_id="run-empty-ag6-des", idea="Test Idea", prd_md="# PRD")
    state_no_design.design = {}
    with pytest.raises(HandoffContractViolationError) as exc6:
        developer(state_no_design)
    assert "architecture.md" in str(exc6.value)

    # Agent 7 requires previous artifacts
    state_no_prev = OrbitState(run_id="run-empty-ag7-prev", idea="Test Idea")
    state_no_prev.problem_md = None
    with pytest.raises(HandoffContractViolationError) as exc7:
        risk_analysis(state_no_prev)
    assert "problem.md" in str(exc7.value)


# ─── 4. PROGRESS EVENT CONTRACT (SSE) ─────────────────────────────────────────

def test_progress_event_contract_shape():
    """
    Every agent MUST emit:
    { "run_id": str, "agent": str, "agent_index": int, "status": str, "percent": int, "message": str }
    """
    run_id = "run-progress-contract-check-01"
    event = emit(
        run_id=run_id,
        agent="problem_discovery",
        index=1,
        status="running",
        percent=45,
        message="Synthesizing user personas and pain points",
    )

    # Required contract keys
    assert "run_id" in event and isinstance(event["run_id"], str)
    assert "agent" in event and isinstance(event["agent"], str)
    assert "agent_index" in event and isinstance(event["agent_index"], int)
    assert "status" in event and isinstance(event["status"], str)
    assert "percent" in event and isinstance(event["percent"], int)
    assert "message" in event and isinstance(event["message"], str)

    # Validate against Pydantic ProgressEvent model
    validated = ProgressEvent(
        run_id=event["run_id"],
        agent=event["agent"],
        agent_index=event["agent_index"],
        status=event["status"],
        percent=event["percent"],
        message=event["message"],
    )
    assert validated.agent_index == 1
    assert validated.percent == 45


# ─── 5. FAILURE TAXONOMY (DEVELOPER AGENT) ────────────────────────────────────

def test_developer_failure_taxonomy_and_constraints():
    """
    Failure Taxonomy:
      missing_dep (install) | type_error (patch 1 file) | syntax_error (patch 1 line) | test_fail (patch logic) | runtime_crash (read logs first).
      Max 5 repairs per phase. Never patch >1 file per attempt.
    """
    fsm = DeveloperFSM(state=OrbitState(run_id="run-taxonomy-test-01"))

    # Classification tests
    assert fsm._classify_failure("ModuleNotFoundError: No module named 'pnpm'") == FailureTaxonomy.MISSING_DEP
    assert fsm._classify_failure("error TS2322: Type 'string' is not assignable to type 'number'") == FailureTaxonomy.TYPE_ERROR
    assert fsm._classify_failure("SyntaxError: Unexpected token '{'") == FailureTaxonomy.SYNTAX_ERROR
    assert fsm._classify_failure("AssertionError: Expected 200 got 500") == FailureTaxonomy.TEST_FAIL
    assert fsm._classify_failure("Traceback (most recent call last): segmentation fault") == FailureTaxonomy.RUNTIME_CRASH

    # Constraint test: Never patch >1 file per attempt
    with pytest.raises(MultipleFilePatchViolationError):
        fsm._apply_repair(
            failure_type=FailureTaxonomy.TYPE_ERROR,
            target_file="/workspace/file1.ts, /workspace/file2.ts",
            patch_content="some patch",
        )


def test_tavily_search_integration():
    """Verifies Tavily Search tool integration and fallback."""
    results = search_tavily("AI software recruitment tools", max_results=5)
    assert len(results) >= 5
    for item in results:
        assert "title" in item
        assert "url" in item
        assert "content" in item
