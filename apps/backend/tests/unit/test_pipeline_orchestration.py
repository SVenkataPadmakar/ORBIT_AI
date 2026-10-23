"""Focused no-network tests for orchestration contracts and deterministic fallback."""
from typing import Any

import pytest
from app.agents.demo import demo_output
from app.agents.providers import model_for_provider, select_provider
from app.core.config import Settings
from app.models.agent_run import AgentRun
from app.schemas.agent_io.pipeline import STAGE_OUTPUT_MODELS
from app.services.pipeline_service import PIPELINE_STAGES, PipelineService
from pydantic import ValidationError


@pytest.fixture
def pipeline_context() -> dict[str, Any]:
    return {
        "project": {
            "id": "00000000-0000-0000-0000-000000000001",
            "name": "FocusFlow",
            "idea_description": "A planning tool for distributed product teams.",
            "industry": "B2B SaaS",
            "target_audience": "distributed product teams",
            "budget_band": "$50k-$100k",
            "goals": "Reach ten paid design partners.",
        },
        "stages": {},
    }


def test_demo_outputs_are_deterministic_and_validate_all_six_stages(
    pipeline_context: dict[str, Any],
) -> None:
    assert tuple(STAGE_OUTPUT_MODELS) == PIPELINE_STAGES

    for stage in PIPELINE_STAGES:
        first = demo_output(stage, pipeline_context)
        second = demo_output(stage, pipeline_context)
        payload = first.model_dump(mode="json")

        assert payload == second.model_dump(mode="json")
        assert payload["stage"] == stage
        assert STAGE_OUTPUT_MODELS[stage].model_validate(payload) == first

        pipeline_context["stages"][stage] = payload


def test_demo_outputs_include_complete_user_facing_artifacts(
    pipeline_context: dict[str, Any],
) -> None:
    product = demo_output("product_strategy", pipeline_context).model_dump()
    finance = demo_output("finance", pipeline_context).model_dump()
    pitch = demo_output("pitch_deck", pipeline_context).model_dump()
    vc = demo_output("vc_evaluation", pipeline_context).model_dump()

    assert len(product["features"]) >= 4
    assert len(product["roadmap"]) == 3
    assert len(finance["forecast"]) == 3
    assert finance["ltv_cac_ratio"] > 3
    assert len(pitch["slides"]) == 12
    assert 0 <= vc["investment_readiness_score"] <= 100
    assert len(vc["diligence_questions"]) >= 5


def test_stage_schema_rejects_invalid_structured_output(
    pipeline_context: dict[str, Any],
) -> None:
    payload = demo_output("vc_evaluation", pipeline_context).model_dump()
    payload["investment_readiness_score"] = 101

    with pytest.raises(ValidationError):
        STAGE_OUTPUT_MODELS["vc_evaluation"].model_validate(payload)


def test_no_provider_keys_selects_deterministic_fallback() -> None:
    settings = Settings(
        environment="test",
        openai_api_key="",
        anthropic_api_key="",
        _env_file=None,
    )

    assert select_provider(settings) is None


def test_provider_model_mapping_does_not_cross_provider_families() -> None:
    class Provider:
        def __init__(self, name: str) -> None:
            self.name = name

        async def generate(self, **_kwargs: Any) -> Any:
            raise AssertionError("No external provider call should occur in this unit test")

    assert model_for_provider(Provider("openai"), "claude-sonnet-4-6") == "gpt-4o-mini"
    assert model_for_provider(Provider("anthropic"), "gpt-4o-mini") == "claude-3-5-sonnet-latest"


def test_pipeline_status_aggregation_handles_legacy_and_failure_states() -> None:
    def run(status: str) -> AgentRun:
        item = AgentRun()
        item.status = status
        return item

    assert PipelineService.aggregate_status([run("queued")]) == "queued"
    assert PipelineService.aggregate_status([run("success"), run("completed")]) == "completed"
    assert PipelineService.aggregate_status([run("success"), run("running")]) == "running"
    assert PipelineService.aggregate_status([run("success"), run("failed")]) == "failed"
