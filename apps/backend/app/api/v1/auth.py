"""Authentication endpoints for Customer Founders and Single Administrator."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Cookie, Depends, Request, Response
from fastapi.security import OAuth2PasswordRequestForm

from app.api.dependencies import CurrentUser, DbSession
from app.core.config import get_settings
from app.core.errors import AuthenticationError, AuthorizationError
from app.core.security import InvalidTokenError, decode_token
from app.models.user import User
from app.schemas.auth import (
    AdminLoginRequest,
    CustomerLoginRequest,
    CustomerRegisterRequest,
    ForgotPasswordRequest,
    GoogleOAuthRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()
REFRESH_COOKIE = "refresh_token"


def _set_refresh_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        REFRESH_COOKIE,
        token,
        max_age=settings.refresh_token_expire_days * 86400,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        path="/v1/auth",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(REFRESH_COOKIE, path="/v1/auth")


async def _issue_response(
    response: Response, request: Request, db: DbSession, user: User
) -> TokenResponse:
    access, refresh = await AuthService(db).issue_tokens(
        user,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )
    _set_refresh_cookie(response, refresh)
    return TokenResponse(
        access_token=access,
        expires_in=get_settings().access_token_expire_minutes * 60,
        user=UserResponse.model_validate(user),
    )


# ─── 1. CUSTOMER FOUNDER AUTHENTICATION ─────────────────────────────────────

@router.post("/customer/register", response_model=TokenResponse, status_code=201, summary="Customer Founder Registration")
@router.post("/register", response_model=TokenResponse, status_code=201, summary="Founder Registration")
async def register_customer(
    data: CustomerRegisterRequest | RegisterRequest, request: Request, response: Response, db: DbSession
) -> TokenResponse:
    """
    Registers a new founder customer.
    Rule: Admin cannot register through this route.
    """
    user = await AuthService(db).register(data)
    return await _issue_response(response, request, db, user)


@router.post("/customer/login", response_model=TokenResponse, summary="Customer Founder Login")
@router.post("/login", response_model=TokenResponse, summary="Founder Login")
async def login_customer(
    data: CustomerLoginRequest | LoginRequest, request: Request, response: Response, db: DbSession
) -> TokenResponse:
    """Authenticates a customer founder."""
    user = await AuthService(db).authenticate(data)
    return await _issue_response(response, request, db, user)


# ─── 2. DEDICATED ADMIN AUTHENTICATION ──────────────────────────────────────

@router.post("/admin/login", response_model=TokenResponse, summary="Single Administrator Login")
async def login_admin(
    data: AdminLoginRequest, request: Request, response: Response, db: DbSession
) -> TokenResponse:
    """
    Dedicated login endpoint for the single system administrator.
    Guarantees that only users with role == 'admin' are granted tokens.
    Non-admin accounts are rejected with 403 Forbidden.
    """
    user = await AuthService(db).authenticate_admin(data)
    return await _issue_response(response, request, db, user)


@router.post("/login/form", response_model=TokenResponse, include_in_schema=False)
async def login_form(
    request: Request,
    response: Response,
    db: DbSession,
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> TokenResponse:
    user = await AuthService(db).authenticate(LoginRequest(email=form.username, password=form.password))
    return await _issue_response(response, request, db, user)


# ─── 3. SESSION MANAGEMENT & OAUTH ──────────────────────────────────────────

@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    request: Request,
    response: Response,
    db: DbSession,
    refresh_token: str | None = Cookie(default=None),
) -> TokenResponse:
    if not refresh_token:
        raise AuthenticationError("Refresh cookie is required")
    try:
        payload = decode_token(refresh_token, "refresh")
        user_id = UUID(str(payload["sub"]))
        session_id = UUID(str(payload["sid"]))
    except (InvalidTokenError, KeyError, TypeError, ValueError) as exc:
        raise AuthenticationError("Refresh session is invalid or expired") from exc
    user, access, rotated = await AuthService(db).rotate_refresh_token(
        refresh_token=refresh_token, user_id=user_id, session_id=session_id
    )
    _set_refresh_cookie(response, rotated)
    return TokenResponse(
        access_token=access,
        expires_in=get_settings().access_token_expire_minutes * 60,
        user=UserResponse.model_validate(user),
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(
    response: Response,
    db: DbSession,
    refresh_token: str | None = Cookie(default=None),
) -> MessageResponse:
    if refresh_token:
        try:
            payload = decode_token(refresh_token, "refresh")
            await AuthService(db).revoke_session(UUID(str(payload["sid"])), refresh_token)
        except (InvalidTokenError, KeyError, TypeError, ValueError):
            pass
    _clear_refresh_cookie(response)
    return MessageResponse(detail="Logged out")


@router.get("/me", response_model=UserResponse)
async def me(current_user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(data: ForgotPasswordRequest, db: DbSession) -> MessageResponse:
    reset_token = await AuthService(db).request_password_reset(data)
    settings = get_settings()
    if reset_token and not settings.is_production:
        return MessageResponse(
            detail=f"Reset token generated for testing: {reset_token}"
        )
    return MessageResponse(
        detail="If an account exists with that email address, password reset instructions have been sent."
    )


@router.post("/reset-password", response_model=TokenResponse)
async def reset_password(
    data: ResetPasswordRequest, request: Request, response: Response, db: DbSession
) -> TokenResponse:
    user = await AuthService(db).reset_password(data)
    return await _issue_response(response, request, db, user)


@router.post("/oauth/google", response_model=TokenResponse)
async def oauth_google(
    data: GoogleOAuthRequest, request: Request, response: Response, db: DbSession
) -> TokenResponse:
    user = await AuthService(db).authenticate_google(data)
    return await _issue_response(response, request, db, user)
