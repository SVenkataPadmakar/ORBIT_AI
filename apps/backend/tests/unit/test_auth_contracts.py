"""Focused tests for authentication primitives and request contracts."""
from uuid import uuid4

import pytest
from app.core.config import Settings
from app.core.security import InvalidTokenError, create_token, decode_token
from app.schemas.auth import LoginRequest, RegisterRequest
from pydantic import ValidationError


def test_register_normalizes_email_and_enforces_password_length() -> None:
    request = RegisterRequest(email="  Founder@Example.COM ", password="strong-pass")

    assert request.email == "founder@example.com"
    with pytest.raises(ValidationError):
        RegisterRequest(email="founder@example.com", password="short")


def test_login_normalizes_email() -> None:
    request = LoginRequest(email=" Founder@Example.COM ", password="password")

    assert request.email == "founder@example.com"


def test_token_type_is_enforced() -> None:
    subject = uuid4()
    access_token = create_token(subject, "access")

    assert decode_token(access_token, "access")["sub"] == str(subject)
    with pytest.raises(InvalidTokenError):
        decode_token(access_token, "refresh")


def test_development_cors_supports_both_loopback_hostnames() -> None:
    settings = Settings(_env_file=None)

    assert "http://localhost:3000" in settings.cors_allowed_origins
    assert "http://127.0.0.1:3000" in settings.cors_allowed_origins


def test_new_auth_schemas_normalize_and_validate() -> None:
    from app.schemas.auth import (
        ForgotPasswordRequest,
        GoogleOAuthRequest,
        OtpSendRequest,
        OtpVerifyRequest,
        ResetPasswordRequest,
    )

    otp_send = OtpSendRequest(email="  FOUNDER@ORBIT.AI  ")
    assert otp_send.email == "founder@orbit.ai"

    otp_verify = OtpVerifyRequest(email="FOUNDER@ORBIT.AI", code="123456")
    assert otp_verify.email == "founder@orbit.ai"
    assert otp_verify.code == "123456"

    # code length validation (min_length=4)
    with pytest.raises(ValidationError):
        OtpVerifyRequest(email="founder@orbit.ai", code="12")

    forgot = ForgotPasswordRequest(email=" Test@Orbit.AI ")
    assert forgot.email == "test@orbit.ai"

    reset = ResetPasswordRequest(token="sample-token", password="new-strong-password")
    assert reset.token == "sample-token"
    assert reset.password == "new-strong-password"

    with pytest.raises(ValidationError):
        ResetPasswordRequest(token="sample-token", password="short")

    oauth = GoogleOAuthRequest(credential="mock_token_abc")
    assert oauth.credential == "mock_token_abc"


def test_reset_password_token_type_enforced() -> None:
    subject = uuid4()
    reset_token = create_token(subject, "reset_password")

    payload = decode_token(reset_token, "reset_password")
    assert payload["sub"] == str(subject)
    assert payload["type"] == "reset_password"

    with pytest.raises(InvalidTokenError):
        decode_token(reset_token, "access")

