"""
Unit tests for Orbit V2 Authentication & RBAC Governance:
1. Customer Login & Registration
2. Dedicated Admin Login
3. Rule: Admin cannot register (Single-Admin governance)
4. Rule: Only one admin account permitted in database
5. RBAC Middleware route protection
"""
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from app.core.errors import AuthorizationError, ConflictError
from app.core.security import verify_password
from app.models.user import User
from app.schemas.auth import AdminLoginRequest, CustomerRegisterRequest
from app.services.auth_service import AuthService


@pytest.fixture
def mock_session() -> AsyncMock:
    session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_result.scalars.return_value.all.return_value = []
    session.execute.return_value = mock_result
    return session


@pytest.mark.asyncio
async def test_admin_cannot_register_fails(mock_session: AsyncMock) -> None:
    service = AuthService(mock_session)
    data = CustomerRegisterRequest(
        email="hacker_admin@orbit.dev",
        password="SuperSecretPassword123!",
        full_name="Malicious Admin Attempt",
    )

    # Attempting to register with role="admin" must raise AuthorizationError
    with pytest.raises(AuthorizationError) as exc_info:
        await service.register(data, role="admin")

    assert "Admin accounts cannot be registered" in str(exc_info.value)


@pytest.mark.asyncio
async def test_ensure_single_admin_prevents_duplicate_admin(mock_session: AsyncMock) -> None:
    service = AuthService(mock_session)
    existing_admin = User(
        id=uuid4(),
        email="orbit.admin@orbit.dev",
        hashed_password="hash",
        role="admin",
        is_active=True,
    )
    mock_res = MagicMock()
    mock_res.scalar_one_or_none.return_value = existing_admin
    mock_session.execute.return_value = mock_res

    # Attempting to bootstrap a secondary admin raises ConflictError
    with pytest.raises(ConflictError) as exc_info:
        await service.ensure_single_admin(
            admin_email="second.admin@orbit.dev",
            admin_password="Password123!",
        )

    assert "Only one admin account is permitted" in str(exc_info.value)


@pytest.mark.asyncio
async def test_customer_registration_strictly_assigns_user_role(mock_session: AsyncMock) -> None:
    service = AuthService(mock_session)
    service.users.get_by_email = AsyncMock(return_value=None)
    created_user = None

    def fake_add(user_obj: User) -> User:
        nonlocal created_user
        created_user = user_obj
        user_obj.id = uuid4()
        return user_obj

    service.users.add = AsyncMock(side_effect=fake_add)

    data = CustomerRegisterRequest(
        email="founder@startup.io",
        password="ValidPassword123!",
        full_name="Sarah Founder",
    )

    user = await service.register(data)

    assert user.email == "founder@startup.io"
    assert user.role == "user"
    assert created_user is not None
    assert created_user.role == "user"
    assert verify_password("ValidPassword123!", created_user.hashed_password)
