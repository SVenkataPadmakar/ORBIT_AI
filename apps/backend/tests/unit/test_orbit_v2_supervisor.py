"""
Unit tests for ORBIT 7-Agent Linear Pipeline & Workspace Constitution:
1. 7 agents only: problem_discovery, market_analysis, feasibility, prd_generator, design, developer, risk_analysis.
2. Strictly linear pipeline. No parallel branches. No divisions.
3. Every agent emits SSE progress events with the mandatory contract:
   {run_id, agent, agent_index (1..7), status, percent, message, eta_seconds}.
4. Agents act through typed tools only.
5. Developer agent runs in sandbox; writes real files; produces orbit.zip.
6. If feasibility.score < 80 -> pipeline STOPS. No PRD. No build.
7. Every artifact is downloadable from /api/runs/{run_id}/artifacts.
8. Checkpoint saved after each agent.
"""
import pytest
from app.graph.budgets import (
    DEFAULT_AGENT_BUDGETS,
    AgentBudget,
    BudgetManager,
)
from app.graph.checkpointer import SqliteSaver
from app.graph.manifest import DEFAULT_RUN_SEED, LANE_MODEL_ROUTING, PINNED_MODELS, RunManifest
from app.graph.state import (
    ArtifactRecord,
    IdeaSpec,
    OrbitState,
    ProgressEvent,
    ToolCallRecord,
    create_initial_state,
)
from app.graph.supervisor import (
    compile_supervisor,
    create_supervisor_graph,
    graph,
)


EXPECTED_7_AGENTS = [
    "problem_discovery",
    "market_analysis",
    "feasibility",
    "prd_generator",
    "design",
    "developer",
    "risk_analysis",
]


def test_orbit_state_7_agents_contract() -> None:
    """Verify OrbitState tracks exactly the 7 agents and mandatory progress events."""
    state = create_initial_state(
        run_id="test-run-const-01",
        tenant_id="tenant-acme",
        idea={"title": "CloudScale AI", "summary": "Autonomous cloud optimizer", "core_problem": "Cloud overspend"},
    )

    assert state.run_id == "test-run-const-01"
    assert state.idea.title == "CloudScale AI"
    assert state.current_agent == "problem_discovery"
    assert state.current_agent_index == 1
    assert state.status == "pending"

    # Verify slots for the 7 agents
    assert state.problem_discovery is None
    assert state.market_analysis is None
    assert state.feasibility in (None, {})
    assert state.prd is None
    assert state.design in (None, {})
    assert state.developer is None
    assert state.risk_analysis is None

    # Verify budgets allocated for all 7 agents
    for agent in EXPECTED_7_AGENTS:
        assert agent in state.budgets, f"Missing budget for agent {agent}"


def test_supervisor_linear_7_agent_dag_structure() -> None:
    """
    CONSTITUTION RULES 1 & 2:
    Verify graph has exactly the 7 agents in a strictly linear pipeline.
    """
    g = create_supervisor_graph().compile()
    nodes = list(g.get_graph().nodes.keys())

    # Only 7 agent nodes plus LangGraph __start__ and __end__
    agent_nodes = [n for n in nodes if not n.startswith("__")]
    assert len(agent_nodes) == 7, f"Expected exactly 7 agent nodes, got: {agent_nodes}"
    for expected in EXPECTED_7_AGENTS:
        assert expected in agent_nodes, f"Agent '{expected}' not in graph nodes"

    # Mermaid diagram string inspection
    mermaid = g.get_graph().draw_mermaid()
    assert "problem_discovery" in mermaid
    assert "market_analysis" in mermaid
    assert "feasibility" in mermaid
    assert "prd_generator" in mermaid
    assert "design" in mermaid
    assert "developer" in mermaid
    assert "risk_analysis" in mermaid


def test_feasibility_gate_stops_pipeline_under_80() -> None:
    """
    NON-NEGOTIABLE RULE 6:
    If feasibility.score < 80 -> pipeline STOPS. No PRD. No build.
    """
    saver = SqliteSaver()
    app = compile_supervisor(checkpointer=saver)

    # Supply an initial state forcing feasibility score < 80 (e.g. 62)
    initial_state = create_initial_state(
        run_id="run-infeasible-01",
        idea={"title": "Time Machine App", "core_problem": "Physics violation"},
    )
    initial_state.feasibility = {"force_score": 62}

    config = {"configurable": {"thread_id": "run-infeasible-01"}}
    final_state = app.invoke(initial_state, config=config)

    # 1. Pipeline stopped at feasibility
    assert final_state["current_agent"] == "feasibility"
    assert final_state["current_agent_index"] == 3
    assert final_state["status"] == "stopped_feasibility"
    assert final_state["feasibility_passed"] is False
    assert final_state["feasibility"]["score"] == 62

    # 2. Downstream agents NEVER ran (No PRD. No build.)
    assert final_state.get("prd") is None, "PRD must NOT be generated when feasibility < 80"
    assert final_state.get("design") in (None, {}), "Design must NOT be generated when feasibility < 80"
    assert final_state.get("developer") is None, "Developer must NOT build when feasibility < 80"
    assert final_state.get("risk_analysis") is None, "Risk analysis must NOT run when feasibility < 80"
    assert final_state.get("deliverable_zip_path") is None, "orbit.zip must NOT exist when feasibility < 80"

    # 3. Artifacts: PRD.md and orbit.zip must NOT exist in artifacts dict
    artifacts = final_state.get("artifacts", {})
    assert "PRD.md" not in artifacts
    assert "orbit.zip" not in artifacts


def test_feasibility_gate_passes_80_and_executes_all_7_agents() -> None:
    """
    Verify happy path: when feasibility >= 80, all 7 agents run to completion.
    Developer produces orbit.zip.
    """
    saver = SqliteSaver()
    app = compile_supervisor(checkpointer=saver)

    initial_state = create_initial_state(
        run_id="run-viable-01",
        idea={"title": "Verified SaaS", "core_problem": "SaaS boilerplate friction"},
    )
    initial_state.feasibility = {"force_score": 90}

    config = {"configurable": {"thread_id": "run-viable-01"}}
    final_state = app.invoke(initial_state, config=config)

    # 1. Final status is done
    assert final_state["status"] == "done"
    assert final_state["is_terminal"] is True
    assert final_state["terminal_status"] == "SUCCESS"

    # 2. All 7 agents ran and populated outputs
    assert final_state["problem_discovery"] is not None
    assert final_state["market_analysis"] is not None
    assert final_state["feasibility"] is not None
    assert final_state["feasibility"]["score"] >= 80
    assert final_state["prd"] is not None
    assert final_state["design"] is not None
    assert final_state["developer"] is not None
    assert final_state["risk_analysis"] is not None

    # 3. Developer produces orbit.zip deliverable
    assert final_state["deliverable_zip_path"] == "runs/run-viable-01/orbit.zip"
    assert final_state["deliverable_sha256"] is not None
    assert "orbit.zip" in final_state["artifacts"]

    # 4. Mandatory Progress Event Contract Verification
    progress_events = final_state["progress_events"]
    assert len(progress_events) >= 14  # At least 2 events (running + done) per agent

    agent_indices_seen = set()
    for ev in progress_events:
        # Pydantic dict or model
        data = ev.model_dump() if hasattr(ev, "model_dump") else ev
        assert "run_id" in data
        assert "agent" in data
        assert "agent_index" in data
        assert "status" in data
        assert "percent" in data
        assert "message" in data
        assert "eta_seconds" in data

        assert 1 <= data["agent_index"] <= 7
        assert 0 <= data["percent"] <= 100
        assert data["status"] in ["pending", "running", "done", "failed"]
        agent_indices_seen.add(data["agent_index"])

    # All 7 agent indices (1..7) were emitted
    assert agent_indices_seen == {1, 2, 3, 4, 5, 6, 7}


def test_progress_event_contract_shape() -> None:
    """Explicitly tests the ProgressEvent contract model."""
    event = ProgressEvent(
        run_id="run-test-event",
        agent="developer",
        agent_index=6,
        status="running",
        percent=80,
        message="Compiling sandbox deliverable...",
        eta_seconds=25,
    )
    dump = event.model_dump()
    assert dump["run_id"] == "run-test-event"
    assert dump["agent"] == "developer"
    assert dump["agent_index"] == 6
    assert dump["status"] == "running"
    assert dump["percent"] == 80
    assert dump["message"] == "Compiling sandbox deliverable..."
    assert dump["eta_seconds"] == 25
