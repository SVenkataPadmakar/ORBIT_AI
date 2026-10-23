"""
Data access for FinancialModel.
"""
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.financial_model import FinancialModel
from app.repositories.base_repository import BaseRepository


class FinancialModelRepository(BaseRepository[FinancialModel]):
    model = FinancialModel

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_latest_for_project(self, project_id: UUID) -> FinancialModel | None:
        result = await self.session.execute(
            select(FinancialModel)
            .where(FinancialModel.project_id == project_id)
            .order_by(FinancialModel.updated_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
