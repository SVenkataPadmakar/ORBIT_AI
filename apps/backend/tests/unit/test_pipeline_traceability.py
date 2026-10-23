"""
Unit tests for 7-Stage Pipeline Traceability and LangGraph Orchestration.
Guarantees Zero Black-Box Execution:
IDEA -> VALIDATION -> PRODUCT -> ARCHITECTURE -> SPRINTS -> LAUNCH -> GROWTH
Every stage must show: inputs, outputs, confidence, reasoning, evidence, next_steps.
"""
from datetime import datetime, timezone
from uuid import uuid4

import pytest

from app.orchestration.agent_graph import run_agent_workflow
from app.schemas.pipeline_traceability import (
    FullPipelineTraceabilityResponse,
    StageEvidenceItem,
    StageTraceabilityResponse,
)


@pytest.mark.asyncio
async def test_full_pipeline_seven_stages_traceability() -> None:
    project_id = str(uuid4())
    project_name = "Hyperion AI"
    ctx = {
        "idea_description": "Autonomous AI platform for high-velocity software startups",
        "target_audience": "Technical Founders",
        "industry": "Developer Enablement",
        "goals": "Reach $50k MRR in 6 months",
    }

    result = await run_agent_workflow(project_id, project_name, ctx)

    assert result["project_name"] == project_name
    assert "stages" in result
    stages = result["stages"]

    required_stages = [
        "idea",
        "validation",
        "product",
        "architecture",
        "sprints",
        "launch",
        "growth",
    ]

    for stage_name in required_stages:
        assert stage_name in stages, f"Stage '{stage_name}' missing from pipeline execution"
        stg = stages[stage_name]

        # Verify all 6 mandatory traceability properties
        assert "inputs" in stg, f"inputs missing in stage {stage_name}"
        assert "outputs" in stg, f"outputs missing in stage {stage_name}"
        assert "confidence" in stg, f"confidence missing in stage {stage_name}"
        assert "reasoning" in stg, f"reasoning missing in stage {stage_name}"
        assert "evidence" in stg, f"evidence missing in stage {stage_name}"
        assert "next_steps" in stg, f"next_steps missing in stage {stage_name}"

        # Verify confidence score bounds
        assert 0 <= stg["confidence"] <= 100
        # Verify reasoning is substantive
        assert len(stg["reasoning"]) > 20
        # Verify evidence items structure
        assert isinstance(stg["evidence"], list)
        assert len(stg["evidence"]) >= 1
        for ev in stg["evidence"]:
            assert "claim" in ev
            assert "source" in ev
            assert "confidence" in ev
        # Verify next steps are actionable
        assert isinstance(stg["next_steps"], list)
        assert len(stg["next_steps"]) >= 1


def test_pipeline_traceability_pydantic_schema_validation() -> None:
    pid = uuid4()
    evidence_item = StageEvidenceItem(
        claim="SAM estimated at $48M with 28% annual market expansion",
        source="Gartner & SEC Filings",
        confidence=94,
        data_type="metric",
        details="Bottom-up analysis across 20,000 mid-market enterprises",
    )

    stage_resp = StageTraceabilityResponse(
        id=uuid4(),
        project_id=pid,
        stage="validation",
        status="completed",
        agent_names=["Market Research Agent"],
        inputs={"thesis": "AI developer tools"},
        outputs={"tam_usd": 240000000.0},
        confidence=92,
        reasoning="Strong empirical demand backed by bottom-up unit economics.",
        evidence=[evidence_item],
        next_steps=["Verify pre-order interest via smoke test"],
    )

    full_resp = FullPipelineTraceabilityResponse(
        project_id=pid,
        project_name="Hyperion AI",
        overall_confidence=92,
        consensus_score=94,
        consensus_status="Verified Consensus",
        stages={"validation": stage_resp},
        debates=[],
        last_updated=datetime.now(timezone.utc),
    )

    assert full_resp.overall_confidence == 92
    assert "validation" in full_resp.stages
    assert full_resp.stages["validation"].confidence == 92
    assert len(full_resp.stages["validation"].evidence) == 1
    assert full_resp.stages["validation"].evidence[0].source == "Gartner & SEC Filings"
