"""Ownership-scoped project use cases."""
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.models.project import Project
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.projects = ProjectRepository(session)

    async def create(self, owner_id: UUID, data: ProjectCreate) -> Project:
        project = await self.projects.add(Project(owner_id=owner_id, **data.model_dump()))
        await self.session.commit()
        await self.session.refresh(project)
        return project

    async def get_owned(self, project_id: UUID, owner_id: UUID) -> Project:
        project = await self.projects.get_owned_by(project_id, owner_id)
        if project is None:
            raise NotFoundError("Project not found")
        return project

    async def update(self, project_id: UUID, owner_id: UUID, data: ProjectUpdate) -> Project:
        project = await self.get_owned(project_id, owner_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(project, field, value)
        await self.session.commit()
        await self.session.refresh(project)
        return project

    async def delete(self, project_id: UUID, owner_id: UUID) -> None:
        project = await self.get_owned(project_id, owner_id)
        await self.projects.delete(project)
        await self.session.commit()
