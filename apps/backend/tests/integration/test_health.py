"""
Smoke test proving the app boots and the health endpoint responds. This is the
minimum viable proof that the Phase 1 walking skeleton actually works —
config loads, the app factory constructs successfully, and the route is wired.
"""
import pytest


@pytest.mark.asyncio
async def test_health_check_returns_200(client):
    response = await client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert "status" in body
    assert "database" in body
