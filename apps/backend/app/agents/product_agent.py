"""
Product Strategy Agent for generating requirements, personas, and user stories.
Powered by SpecialistAgents engine.
"""
from typing import Any

from pydantic import BaseModel

from app.agents.specialist_agents import SpecialistAgents


class Persona(BaseModel):
    name: str
    role: str
    pain_points: list[str]


class PRD(BaseModel):
    title: str
    vision: str
    personas: list[Persona]
    requirements: list[str]
    acceptance_criteria: list[str]


async def generate_prd(idea: str, validation_context: dict[str, Any]) -> PRD:
    """Generate a structured Product Requirements Document from an Idea."""
    ctx = {
        "idea_description": idea,
        "name": validation_context.get("project_name", "Startup Product"),
        "target_audience": validation_context.get("target_audience", "Tech Founders"),
        "industry": validation_context.get("industry", "Software SaaS"),
    }
    artifact = await SpecialistAgents.run_product_strategy(ctx, {})

    personas = [
        Persona(name=p["name"], role=p["role"], pain_points=[p["pain"]])
        for p in artifact.personas
    ]

    return PRD(
        title=f"{artifact.product_name} - MVP PRD",
        vision=artifact.value_proposition,
        personas=personas,
        requirements=artifact.mvp_scope_boundary,
        acceptance_criteria=[
            "All core features operate within sub-200ms latency boundaries",
            "Zero unhandled runtime exceptions across database migrations",
            "User decisions persist across browser reloads",
        ],
    )
