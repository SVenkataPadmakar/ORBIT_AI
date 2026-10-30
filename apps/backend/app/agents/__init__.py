"""
ORBIT Constitutional Agents package.
"""
from typing import Any


def __getattr__(name: str) -> Any:
    if name == "problem_discovery":
        from app.agents.problem_discovery import problem_discovery
        return problem_discovery
    if name == "market_analysis":
        from app.agents.market_analysis import market_analysis
        return market_analysis
    if name == "feasibility":
        from app.agents.feasibility import feasibility
        return feasibility
    if name == "prd_generator":
        from app.agents.prd_generator import prd_generator
        return prd_generator
    if name == "design":
        from app.agents.design import design
        return design
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = [
    "problem_discovery",
    "market_analysis",
    "feasibility",
    "prd_generator",
    "design",
]
