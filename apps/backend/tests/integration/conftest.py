"""
Database fixtures for integration tests.

`db_engine` (session-scoped) creates every table once against the real
Postgres instance pointed to by `DATABASE_URL` (the CI workflow runs an
actual `postgres:16-alpine` service for this — see .github/workflows/ci.yml)
and drops them all at the end of the test session.

`db_session` (function-scoped) wraps each individual test in an outer
transaction on its own connection and rolls it back afterward, so tests
never see each other's data without needing per-test TRUNCATE calls. This
relies on repository code using `session.flush()` rather than
`session.commit()` — which is the convention every repository in
app/repositories follows — so the outer transaction is never prematurely
closed by application code.
"""
from collections.abc import AsyncGenerator

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine

import app.models  # noqa: F401 - populates Base.metadata
from app.core.config import get_settings
from app.db.base import Base


@pytest.fixture(scope="session")
async def db_engine() -> AsyncGenerator[AsyncEngine, None]:
    settings = get_settings()
    engine = create_async_engine(settings.database_url)

    async with engine.begin() as conn:
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "pgcrypto"'))
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def db_session(db_engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    async with db_engine.connect() as connection:
        transaction = await connection.begin()
        session = AsyncSession(bind=connection, expire_on_commit=False)
        try:
            yield session
        finally:
            await session.close()
            await transaction.rollback()
