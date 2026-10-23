"""Tests for Gemini Persistent Co-Founder Intelligence Layer & 4-Layer Memory."""
import uuid
from datetime import UTC, datetime
from unittest.mock import MagicMock

from app.schemas.cofounder_intelligence import (
    AssumptionChallengeRequest,
    AssumptionChallengeResponse,
    CofounderInsight,
    CofounderMemoryState,
    ContradictionAlert,
    DecisionMemoryItem,
    ExecutionMemorySummary,
    ProductMemoryItem,
    ProjectMemory,
    WorkspaceGuidance,
)
from app.services.cofounder_service import CofounderService


def test_cofounder_memory_schemas() -> None:
    proj_id = uuid.uuid4()
    now = datetime.now(UTC)

    pm = ProjectMemory(
        core_thesis="AI Founder OS",
        target_audience="Founders",
        icp_archetype="Series Seed Founders",
        value_proposition="Autonomous execution velocity",
        monetization_model="B2B SaaS $149/mo",
        key_competitors=["Linear", "Jira"],
        tam_estimate="$14B",
    )

    dm = DecisionMemoryItem(
        id="d1",
        timestamp=now,
        category="technical",
        decision="Use FastAPI + Next.js",
        rationale="Speed & typing",
        rejected_alternatives=["Express"],
        trade_offs=["Requires Celery for async tasks"],
        status="active",
    )

    prod_m = ProductMemoryItem(
        component="Mission Control",
        specification="6-Axis Radar & Stage-Gate Timeline",
        technical_stack=["Next.js", "Recharts", "D3"],
        status="shipped",
        artifacts=["RadarHealthVectors.tsx"],
    )

    em = ExecutionMemorySummary(
        sprints_completed=3,
        velocity_trend="+37%",
        critical_bottlenecks=["LLM Caching"],
        agent_efficiency_score=94,
        tasks_closed_total=14,
        tasks_remaining=4,
    )

    contra = ContradictionAlert(
        id="c1",
        severity="warning",
        title="Pricing vs Audience Conflict",
        description="Free users vs enterprise pricing",
        conflicting_elements=["Thesis", "Pricing decision"],
        recommendation="Align sales funnel",
        detected_at=now,
    )

    state = CofounderMemoryState(
        project_id=proj_id,
        project_memory=pm,
        decision_memory=[dm],
        product_memory=[prod_m],
        execution_memory=em,
        active_contradictions=[contra],
        last_synced_at=now,
    )

    assert state.project_id == proj_id
    assert len(state.decision_memory) == 1
    assert state.product_memory[0].component == "Mission Control"
    assert state.execution_memory.agent_efficiency_score == 94
    assert len(state.active_contradictions) == 1


def test_workspace_guidance_contract() -> None:
    guidance = WorkspaceGuidance(
        workspace="mission",
        headline="Executive Velocity Review",
        executive_summary="Velocity is top 8%",
        proactive_insights=[
            CofounderInsight(
                id="i1",
                type="opportunity",
                title="Annual Prepayment Incentive",
                message="Convert 10 pilot founders",
                reasoning="Historical Decision Memory",
                context_workspace="mission",
                action_label="Generate Pilot Agreement",
                action_type="generate_agreement",
                impact_score=92,
            )
        ],
        contradictions=[],
        challenged_assumptions=["Founders onboard self-serve"],
        next_best_actions=["Run pilot simulation"],
    )

    assert guidance.workspace == "mission"
    assert len(guidance.proactive_insights) == 1
    assert guidance.proactive_insights[0].type == "opportunity"
    assert guidance.proactive_insights[0].impact_score == 92


def test_assumption_challenge_contract() -> None:
    req = AssumptionChallengeRequest(
        project_id=uuid.uuid4(),
        assumption="Customers will pay $149/mo without white-glove setup",
    )
    assert "Customers will pay" in req.assumption

    resp = AssumptionChallengeResponse(
        assumption=req.assumption,
        counter_factual_analysis="73% fail without hands-on onboarding",
        vulnerability_score=80,
        historical_conflicts=["Decision to target high-velocity founders"],
        seven_day_experiment="Run 5 pre-order calls with deposit request",
        recommended_action="Validate with smoke test before building",
    )
    assert resp.vulnerability_score == 80
    assert "pre-order" in resp.seven_day_experiment


def test_contradiction_detection_rules() -> None:
    mock_session = MagicMock()
    service = CofounderService(mock_session)

    pm = ProjectMemory(
        core_thesis="A free viral freemium product for all creators",
        target_audience="Creators",
        icp_archetype="Individual creators",
        value_proposition="Free tools",
        monetization_model="Freemium",
        key_competitors=[],
    )
    dm = [
        DecisionMemoryItem(
            id="d1",
            timestamp=datetime.now(UTC),
            category="pricing",
            decision="Establish $149/mo high-touch B2B SaaS tier only",
            rationale="Unit economics",
            status="active",
        )
    ]
    prod_m = []
    em = ExecutionMemorySummary(
        sprints_completed=1,
        velocity_trend="+20%",
        critical_bottlenecks=[],
        agent_efficiency_score=85,
        tasks_closed_total=2,
        tasks_remaining=8,  # > 6 triggers scope vs evidence alert
    )
    plan = {
        "technical_blueprint": {
            "stack": [{"choice": "FastAPI Monolith"}]  # No Redis/Cache triggers LLM cache alert
        }
    }

    alerts = service._detect_contradictions_from_state(pm, dm, prod_m, em, plan)
    alert_ids = [a.id for a in alerts]

    assert "contra_monetization_funnel" in alert_ids
    assert "contra_scope_vs_evidence" in alert_ids
    assert "contra_llm_cache" in alert_ids


def test_guidance_synthesis_all_six_centers() -> None:
    mock_session = MagicMock()
    service = CofounderService(mock_session)

    now = datetime.now(UTC)
    pm = ProjectMemory(
        core_thesis="Enterprise AI Intelligence",
        target_audience="Founders",
        icp_archetype="Series A Founders",
        value_proposition="Speed",
        monetization_model="B2B",
    )
    em = ExecutionMemorySummary(
        sprints_completed=2,
        velocity_trend="+30%",
        critical_bottlenecks=["Sales LOIs"],
        agent_efficiency_score=90,
        tasks_closed_total=10,
        tasks_remaining=3,
    )
    state = CofounderMemoryState(
        project_id=uuid.uuid4(),
        project_memory=pm,
        decision_memory=[],
        product_memory=[],
        execution_memory=em,
        active_contradictions=[],
        last_synced_at=now,
    )

    centers = ["mission", "evidence", "architecture", "sprints", "launch", "growth"]
    for center in centers:
        guidance = service._synthesize_local_guidance(state, center)
        assert guidance.workspace == ("mission" if center == "mission" else center)
        assert len(guidance.proactive_insights) >= 2
        # Check that SWRO types are covered
        types = {i.type for i in guidance.proactive_insights}
        assert len(types.intersection({"suggestion", "warning", "risk", "opportunity"})) >= 2
        assert len(guidance.next_best_actions) >= 2
        assert len(guidance.challenged_assumptions) >= 1
