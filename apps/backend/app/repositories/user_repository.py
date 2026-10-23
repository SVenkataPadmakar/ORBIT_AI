"""
Data access for User. Auth flows (register/login/OAuth, built out in the
authentication phase) go through this repository rather than querying
`User` directly, so the "find by email" / "find by OAuth identity" patterns
used across register/login/password-reset live in exactly one place.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    model = User

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_by_email(self, email: str) -> User | None:
        result = await self.session.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_oauth_identity(self, provider: str, provider_id: str) -> User | None:
        result = await self.session.execute(
            select(User).where(User.auth_provider == provider, User.oauth_provider_id == provider_id)
        )
        return result.scalar_one_or_none()
