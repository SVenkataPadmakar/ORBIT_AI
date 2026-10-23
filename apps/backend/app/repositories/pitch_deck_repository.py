"""
Data access for PitchDeck.
"""
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pitch_deck import PitchDeck
from app.repositories.base_repository import BaseRepository


class PitchDeckRepository(BaseRepository[PitchDeck]):
    model = PitchDeck

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_latest_for_project(self, project_id: UUID) -> PitchDeck | None:
        result = await self.session.execute(
            select(PitchDeck)
            .where(PitchDeck.project_id == project_id)
            .order_by(PitchDeck.updated_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
