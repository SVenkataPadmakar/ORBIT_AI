"""Authentication use cases, single-admin governance, and refresh-session rotation."""
import hashlib
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import AuthenticationError, AuthorizationError, ConflictError
from app.core.security import (
    InvalidTokenError,
    create_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.session import UserSession
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    ForgotPasswordRequest,
    GoogleOAuthRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
)


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.users = UserRepository(session)

    async def register(self, data: RegisterRequest, role: str = "user") -> User:
        """
        Registers customer founder accounts.
        Rule: Admin accounts CANNOT register through public registration.
        """
        # Strict enforcement: Public registration is locked to role="user"
        effective_role = role or getattr(data, "role", "user")
        if effective_role == "admin":
            raise AuthorizationError(
                "Admin accounts cannot be registered via public registration. Only one system admin account is permitted via system governance."
            )

        if await self.users.get_by_email(data.email) is not None:
            raise ConflictError("An account with this email already exists")

        user = await self.users.add(
            User(
                email=data.email,
                hashed_password=hash_password(data.password),
                full_name=data.full_name,
                role="user",
                auth_provider="email",
            )
        )
        try:
            await self.session.commit()
        except IntegrityError as exc:
            await self.session.rollback()
            raise ConflictError("An account with this email already exists") from exc
        await self.session.refresh(user)
        return user

    async def authenticate(self, data: LoginRequest) -> User:
        """Standard customer/founder authentication."""
        user = await self.users.get_by_email(data.email)
        if (
            user is None
            or user.hashed_password is None
            or not verify_password(data.password, user.hashed_password)
            or not user.is_active
        ):
            raise AuthenticationError("Invalid email or password")
        return user

    async def authenticate_admin(self, data: LoginRequest) -> User:
        """
        Dedicated Single Admin Authentication.
        Validates email/password AND guarantees role == 'admin'.
        Non-admins attempting to use the admin login portal are rejected with AuthorizationError.
        """
        user = await self.authenticate(data)
        if user.role != "admin":
            raise AuthorizationError("Access denied: Administrator privileges required")
        return user

    async def ensure_single_admin(
        self,
        admin_email: str,
        admin_password: str,
        full_name: str = "Orbit System Administrator",
    ) -> User:
        """
        Rule: Exactly ONE admin account is permitted in the system.
        Bootstraps the single designated admin if not present.
        If an admin account already exists, returns it without creating a duplicate.
        """
        result = await self.session.execute(
            select(User).where(User.role == "admin").limit(1)
        )
        existing_admin = result.scalar_one_or_none()
        if existing_admin is not None:
            if existing_admin.email.strip().lower() != admin_email.strip().lower():
                raise ConflictError("Only one admin account is permitted in Orbit. An admin account already exists.")
            return existing_admin

        # Create the solitary authorized administrator
        admin = User(
            email=admin_email.strip().lower(),
            hashed_password=hash_password(admin_password),
            full_name=full_name,
            role="admin",
            email_verified=True,
            auth_provider="email",
        )
        self.session.add(admin)
        await self.session.commit()
        await self.session.refresh(admin)
        return admin

    async def issue_tokens(
        self,
        user: User,
        *,
        user_agent: str | None,
        ip_address: str | None,
    ) -> tuple[str, str]:
        settings = get_settings()
        session_id = uuid4()
        refresh_token = create_token(user.id, "refresh", {"sid": str(session_id)})
        device_session = UserSession(
            id=session_id,
            user_id=user.id,
            refresh_token_hash=_token_hash(refresh_token),
            user_agent=user_agent,
            ip_address=ip_address,
            expires_at=datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days),
        )
        self.session.add(device_session)
        await self.session.commit()
        # Embed user role directly in the access token claims for RBAC middleware
        access_token = create_token(user.id, "access", {"role": user.role})
        return access_token, refresh_token

    async def rotate_refresh_token(
        self,
        *,
        refresh_token: str,
        user_id: UUID,
        session_id: UUID,
    ) -> tuple[User, str, str]:
        result = await self.session.execute(
            select(UserSession)
            .where(
                UserSession.id == session_id,
                UserSession.user_id == user_id,
                UserSession.refresh_token_hash == _token_hash(refresh_token),
                UserSession.revoked_at.is_(None),
            )
        )
        device_session = result.scalar_one_or_none()
        if device_session is None or device_session.is_expired:
            raise AuthenticationError("Refresh session is invalid or expired")

        user = await self.users.get(user_id)
        if user is None or not user.is_active:
            raise AuthenticationError("User is no longer active")

        # Invalidate old session and generate rotated credentials
        device_session.revoked_at = datetime.now(UTC)
        new_session_id = uuid4()
        new_refresh = create_token(user.id, "refresh", {"sid": str(new_session_id)})
        settings = get_settings()
        self.session.add(
            UserSession(
                id=new_session_id,
                user_id=user.id,
                refresh_token_hash=_token_hash(new_refresh),
                user_agent=device_session.user_agent,
                ip_address=device_session.ip_address,
                expires_at=datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days),
            )
        )
        await self.session.commit()
        access_token = create_token(user.id, "access", {"role": user.role})
        return user, access_token, new_refresh

    async def revoke_session(self, session_id: UUID, refresh_token: str) -> None:
        result = await self.session.execute(
            select(UserSession)
            .where(
                UserSession.id == session_id,
                UserSession.refresh_token_hash == _token_hash(refresh_token),
                UserSession.revoked_at.is_(None),
            )
        )
        device_session = result.scalar_one_or_none()
        if device_session is not None:
            device_session.revoked_at = datetime.now(UTC)
            await self.session.commit()

    async def request_password_reset(self, data: ForgotPasswordRequest) -> str | None:
        user = await self.users.get_by_email(data.email)
        if user is None:
            # Prevent email enumeration: return generic message/None
            return None

        # Issue 1-hour signed reset token
        reset_token = create_token(user.id, "reset_password", {"email": user.email})
        return reset_token

    async def reset_password(self, data: ResetPasswordRequest) -> User:
        try:
            payload = decode_token(data.token, "reset_password")
            user_id = UUID(str(payload["sub"]))
        except (InvalidTokenError, KeyError, TypeError, ValueError) as exc:
            raise AuthenticationError("Password reset link is invalid or has expired") from exc

        user = await self.users.get(user_id)
        if user is None or not user.is_active:
            raise AuthenticationError("User account not found or inactive")

        user.hashed_password = hash_password(data.password)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def authenticate_google(self, data: GoogleOAuthRequest) -> User:
        email = data.email
        full_name = data.full_name
        avatar_url = data.avatar_url
        oauth_id = None

        if data.credential:
            try:
                from jose import jwt as jose_jwt
                claims = jose_jwt.get_unverified_claims(data.credential)
                email = claims.get("email", email)
                full_name = claims.get("name", full_name)
                avatar_url = claims.get("picture", avatar_url)
                oauth_id = claims.get("sub")
            except Exception:
                pass

        if not email:
            raise AuthenticationError("Could not retrieve verified email from Google authentication")

        email = email.strip().lower()
        user = await self.users.get_by_email(email)
        if user is None:
            user = await self.users.add(
                User(
                    email=email,
                    hashed_password=None,
                    full_name=full_name or email.split("@")[0].title(),
                    avatar_url=avatar_url,
                    role="user",
                    auth_provider="google",
                    oauth_provider_id=oauth_id,
                    email_verified=True,
                )
            )
            await self.session.commit()
            await self.session.refresh(user)
        else:
            if avatar_url and not user.avatar_url:
                user.avatar_url = avatar_url
            if not user.email_verified:
                user.email_verified = True
            await self.session.commit()
            await self.session.refresh(user)

        return user
