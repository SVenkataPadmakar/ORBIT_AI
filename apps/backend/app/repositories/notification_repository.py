"""
Data access for Notification. `list_unread_for_user` backs the bell-icon
unread count/list; `mark_all_read` is an atomic bulk update rather than a
fetch-then-update-each-in-a-loop.
"""
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.repositories.base_repository import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    model = Notification

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def list_unread_for_user(self, user_id: UUID, *, limit: int = 50) -> list[Notification]:
        result = await self.session.execute(
            select(Notification)
            .where(Notification.user_id == user_id, Notification.is_read.is_(False))
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def mark_all_read(self, user_id: UUID) -> None:
        await self.session.execute(
            update(Notification).where(Notification.user_id == user_id).values(is_read=True)
        )
        await self.session.flush()
