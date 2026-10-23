"""Authentication dependencies shared by protected API routes."""
from typing import Annotated
from uuid import UUID

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AuthenticationError, AuthorizationError
from app.core.security import InvalidTokenError, decode_token
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/auth/login/form", auto_error=False)
DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    db: DbSession,
    token: Annotated[str | None, Depends(oauth2_scheme)],
) -> User:
    if token is None:
        raise AuthenticationError()
    try:
        payload = decode_token(token, "access")
        user_id = UUID(str(payload["sub"]))
    except (InvalidTokenError, KeyError, TypeError, ValueError) as exc:
        raise AuthenticationError() from exc

    user = await UserRepository(db).get(user_id)
    if user is None or not user.is_active:
        raise AuthenticationError()
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


async def get_admin_user(current_user: CurrentUser) -> User:
    if current_user.role != "admin":
        raise AuthorizationError("Administrator access required")
    return current_user


AdminUser = Annotated[User, Depends(get_admin_user)]
