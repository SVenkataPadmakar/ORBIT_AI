"""
Development Manager Agent for sprint planning and task generation.
Powered by SpecialistAgents engine.
"""
from typing import Any

from pydantic import BaseModel

from app.agents.specialist_agents import SpecialistAgents


class KanbanTask(BaseModel):
    title: str
    description: str
    priority: str
    acceptance_criteria: list[str]
    owner_role: str | None = None
    duration_days: int | None = None


class SprintPlan(BaseModel):
    tasks: list[KanbanTask]
    acceptance_gates: list[str] = []


async def generate_sprint(
    prd_content: dict[str, Any],
    tech_content: dict[str, Any],
    ux_content: dict[str, Any]
) -> SprintPlan:
    """Generate a structured Sprint Plan from upstream artifacts."""
    ctx = {"name": prd_content.get("title", "App")}
    product_strategy_mock = await SpecialistAgents.run_product_strategy(ctx, {})
    sprint_artifact = await SpecialistAgents.run_sprint_planner(ctx, product_strategy_mock)

    tasks = [
        KanbanTask(
            title=t["title"],
            description=f"Assigned to {t['role']} with target outcome: {t['acceptance']}",
            priority="P0" if idx < 2 else "P1",
            acceptance_criteria=[t["acceptance"]],
            owner_role=t["role"],
            duration_days=t["duration_days"],
        )
        for idx, t in enumerate(sprint_artifact.tasks)
    ]

    return SprintPlan(
        tasks=tasks,
        acceptance_gates=sprint_artifact.acceptance_gates,
    )
