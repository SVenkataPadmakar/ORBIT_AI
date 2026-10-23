"""Focused contracts for execution plans, reflection scores, and role guards."""
from types import SimpleNamespace
from uuid import uuid4

import pytest
from app.api.dependencies import get_admin_user
from app.core.errors import AuthorizationError
from app.schemas.execution import ExecutionPlan
from app.services.execution_service import ExecutionService


def test_execution_plan_is_actionable_and_validated() -> None:
    project = SimpleNamespace(
        id=uuid4(), name="AI Resume Builder", target_audience="early-career job seekers"
    )
    plan = ExecutionService._build(project)

    assert isinstance(plan, ExecutionPlan)
    assert plan.validation.passed is True
    assert plan.validation.confidence_score >= 70
    assert plan.validation.missing_information
    assert len(plan.build.tasks) >= 3
    assert all(task.acceptance_criteria for task in plan.build.tasks)
    assert any(item["choice"] == "PostgreSQL + pgvector" for item in plan.technical_blueprint.stack)
    assert plan.launch_checklist


def test_execution_dependencies_reference_existing_tasks() -> None:
    project = SimpleNamespace(id=uuid4(), name="Test Startup", target_audience=None)
    plan = ExecutionService._build(project)
    tasks = [*plan.build.tasks, *plan.launch.tasks, *plan.growth.tasks]
    ids = {task.id for task in tasks}
    assert all(dependency in ids for task in tasks for dependency in task.dependencies)


@pytest.mark.asyncio
async def test_admin_guard_rejects_customer() -> None:
    customer = SimpleNamespace(role="user")
    with pytest.raises(AuthorizationError):
        await get_admin_user(customer)


@pytest.mark.asyncio
async def test_admin_guard_accepts_admin() -> None:
    admin = SimpleNamespace(role="admin")
    assert await get_admin_user(admin) is admin
