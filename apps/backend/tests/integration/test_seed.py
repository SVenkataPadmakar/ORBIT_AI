"""
Confirms the agent seed script is idempotent — it's re-run on every deploy
(`make seed`), so running it twice must upsert rather than create duplicates.
"""
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.seed import AGENT_SEED_DATA, seed_agents
from app.models.agent import Agent


@pytest.mark.asyncio
async def test_seed_agents_creates_all_six_and_is_idempotent(db_engine):
    await seed_agents()
    await seed_agents()  # run twice on purpose

    async with AsyncSession(bind=db_engine) as session:
        result = await session.execute(select(Agent))
        agents = result.scalars().all()

    assert len(agents) == len(AGENT_SEED_DATA)
    assert {a.key for a in agents} == {a["key"] for a in AGENT_SEED_DATA}
    assert all(a.is_active for a in agents)
