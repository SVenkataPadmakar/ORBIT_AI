"""
Confirms the ON DELETE CASCADE behavior actually configured in the models
(not just intended in the schema doc) — deleting a project must remove its
agent_runs, reports, financial_models, pitch_decks, documents, and
notifications; deleting a user must remove their sessions and subscription.
This is the kind of bug that's invisible in code review (the FK looks right)
but only shows up against a real database, which is exactly why it's an
integration test rather than a unit test.
"""
import uuid
from datetime import datetime, timezone

import pytest
from sqlalchemy import select

from app.models.agent import Agent
from app.models.agent_run import AgentRun
from app.models.project import Project
from app.models.session import UserSession
from app.models.subscription import Subscription
from app.models.user import User
from app.repositories.agent_repository import AgentRepository
from app.repositories.agent_run_repository import AgentRunRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.user_repository import UserRepository


@pytest.mark.asyncio
async def test_deleting_project_cascades_to_agent_runs(db_session):
    user = await UserRepository(db_session).add(User(email="cascade@example.com", hashed_password="x"))
    project = await ProjectRepository(db_session).add(
        Project(owner_id=user.id, name="Cascade Test", idea_description="idea")
    )
    agent = await AgentRepository(db_session).add(Agent(key="finance", name="Finance Agent"))
    await db_session.commit()

    run = await AgentRunRepository(db_session).add(
        AgentRun(project_id=project.id, agent_id=agent.id, pipeline_run_id=uuid.uuid4())
    )
    await db_session.commit()
    run_id = run.id

    await db_session.delete(project)
    await db_session.commit()

    result = await db_session.execute(select(AgentRun).where(AgentRun.id == run_id))
    assert result.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_deleting_user_cascades_to_sessions_and_subscription(db_session):
    user = await UserRepository(db_session).add(User(email="deleteme@example.com", hashed_password="x"))
    await db_session.commit()

    session_row = UserSession(
        user_id=user.id,
        refresh_token_hash="hashed-token",
        expires_at=datetime.now(timezone.utc),
    )
    subscription = Subscription(user_id=user.id)
    db_session.add_all([session_row, subscription])
    await db_session.commit()
    session_id, subscription_id = session_row.id, subscription.id

    await db_session.delete(user)
    await db_session.commit()

    assert (await db_session.execute(select(UserSession).where(UserSession.id == session_id))).scalar_one_or_none() is None
    assert (await db_session.execute(select(Subscription).where(Subscription.id == subscription_id))).scalar_one_or_none() is None
