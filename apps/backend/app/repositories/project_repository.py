"""
Data access for Project. `list_for_owner` backs `GET /projects`.
`get_owned_by` combines the id lookup and ownership check into a single
query, so a route handler can't accidentally fetch-then-check and leave a
window where an unauthorized project is used before the check runs.
"""
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.repositories.base_repository import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    model = Project

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def list_for_owner(
        self,
        owner_id: UUID,
        *,
        status: str | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[Project], int]:
        query = select(Project).where(Project.owner_id == owner_id)
        count_query = select(func.count()).select_from(Project).where(Project.owner_id == owner_id)

        if status:
            query = query.where(Project.status == status)
            count_query = count_query.where(Project.status == status)

        total = (await self.session.execute(count_query)).scalar_one()
        result = await self.session.execute(
            query.order_by(Project.updated_at.desc()).offset(offset).limit(limit)
        )
        return list(result.scalars().all()), total

    async def get_owned_by(self, project_id: UUID, owner_id: UUID) -> Project | None:
        result = await self.session.execute(
            select(Project).where(Project.id == project_id, Project.owner_id == owner_id)
        )
        return result.scalar_one_or_none()
