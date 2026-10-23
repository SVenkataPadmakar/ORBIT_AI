"""Pydantic contracts for email/password authentication."""
import re
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

_EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class RegisterRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not _EMAIL_PATTERN.fullmatch(normalized):
            raise ValueError("A valid email address is required")
        return normalized

    @field_validator("full_name")
    @classmethod
    def normalize_full_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not _EMAIL_PATTERN.fullmatch(normalized):
            raise ValueError("A valid email address is required")
        return normalized


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    full_name: str | None
    avatar_url: str | None
    role: str
    is_active: bool
    email_verified: bool
    created_at: datetime
    updated_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class MessageResponse(BaseModel):
    detail: str


class CustomerLoginRequest(LoginRequest):
    """Customer founder login."""
    pass


class CustomerRegisterRequest(RegisterRequest):
    """Customer founder registration (strictly user role; admin registration is forbidden)."""
    pass


class AdminLoginRequest(LoginRequest):
    """Dedicated single-admin authentication request."""
    pass


class ForgotPasswordRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not _EMAIL_PATTERN.fullmatch(normalized):
            raise ValueError("A valid email address is required")
        return normalized


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=8)
    password: str = Field(min_length=8, max_length=128)


class GoogleOAuthRequest(BaseModel):
    credential: str | None = None
    email: str | None = None
    full_name: str | None = None
    avatar_url: str | None = None


class OtpSendRequest(BaseModel):
    """Deprecated: Magic OTP decommissioned in V2 in favor of customer/admin password & OAuth."""
    email: str = Field(min_length=3, max_length=255)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not _EMAIL_PATTERN.fullmatch(normalized):
            raise ValueError("A valid email address is required")
        return normalized


class OtpVerifyRequest(BaseModel):
    """Deprecated: Magic OTP decommissioned in V2 in favor of customer/admin password & OAuth."""
    email: str = Field(min_length=3, max_length=255)
    code: str = Field(min_length=6, max_length=6)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not _EMAIL_PATTERN.fullmatch(normalized):
            raise ValueError("A valid email address is required")
        return normalized

    @field_validator("code")
    @classmethod
    def normalize_code(cls, value: str) -> str:
        code = value.strip()
        if not code.isdigit() or len(code) != 6:
            raise ValueError("A 6-digit numeric OTP code is required")
        return code


