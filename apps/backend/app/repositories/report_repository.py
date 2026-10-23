"""
Data access for Report. `get_latest_by_type` backs "get the current PRD /
Market Validation Report / etc. for this project" — the query pattern every
sub-dashboard (PRD, Roadmap, Financials) uses to render its data.
"""
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.report import Report
from app.repositories.base_repository import BaseRepository


class ReportRepository(BaseRepository[Report]):
    model = Report

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def list_for_project(
        self, project_id: UUID, *, report_type: str | None = None
    ) -> list[Report]:
        query = select(Report).where(Report.project_id == project_id)
        if report_type:
            query = query.where(Report.report_type == report_type)
        result = await self.session.execute(query.order_by(Report.created_at.desc()))
        return list(result.scalars().all())

    async def get_latest_by_type(self, project_id: UUID, report_type: str) -> Report | None:
        result = await self.session.execute(
            select(Report)
            .where(Report.project_id == project_id, Report.report_type == report_type)
            .order_by(Report.version.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
