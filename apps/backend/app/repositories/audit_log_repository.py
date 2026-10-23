"""
Data access for AuditLog. Write-mostly; `list_recent` supports the admin
audit log viewer with optional actor/resource-type filters.
"""
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog
from app.repositories.base_repository import BaseRepository


class AuditLogRepository(BaseRepository[AuditLog]):
    model = AuditLog

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def list_recent(
        self,
        *,
        actor_user_id: UUID | None = None,
        resource_type: str | None = None,
        limit: int = 100,
    ) -> list[AuditLog]:
        query = select(AuditLog)
        if actor_user_id:
            query = query.where(AuditLog.actor_user_id == actor_user_id)
        if resource_type:
            query = query.where(AuditLog.resource_type == resource_type)
        result = await self.session.execute(query.order_by(AuditLog.created_at.desc()).limit(limit))
        return list(result.scalars().all())
