"""
ORBIT — LangGraph Linear Pipeline Skeleton.
Enforces the 7-node strictly linear agent architecture per the Workspace Constitution:
  problem_discovery → market_analysis → feasibility →
  [conditional: if score < 80 → END] →
  prd_generator → design → developer → risk_analysis → END
"""
from __future__ import annotations

import logging
from typing import Any

from langgraph.graph import END, START, StateGraph

from app.graph.progress import emit
from app.graph.state import OrbitState

logger = logging.getLogger("orbit.graph.pipeline")


from app.agents.problem_discovery import problem_discovery
from app.agents.market_analysis import market_analysis
from app.agents.feasibility import feasibility
from app.agents.prd_generator import prd_generator
from app.agents.design import design



from app.agents.developer import developer
from app.agents.risk_analysis import risk_analysis


# ─── ROUTING FUNCTION ─────────────────────────────────────────────────────────

def route_feasibility(state: OrbitState | dict[str, Any]) -> str:
    """
    Conditional routing edge after feasibility:
    - If feasibility score < 80 -> END (pipeline stops immediately)
    - If feasibility score >= 80 -> prd_generator
    """
    feasibility_data = state.feasibility if isinstance(state, OrbitState) else state.get("feasibility", {})
    score = 0
    if isinstance(feasibility_data, dict):
        score = feasibility_data.get("score", feasibility_data.get("force_score", 0))
    elif hasattr(feasibility_data, "score"):
        score = getattr(feasibility_data, "score", 0)

    if score < 80:
        logger.info("Feasibility score %s < 80: routing to END", score)
        return END

    logger.info("Feasibility score %s >= 80: routing to prd_generator", score)
    return "prd_generator"


# ─── STATE GRAPH DEFINITION ───────────────────────────────────────────────────

def create_pipeline_graph() -> StateGraph:
    """
    Constructs the LangGraph StateGraph with EXACTLY 7 nodes in this order:
      problem_discovery → market_analysis → feasibility →
      [conditional: if score < 80 → END] →
      prd_generator → design → developer → risk_analysis → END
    """
    builder = StateGraph(OrbitState)

    # EXACTLY 7 nodes
    builder.add_node("problem_discovery", problem_discovery)
    builder.add_node("market_analysis", market_analysis)
    builder.add_node("feasibility", feasibility)
    builder.add_node("prd_generator", prd_generator)
    builder.add_node("design", design)
    builder.add_node("developer", developer)
    builder.add_node("risk_analysis", risk_analysis)

    # Linear wiring
    builder.add_edge(START, "problem_discovery")
    builder.add_edge("problem_discovery", "market_analysis")
    builder.add_edge("market_analysis", "feasibility")

    # Conditional branch after feasibility
    builder.add_conditional_edges(
        "feasibility",
        route_feasibility,
        {
            "prd_generator": "prd_generator",
            END: END,
        },
    )

    builder.add_edge("prd_generator", "design")
    builder.add_edge("design", "developer")
    builder.add_edge("developer", "risk_analysis")
    builder.add_edge("risk_analysis", END)

    return builder


# Compiled graph instance
graph = create_pipeline_graph().compile()
pipeline = graph
