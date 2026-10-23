"""
RBAC Middleware & Role Enforcement.
Guarantees strict separation between Customer Founders and the Single Admin:
1. Admin endpoints (/v1/admin/*) require authenticated JWT with role == 'admin'.
2. Non-admin users attempting to access admin endpoints are blocked with HTTP 403.
3. Unauthenticated requests to protected endpoints return HTTP 401.
"""
from typing import Callable
from uuid import UUID

import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.security import InvalidTokenError, decode_token

logger = structlog.get_logger("middleware.rbac")

PUBLIC_PATH_PREFIXES = (
    "/health",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/v1/auth/customer/login",
    "/v1/auth/customer/register",
    "/v1/auth/login",
    "/v1/auth/register",
    "/v1/auth/admin/login",
    "/v1/auth/refresh",
    "/v1/auth/oauth",
    "/v1/auth/forgot-password",
    "/v1/auth/reset-password",
    "/api/runs",
)


class RBACMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[[Request], Response]) -> Response:
        path = request.url.path

        # 1. Skip completely open public paths
        if any(path.startswith(prefix) for prefix in PUBLIC_PATH_PREFIXES):
            return await call_next(request)

        # 2. Extract Bearer token if present
        auth_header = request.headers.get("authorization")
        token: str | None = None
        if auth_header and auth_header.lower().startswith("bearer "):
            token = auth_header[7:].strip()

        # 3. Handle Admin Routes (/v1/admin/*)
        if path.startswith("/v1/admin"):
            # Allow admin login without bearer token
            if path == "/v1/admin/login":
                return await call_next(request)

            if not token:
                logger.warning("rbac_admin_access_unauthenticated", path=path)
                return JSONResponse(
                    status_code=401,
                    content={
                        "error": {
                            "code": "AUTHENTICATION_ERROR",
                            "message": "Authentication required for admin surface",
                        }
                    },
                )

            try:
                payload = decode_token(token, "access")
                role = payload.get("role", "user")
                if role != "admin":
                    logger.warning(
                        "rbac_admin_access_forbidden",
                        user_id=payload.get("sub"),
                        role=role,
                        path=path,
                    )
                    return JSONResponse(
                        status_code=403,
                        content={
                            "error": {
                                "code": "AUTHORIZATION_ERROR",
                                "message": "Administrator privileges required",
                            }
                        },
                    )
            except InvalidTokenError:
                return JSONResponse(
                    status_code=401,
                    content={
                        "error": {
                            "code": "AUTHENTICATION_ERROR",
                            "message": "Invalid or expired authorization token",
                        }
                    },
                )

        return await call_next(request)
