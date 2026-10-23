"""
Unit tests for Gemini Permanent AI Co-Founder Explainability Suite.
Tests all 5 core capabilities:
1. Explain decisions
2. Explain architecture
3. Explain roadmap
4. Explain risks
5. Explain agent outputs
"""
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from app.models.project import Project
from app.models.stage_execution import StageExecutionRecord
from app.services.cofounder_service import CofounderService


@pytest.fixture
def mock_db_session() -> AsyncMock:
    session = AsyncMock()
    # Mock execute result
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_result.scalars.return_value.all.return_value = []
    session.execute.return_value = mock_result
    return session


@pytest.fixture
def sample_project() -> Project:
    pid = uuid4()
    uid = uuid4()
    return Project(
        id=pid,
        owner_id=uid,
        name="NovaSync AI",
        idea_description="Autonomous AI infrastructure for high-scale agent orchestration",
        industry="Developer Tools",
        target_audience="Technical Founders & Lead Architects",
        status="active",
    )


@pytest.mark.asyncio
async def test_explain_decision(mock_db_session: AsyncMock, sample_project: Project) -> None:
    service = CofounderService(mock_db_session)
    service.projects.get_owned_by = AsyncMock(return_value=sample_project)

    resp = await service.explain_decision(
        project_id=sample_project.id,
        user_id=sample_project.owner_id,
        decision_id="dec_tech_01",
    )

    assert resp.decision_id == "dec_tech_01"
    assert resp.status == "APPROVED"
    assert len(resp.trade_offs) >= 1
    assert len(resp.rejected_alternatives) >= 1
    assert len(resp.participating_agents) >= 1
    assert len(resp.evidence_sources) >= 1
    assert "NovaSync AI" in resp.explanation or "co-founder" in resp.explanation.lower()
    assert len(resp.recommended_action) > 10


@pytest.mark.asyncio
async def test_explain_architecture(mock_db_session: AsyncMock, sample_project: Project) -> None:
    service = CofounderService(mock_db_session)
    service.projects.get_owned_by = AsyncMock(return_value=sample_project)

    resp = await service.explain_architecture(
        project_id=sample_project.id,
        user_id=sample_project.owner_id,
    )

    assert resp.project_id == sample_project.id
    assert "Zero Black-Box" in resp.summary or "FastAPI" in resp.summary
    assert len(resp.stack_overview) >= 4
    # Check key architectural layers
    layers = {item.get("layer") for item in resp.stack_overview}
    assert "Frontend" in layers
    assert "Backend API" in layers
    assert "Database" in layers
    assert len(resp.technical_risks) >= 2
    assert "PostgreSQL" in resp.data_model_rationale
    assert "RBAC" in resp.security_posture
    assert len(resp.suggested_refinements) >= 1


@pytest.mark.asyncio
async def test_explain_roadmap(mock_db_session: AsyncMock, sample_project: Project) -> None:
    service = CofounderService(mock_db_session)
    service.projects.get_owned_by = AsyncMock(return_value=sample_project)

    resp = await service.explain_roadmap(
        project_id=sample_project.id,
        user_id=sample_project.owner_id,
    )

    assert resp.project_id == sample_project.id
    assert resp.current_stage in ["idea", "validation", "product", "architecture", "sprints", "launch", "growth"]
    assert len(resp.milestones) == 7
    # Verify exact 7 stages exist in order
    milestone_stages = [m["stage"] for m in resp.milestones]
    assert milestone_stages == ["IDEA", "VALIDATION", "PRODUCT", "ARCHITECTURE", "SPRINTS", "LAUNCH", "GROWTH"]
    assert len(resp.critical_path) >= 2
    assert "runway" in resp.runway_alignment.lower()
    assert len(resp.immediate_focus) > 10


@pytest.mark.asyncio
async def test_explain_risks(mock_db_session: AsyncMock, sample_project: Project) -> None:
    service = CofounderService(mock_db_session)
    service.projects.get_owned_by = AsyncMock(return_value=sample_project)

    resp = await service.explain_risks(
        project_id=sample_project.id,
        user_id=sample_project.owner_id,
    )

    assert resp.project_id == sample_project.id
    assert 0 <= resp.overall_risk_score <= 100
    assert len(resp.validation_risks) >= 1
    assert len(resp.technical_risks) >= 1
    assert len(resp.go_to_market_risks) >= 1
    assert len(resp.burn_rate_risks) >= 1
    assert len(resp.prioritized_mitigations) >= 2
    assert "Sentinel" in resp.summary or "Risk" in resp.summary


@pytest.mark.asyncio
async def test_explain_agent_outputs_existing_stage(mock_db_session: AsyncMock, sample_project: Project) -> None:
    service = CofounderService(mock_db_session)
    service.projects.get_owned_by = AsyncMock(return_value=sample_project)

    # Mock stage record in DB
    mock_stage = StageExecutionRecord(
        id=uuid4(),
        project_id=sample_project.id,
        stage="architecture",
        status="completed",
        confidence=96,
        inputs={"product_scope": "Core Engine"},
        outputs={"stack": "FastAPI + PostgreSQL"},
        reasoning="Decoupled state machines guarantee sub-10ms transition times.",
        evidence=[{"claim": "ACID compliance", "source": "PostgreSQL Engine", "confidence": 99}],
        next_steps=["Deploy migration schema"],
    )
    mock_res = MagicMock()
    mock_res.scalar_one_or_none.return_value = mock_stage
    mock_db_session.execute.return_value = mock_res

    resp = await service.explain_agent_outputs(
        project_id=sample_project.id,
        user_id=sample_project.owner_id,
        stage="architecture",
    )

    assert resp.project_id == sample_project.id
    assert resp.stage == "architecture"
    assert resp.confidence_score == 96
    assert resp.reasoning_deep_dive == "Decoupled state machines guarantee sub-10ms transition times."
    assert len(resp.evidence_cited) == 1
    assert resp.evidence_cited[0]["source"] == "PostgreSQL Engine"
    assert "ARCHITECTURE" in resp.cofounder_verdict
