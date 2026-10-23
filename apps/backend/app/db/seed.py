"""
Seed script for reference/lookup data — currently just the six agent
definitions the orchestrator dispatches to (see app/agents, built out in the
LangGraph-orchestrator phase). Upserts by `key`, so it's safe to run on
every deploy (`make seed`) without creating duplicates.
"""
import asyncio

import structlog
from sqlalchemy import select

from app.db.session import session_scope
from app.models.agent import Agent

logger = structlog.get_logger("db.seed")

AGENT_SEED_DATA: list[dict[str, str]] = [
    {
        "key": "problem_discovery",
        "name": "Problem Discovery Agent",
        "description": (
            "Identifies customer pain points, analyzes industries, detects market gaps, "
            "and scores candidate problems on severity and market need."
        ),
        "default_model": "claude-sonnet-4-6",
    },
    {
        "key": "market_research",
        "name": "Market Research Agent",
        "description": (
            "Competitor analysis, TAM/SAM/SOM sizing, SWOT analysis, and market trend "
            "validation for the focus problem."
        ),
        "default_model": "claude-sonnet-4-6",
    },
    {
        "key": "product_strategy",
        "name": "Product Strategy Agent",
        "description": (
            "Generates personas, user stories, feature prioritization, MVP planning, "
            "and a phased product roadmap."
        ),
        "default_model": "claude-sonnet-4-6",
    },
    {
        "key": "finance",
        "name": "Finance Agent",
        "description": (
            "Revenue forecasting, pricing model recommendation, CAC/LTV estimation, "
            "and runway projection."
        ),
        "default_model": "claude-sonnet-4-6",
    },
    {
        "key": "pitch_deck",
        "name": "Pitch Deck Agent",
        "description": "Generates the investor deck outline, business plan, and executive summary.",
        "default_model": "claude-sonnet-4-6",
    },
    {
        "key": "vc_evaluation",
        "name": "VC Evaluation Agent",
        "description": (
            "Adversarial, investor-lens review of the full Blueprint, producing a "
            "structured Investment Readiness score."
        ),
        "default_model": "claude-sonnet-4-6",
    },
]


async def seed_agents() -> None:
    async with session_scope() as session:
        for agent_data in AGENT_SEED_DATA:
            result = await session.execute(select(Agent).where(Agent.key == agent_data["key"]))
            existing = result.scalar_one_or_none()
            if existing is not None:
                for field, value in agent_data.items():
                    setattr(existing, field, value)
                logger.info("db.seed.agent_updated", key=agent_data["key"])
            else:
                session.add(Agent(**agent_data))
                logger.info("db.seed.agent_created", key=agent_data["key"])


async def main() -> None:
    await seed_agents()
    logger.info("db.seed.complete")


if __name__ == "__main__":
    asyncio.run(main())
