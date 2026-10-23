"""Application-level errors with one stable JSON response shape."""
from typing import Any, cast

from fastapi import Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    def __init__(self, status_code: int, code: str, detail: str) -> None:
        self.status_code = status_code
        self.code = code
        self.detail = detail
        super().__init__(detail)


class NotFoundError(AppError):
    def __init__(self, detail: str = "Resource not found") -> None:
        super().__init__(404, "not_found", detail)


class ConflictError(AppError):
    def __init__(self, detail: str) -> None:
        super().__init__(409, "conflict", detail)


class AuthenticationError(AppError):
    def __init__(self, detail: str = "Could not validate credentials") -> None:
        super().__init__(401, "authentication_required", detail)


class AuthorizationError(AppError):
    def __init__(self, detail: str = "You do not have permission to access this resource") -> None:
        super().__init__(403, "forbidden", detail)


class ServiceUnavailableError(AppError):
    def __init__(self, detail: str) -> None:
        super().__init__(503, "service_unavailable", detail)


async def app_error_handler(_request: Request, exc: Exception) -> JSONResponse:
    app_error = cast(AppError, exc)
    content: dict[str, Any] = {
        "error": {"code": app_error.code, "detail": app_error.detail}
    }
    headers = {"WWW-Authenticate": "Bearer"} if app_error.status_code == 401 else None
    return JSONResponse(status_code=app_error.status_code, content=content, headers=headers)
