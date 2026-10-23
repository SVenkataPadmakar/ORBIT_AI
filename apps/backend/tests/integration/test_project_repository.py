"""
Integration tests for ProjectRepository against a real Postgres instance.
Confirms the ORM models, relationships, and repository queries actually work
against the database — not just that they import cleanly.
"""
import pytest

from app.models.project import Project
from app.models.user import User
from app.repositories.project_repository import ProjectRepository
from app.repositories.user_repository import UserRepository


@pytest.mark.asyncio
async def test_create_and_list_projects_for_owner(db_session):
    user = await UserRepository(db_session).add(
        User(email="founder@example.com", hashed_password="hashed", full_name="Ada Lovelace")
    )
    project = await ProjectRepository(db_session).add(
        Project(
            owner_id=user.id,
            name="MealPlan AI",
            idea_description="An AI meal planner for people managing chronic conditions.",
            industry="HealthTech",
        )
    )
    await db_session.commit()

    projects, total = await ProjectRepository(db_session).list_for_owner(user.id)

    assert total == 1
    assert projects[0].id == project.id
    assert projects[0].name == "MealPlan AI"
    assert projects[0].status == "draft"  # server_default applied


@pytest.mark.asyncio
async def test_list_for_owner_filters_by_status(db_session):
    repo = ProjectRepository(db_session)
    user = await UserRepository(db_session).add(User(email="multi@example.com", hashed_password="x"))

    await repo.add(Project(owner_id=user.id, name="Draft one", idea_description="idea", status="draft"))
    await repo.add(Project(owner_id=user.id, name="Running one", idea_description="idea", status="running"))
    await db_session.commit()

    running_only, total = await repo.list_for_owner(user.id, status="running")

    assert total == 1
    assert running_only[0].name == "Running one"


@pytest.mark.asyncio
async def test_get_owned_by_enforces_ownership(db_session):
    repo = ProjectRepository(db_session)
    owner = await UserRepository(db_session).add(User(email="owner@example.com", hashed_password="x"))
    other = await UserRepository(db_session).add(User(email="other@example.com", hashed_password="x"))
    project = await repo.add(Project(owner_id=owner.id, name="Private Project", idea_description="idea"))
    await db_session.commit()

    assert await repo.get_owned_by(project.id, other.id) is None
    assert await repo.get_owned_by(project.id, owner.id) is not None
