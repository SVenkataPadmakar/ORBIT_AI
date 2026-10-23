"""Focused tests for project mutation contracts and demo output."""
from uuid import uuid4

from app.models.agent import Agent
from app.models.project import Project
from app.schemas.project import ProjectUpdate
from app.services.pipeline_service import PipelineService


def test_partial_project_update_preserves_omitted_fields() -> None:
    update = ProjectUpdate(name="New name")

    assert update.model_dump(exclude_unset=True) == {"name": "New name"}


def test_demo_pipeline_output_is_deterministic_and_provider_free() -> None:
    project = Project(
        id=uuid4(),
        owner_id=uuid4(),
        name="FocusFlow",
        idea_description="A planning tool for distributed teams.",
    )
    agent = Agent(id=uuid4(), key="market_research", name="Market Research Agent")

    output = PipelineService._demo_output(project, agent)
    markdown = PipelineService._demo_markdown(project, agent, output)

    assert output["mode"] == "demo"
    assert output["agent"] == "market_research"
    assert "FocusFlow" in markdown
    assert "no external AI provider was called" in markdown
