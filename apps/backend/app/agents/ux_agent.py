"""
UX Architect Agent for defining Information Architecture and Components.
Powered by SpecialistAgents engine.
"""
from typing import Any

from pydantic import BaseModel

from app.agents.specialist_agents import SpecialistAgents


class Screen(BaseModel):
    name: str
    route: str
    components: list[str]


class UXBlueprint(BaseModel):
    screens: list[Screen]
    user_flows: list[str]
    design_system: str | None = None


async def generate_ux_blueprint(prd_content: dict[str, Any]) -> UXBlueprint:
    """Generate UX Architecture based on the PRD."""
    ctx = {"name": prd_content.get("title", "App")}
    product_strategy_mock = await SpecialistAgents.run_product_strategy(ctx, {})
    ux_artifact = await SpecialistAgents.run_uiux_architect(ctx, product_strategy_mock)

    screens = [
        Screen(
            name=p["title"],
            route=p["route"],
            components=["Header", "ActionToolbar", "DataGrid", "CofounderHUD"],
        )
        for p in ux_artifact.page_flow_hierarchy
    ]

    return UXBlueprint(
        screens=screens,
        user_flows=[
            "Onboarding -> Mission Control -> Challenge Assumption -> View 7-Day Experiment",
            "Sprint Planner -> Advance Task Status -> Check Acceptance Gate -> Review Impact",
            "Architecture Engine -> Inspect DDL Schema -> Copy SQL -> Verify Deployment",
        ],
        design_system=ux_artifact.design_system_theme,
    )
