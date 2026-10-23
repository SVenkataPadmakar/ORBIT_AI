"""
Unit tests for OrbitState, LangGraph pipeline skeleton, and Redis progress emitter.
Verifies:
  1. OrbitState is a dataclass with all required constitutional fields.
  2. LangGraph StateGraph has EXACTLY 7 nodes + 1 branch in mermaid output.
  3. Feeding fake state advances through all 7 nodes to completion.
  4. Feasibility gate < 80 immediately halts the pipeline with status 'stopped_low_feasibility'.
  5. emit(...) publishes properly shaped events to Redis channel orbit:run:{run_id}:events.
"""
from dataclasses import is_dataclass
import json
from unittest.mock import MagicMock

import pytest

from app.graph.pipeline import (
    create_pipeline_graph,
    pipeline,
)
from app.graph.progress import emit
from app.graph.state import OrbitState


def test_orbit_state_dataclass_conformance() -> None:
    """Verifies OrbitState is a dataclass containing all requested fields and defaults."""
    assert is_dataclass(OrbitState), "OrbitState must be decorated with @dataclass"

    state = OrbitState(
        run_id="run-custom-01",
        tenant_id="tenant-alpha",
        user_id="user-founder",
        idea="Autonomous AI agent platform",
    )

    # Core required fields
    assert state.run_id == "run-custom-01"
    assert state.tenant_id == "tenant-alpha"
    assert state.user_id == "user-founder"
    assert state.idea == "Autonomous AI agent platform"

    # Deliverables & artifacts initialized
    assert state.problem_md is None
    assert state.market_md is None
    assert isinstance(state.feasibility, dict)
    assert state.prd_md is None
    assert isinstance(state.design, dict)
    assert state.workspace_uri is None
    assert state.zip_uri is None
    assert state.risk_md is None

    # Telemetry and status
    assert isinstance(state.progress, dict)
    assert isinstance(state.errors, list)
    assert state.status == "pending"


def test_pipeline_graph_structure_and_mermaid_representation() -> None:
    """
    SUCCESS CRITERION:
    `graph.get_graph().draw_mermaid()` shows exactly 7 nodes + 1 branch.
    """
    g = create_pipeline_graph().compile()
    graph_obj = g.get_graph()

    agent_nodes = [node for node in graph_obj.nodes.keys() if not node.startswith("__")]
    expected_order = [
        "problem_discovery",
        "market_analysis",
        "feasibility",
        "prd_generator",
        "design",
        "developer",
        "risk_analysis",
    ]

    assert len(agent_nodes) == 7, f"Expected exactly 7 agent nodes, got {len(agent_nodes)}: {agent_nodes}"
    assert set(agent_nodes) == set(expected_order)

    # Verify Mermaid diagram contains exactly 7 nodes + 1 branch from feasibility
    mermaid = graph_obj.draw_mermaid()
    for node in expected_order:
        assert node in mermaid, f"Node '{node}' missing from mermaid diagram"

    # Branch after feasibility: either END or prd_generator
    assert "feasibility -.-> __end__;" in mermaid
    assert "feasibility -.-> prd_generator;" in mermaid


def test_pipeline_advances_through_all_7_nodes_with_fake_state() -> None:
    """
    SUCCESS CRITERION:
    Feeding fake state advances through all 7 nodes.
    """
    fake_state = OrbitState(
        run_id="run-fake-test-01",
        tenant_id="tenant-test",
        user_id="user-tester",
        idea={"title": "DevPilot", "summary": "Fast build engine"},
        feasibility={"score": 88},
    )

    result = pipeline.invoke(fake_state)

    # 1. Pipeline status is done
    assert result["status"] == "done"

    # 2. All 7 outputs populated
    assert result["problem_md"] is not None
    assert result["market_md"] is not None
    assert result["feasibility"]["score"] == 88
    assert result["feasibility"]["passed"] is True
    assert result["prd_md"] is not None
    assert "architecture" in result["design"]
    assert "schema_sql" in result["design"]
    assert "openapi" in result["design"]
    assert "wireframes" in result["design"]
    assert result["workspace_uri"] == "runs/run-fake-test-01/workspace"
    assert result["zip_uri"] == "runs/run-fake-test-01/orbit.zip"
    assert result["risk_md"] is not None

    # 3. Progress tracked 100% across all 7 nodes
    expected_agents = [
        "problem_discovery",
        "market_analysis",
        "feasibility",
        "prd_generator",
        "design",
        "developer",
        "risk_analysis",
    ]
    for agent in expected_agents:
        assert result["progress"].get(agent) == 100, f"Expected 100% progress for agent '{agent}'"


def test_pipeline_feasibility_gate_halts_under_80() -> None:
    """
    CONSTITUTION RULE 6:
    If feasibility.score < 80 -> pipeline STOPS immediately with status 'stopped_low_feasibility'.
    No PRD. No build.
    """
    fake_state = OrbitState(
        run_id="run-low-feas-01",
        tenant_id="tenant-test",
        user_id="user-tester",
        idea={"title": "Perpetual Motion Machine", "summary": "Free energy app"},
        feasibility={"score": 52},
    )

    result = pipeline.invoke(fake_state)

    # 1. Status indicates low feasibility stoppage
    assert result["status"] == "stopped_low_feasibility"
    assert result["feasibility"]["score"] == 52
    assert result["feasibility"]["passed"] is False

    # 2. Downstream nodes NEVER ran
    assert result.get("prd_md") is None
    assert result.get("zip_uri") is None

    # 3. Progress only reached first 3 agents
    assert result["progress"].get("problem_discovery") == 100
    assert result["progress"].get("market_analysis") == 100
    assert result["progress"].get("feasibility") == 100
    assert "prd_generator" not in result["progress"]
    assert "developer" not in result["progress"]


def test_progress_emitter_publishes_to_redis_channel() -> None:
    """
    Verifies emit(...) publishes formatted progress payload
    to Redis channel `orbit:run:{run_id}:events`.
    """
    mock_redis = MagicMock()

    payload = emit(
        run_id="run-sse-456",
        agent="developer",
        index=6,
        status="running",
        percent=72,
        message="Generating frontend components...",
        eta_seconds=18,
        redis_client=mock_redis,
    )

    # 1. Payload contract verification
    assert payload["run_id"] == "run-sse-456"
    assert payload["agent"] == "developer"
    assert payload["agent_index"] == 6
    assert payload["status"] == "running"
    assert payload["percent"] == 72
    assert payload["message"] == "Generating frontend components..."
    assert payload["eta_seconds"] == 18
    assert "timestamp" in payload

    # 2. Redis publish verification
    mock_redis.publish.assert_called_once()
    channel, message_json = mock_redis.publish.call_args[0]
    assert channel == "orbit:run:run-sse-456:events"

    parsed = json.loads(message_json)
    assert parsed["run_id"] == "run-sse-456"
    assert parsed["percent"] == 72
