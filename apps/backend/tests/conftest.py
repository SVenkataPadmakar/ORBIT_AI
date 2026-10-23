"""
Shared pytest fixtures. `client` gives every test an httpx.AsyncClient wired
directly to the FastAPI app via ASGITransport, so tests run against the real
app instance without needing a running server process.
"""
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
