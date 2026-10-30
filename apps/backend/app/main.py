"""
FastAPI application factory.

This is intentionally the only place that constructs the `FastAPI` instance.
Route modules are registered via `app.api.v1.router.api_router`; nothing here
should contain business logic.
"""
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.errors import AppError, app_error_handler
from app.core.logging import configure_logging
from app.db.session import engine
from app.middleware.logging_middleware import RequestLoggingMiddleware
from app.middleware.rbac_middleware import RBACMiddleware

configure_logging()
logger = structlog.get_logger("startup")


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    logger.info("app.startup", environment=settings.environment)
    yield
    await engine.dispose()
    logger.info("app.shutdown")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="AI Startup Copilot API",
        version="0.1.0",
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        lifespan=lifespan,
    )

    app.add_exception_handler(AppError, app_error_handler)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(RBACMiddleware)

    from app.api.runs import router as runs_router

    app.include_router(api_router, prefix=settings.api_v1_prefix)
    app.include_router(runs_router)

    @app.get("/health", tags=["health"])
    @app.get("/healthz", tags=["health"])
    @app.get("/api/health", tags=["health"])
    async def health_check() -> dict[str, str]:
        """
        Liveness + dependency check. Used by the Docker HEALTHCHECK, the ALB
        target group, and local `make up` verification. Confirms the database
        connection is actually usable, not just that the process is running.
        """
        db_status = "ok"
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
        except Exception as exc:  # noqa: BLE001 - health check must never raise
            db_status = f"error: {exc}"

        return {
            "status": "ok" if db_status == "ok" else "degraded",
            "database": db_status,
        }

    return app


app = create_app()
