"""
Data access for the (near-static) Agent reference table.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent import Agent
from app.repositories.base_repository import BaseRepository


class AgentRepository(BaseRepository[Agent]):
    model = Agent

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_by_key(self, key: str) -> Agent | None:
        result = await self.session.execute(select(Agent).where(Agent.key == key))
        return result.scalar_one_or_none()

    async def list_active(self) -> list[Agent]:
        result = await self.session.execute(select(Agent).where(Agent.is_active.is_(True)))
        return list(result.scalars().all())
