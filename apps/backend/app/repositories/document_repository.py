"""
Data access for Document (exports and uploads).
"""
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document
from app.repositories.base_repository import BaseRepository


class DocumentRepository(BaseRepository[Document]):
    model = Document

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def list_for_project(self, project_id: UUID) -> list[Document]:
        result = await self.session.execute(
            select(Document).where(Document.project_id == project_id).order_by(Document.created_at.desc())
        )
        return list(result.scalars().all())
