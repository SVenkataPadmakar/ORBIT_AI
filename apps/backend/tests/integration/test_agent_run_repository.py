"""
Integration tests for AgentRunRepository — confirms the status-transition
helpers (mark_started/mark_completed/mark_failed) and the pipeline/project
list queries work end-to-end against a real database, including the JSONB
structured_output round trip.
"""
import uuid

import pytest

from app.models.agent import Agent
from app.models.agent_run import AgentRun
from app.models.project import Project
from app.models.user import User
from app.repositories.agent_repository import AgentRepository
from app.repositories.agent_run_repository import AgentRunRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.user_repository import UserRepository


async def _make_project(db_session) -> Project:
    user = await UserRepository(db_session).add(User(email=f"{uuid.uuid4()}@example.com", hashed_password="x"))
    project = await ProjectRepository(db_session).add(
        Project(owner_id=user.id, name="Test Project", idea_description="idea")
    )
    await db_session.commit()
    return project


@pytest.mark.asyncio
async def test_mark_completed_updates_status_and_output(db_session):
    project = await _make_project(db_session)
    agent = await AgentRepository(db_session).add(
        Agent(key="problem_discovery", name="Problem Discovery Agent")
    )
    await db_session.commit()

    run_repo = AgentRunRepository(db_session)
    pipeline_run_id = uuid.uuid4()
    run = await run_repo.add(
        AgentRun(project_id=project.id, agent_id=agent.id, pipeline_run_id=pipeline_run_id)
    )
    await db_session.commit()
    assert run.status == "queued"

    await run_repo.mark_started(run)
    assert run.status == "running"
    assert run.started_at is not None

    await run_repo.mark_completed(
        run,
        structured_output={"problem_statement": "Meal planning for chronic conditions is fragmented."},
        tokens_used=1200,
        cost_usd=0.03,
    )
    assert run.status == "success"
    assert run.structured_output == {
        "problem_statement": "Meal planning for chronic conditions is fragmented."
    }
    assert run.completed_at is not None


@pytest.mark.asyncio
async def test_mark_failed_records_error_message(db_session):
    project = await _make_project(db_session)
    agent = await AgentRepository(db_session).add(Agent(key="finance", name="Finance Agent"))
    await db_session.commit()

    run_repo = AgentRunRepository(db_session)
    run = await run_repo.add(
        AgentRun(project_id=project.id, agent_id=agent.id, pipeline_run_id=uuid.uuid4())
    )
    await db_session.commit()

    await run_repo.mark_failed(run, error_message="OpenAI API timeout after 3 retries")

    assert run.status == "failed"
    assert run.error_message == "OpenAI API timeout after 3 retries"


@pytest.mark.asyncio
async def test_list_for_pipeline_groups_runs_by_pipeline_run_id(db_session):
    project = await _make_project(db_session)
    agent_repo = AgentRepository(db_session)
    problem_agent = await agent_repo.add(Agent(key="problem_discovery", name="Problem Discovery Agent"))
    market_agent = await agent_repo.add(Agent(key="market_research", name="Market Research Agent"))
    await db_session.commit()

    run_repo = AgentRunRepository(db_session)
    pipeline_run_id = uuid.uuid4()
    other_pipeline_run_id = uuid.uuid4()

    await run_repo.add(AgentRun(project_id=project.id, agent_id=problem_agent.id, pipeline_run_id=pipeline_run_id))
    await run_repo.add(AgentRun(project_id=project.id, agent_id=market_agent.id, pipeline_run_id=pipeline_run_id))
    await run_repo.add(AgentRun(project_id=project.id, agent_id=problem_agent.id, pipeline_run_id=other_pipeline_run_id))
    await db_session.commit()

    runs = await run_repo.list_for_pipeline(pipeline_run_id)

    assert len(runs) == 2
    assert {r.pipeline_run_id for r in runs} == {pipeline_run_id}
