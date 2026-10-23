"""
Database initialization helpers.

`create_all` is a dev/test convenience — it creates every table directly
from ORM metadata, bypassing Alembic entirely. Production and staging always
go through Alembic migrations (`make migrate`, or the CI/CD migration task
in the deploy workflow) — this function exists for fast local iteration and
for the test suite's schema setup, never for a real environment.

`ensure_extensions` enables the Postgres extensions the schema depends on
(pgcrypto, for `gen_random_uuid()` used as every primary key's default).
Alembic's initial migration also enables it, so this is mainly useful for
scripts/tests that create tables directly via `create_all` without running
migrations first.
"""
import structlog
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine

import app.models  # noqa: F401 - populates Base.metadata
from app.db.base import Base
from app.db.session import engine

logger = structlog.get_logger("db.init")


async def ensure_extensions(target_engine: AsyncEngine = engine) -> None:
    async with target_engine.begin() as conn:
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "pgcrypto"'))
    logger.info("db.extensions_ensured")


async def create_all(target_engine: AsyncEngine = engine) -> None:
    """Dev/test only — production and staging use Alembic migrations exclusively."""
    await ensure_extensions(target_engine)
    async with target_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("db.tables_created", table_count=len(Base.metadata.tables))


async def drop_all(target_engine: AsyncEngine = engine) -> None:
    """Dev/test only — tears down every table. Never call this against staging/production."""
    async with target_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    logger.info("db.tables_dropped")
