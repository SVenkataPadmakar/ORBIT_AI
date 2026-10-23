"""
Password hashing and JWT encode/decode. This is the ONLY module allowed to
touch the JWT secret or the password hashing context — every other module
calls through these functions.
"""
from datetime import UTC, datetime, timedelta
from typing import Any, Literal, cast
from uuid import UUID, uuid4

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

_pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

TokenType = Literal["access", "refresh", "reset_password"]


class InvalidTokenError(Exception):
    """Raised when a JWT fails signature verification, is expired, or is malformed."""


def hash_password(plain_password: str) -> str:
    return cast(str, _pwd_context.hash(plain_password))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return cast(bool, _pwd_context.verify(plain_password, hashed_password))


def create_token(
    subject: UUID,
    token_type: TokenType,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    settings = get_settings()
    now = datetime.now(UTC)

    if token_type == "access":
        expire = now + timedelta(minutes=settings.access_token_expire_minutes)
    elif token_type == "reset_password":
        expire = now + timedelta(hours=1)
    else:
        expire = now + timedelta(days=settings.refresh_token_expire_days)

    payload: dict[str, Any] = {
        "sub": str(subject),
        "type": token_type,
        "jti": str(uuid4()),
        "iat": now,
        "exp": expire,
    }
    if extra_claims:
        protected_claims = {"sub", "type", "jti", "iat", "exp"}
        if protected_claims.intersection(extra_claims):
            raise ValueError("extra_claims cannot override protected JWT claims")
        payload.update(extra_claims)

    return cast(
        str,
        jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm),
    )


def decode_token(token: str, expected_type: TokenType) -> dict[str, Any]:
    settings = get_settings()
    try:
        payload = cast(
            dict[str, Any],
            jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]),
        )
    except JWTError as exc:
        raise InvalidTokenError(str(exc)) from exc

    if payload.get("type") != expected_type:
        raise InvalidTokenError(
            f"Expected token type '{expected_type}', got '{payload.get('type')}'"
        )
    if not isinstance(payload.get("sub"), str) or not payload["sub"]:
        raise InvalidTokenError("Token subject is missing")
    if not isinstance(payload.get("jti"), str) or not payload["jti"]:
        raise InvalidTokenError("Token identifier is missing")

    return payload
