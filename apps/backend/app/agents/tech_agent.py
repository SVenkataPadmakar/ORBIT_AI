"""
Technical Architect Agent for Database and API design.
Powered by SpecialistAgents engine.
"""
from typing import Any

from pydantic import BaseModel

from app.agents.specialist_agents import SpecialistAgents


class DatabaseSchema(BaseModel):
    tables: list[dict[str, Any]]
    relationships: list[dict[str, Any]]
    ddl_sql: str | None = None


class APISchema(BaseModel):
    endpoints: list[dict[str, Any]]


async def generate_tech_architecture(prd_content: dict[str, Any]) -> dict[str, Any]:
    """Generate technical architecture based on PRD content."""
    ctx = {
        "name": prd_content.get("name", "Product"),
        "idea_description": prd_content.get("vision", "SaaS Platform"),
    }
    db_artifact = await SpecialistAgents.run_database_architect(ctx)
    api_artifact = await SpecialistAgents.run_api_architect(ctx)
    tech_artifact = await SpecialistAgents.run_technical_architect(ctx)

    return {
        "database": DatabaseSchema(
            tables=db_artifact.tables,
            relationships=[
                {"from": "decisions.project_id", "to": "projects.id", "type": "many_to_one"},
                {"from": "sprint_tasks.project_id", "to": "projects.id", "type": "many_to_one"},
            ],
            ddl_sql=db_artifact.ddl_schema_sql,
        ).model_dump(),
        "api": APISchema(endpoints=api_artifact.endpoints).model_dump(),
        "topology": tech_artifact.system_topology,
        "stack": tech_artifact.stack,
    }
