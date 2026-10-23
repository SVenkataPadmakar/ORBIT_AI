"""
Data access for Subscription. `increment_usage` issues an atomic
`UPDATE ... SET agent_runs_used = agent_runs_used + 1` rather than a
read-modify-write, so two concurrent pipeline-run requests from the same
user can't both pass the quota check before either write lands.
"""
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subscription import Subscription
from app.repositories.base_repository import BaseRepository


class SubscriptionRepository(BaseRepository[Subscription]):
    model = Subscription

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_by_user(self, user_id: UUID) -> Subscription | None:
        result = await self.session.execute(select(Subscription).where(Subscription.user_id == user_id))
        return result.scalar_one_or_none()

    async def increment_usage(self, user_id: UUID) -> None:
        await self.session.execute(
            update(Subscription)
            .where(Subscription.user_id == user_id)
            .values(agent_runs_used=Subscription.agent_runs_used + 1)
        )
        await self.session.flush()
