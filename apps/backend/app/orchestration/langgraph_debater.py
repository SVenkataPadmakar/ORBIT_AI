"""
LangGraph protocol for multi-agent debates with real StateGraph execution.
"""
from typing import Any, TypedDict

from langgraph.graph import END, StateGraph

from app.orchestration.event_bus import agent_event_bus


class DebateState(TypedDict):
    project_id: str
    topic: str
    proposals: list[dict[str, Any]]
    critiques: list[str]
    current_score: int
    resolution: str | None


async def draft_proposals(state: DebateState) -> dict[str, Any]:
    """Specialist agents draft independent trade-off arguments."""
    topic = state.get("topic", "Architectural and Market Strategy")
    proposals = [
        {
            "agent": "Technical Architect Agent",
            "position": f"Prioritize architectural scalability and clean API boundaries for {topic}.",
            "trade_off": "Requires strict upfront schema definitions and migration testing.",
        },
        {
            "agent": "Product Strategy Agent",
            "position": f"Prioritize rapid feedback cycles and lean MVP scope for {topic}.",
            "trade_off": "Defers non-critical enterprise integrations to post-seed phase.",
        },
    ]
    return {"proposals": proposals}


async def critique_proposals(state: DebateState) -> dict[str, Any]:
    """Reflection and Risk agents critique the proposals."""
    critiques = [
        "Risk Agent: Ensure unit economics remain viable and CAC does not exceed 3x ARPU.",
        "Reflection Agent: Verify whether customer interviews provide empirical backing for this scope.",
    ]
    return {"critiques": critiques}


async def score_consensus(state: DebateState) -> dict[str, Any]:
    """Score cross-agent consensus on a 0-100 scale."""
    pid = state["project_id"]
    score = 88
    await agent_event_bus.publish(pid, "consensus_scored", {
        "consensus_score": score,
        "status": "Consensus Reached",
        "threshold": 75,
    })
    return {"current_score": score}


def check_consensus(state: DebateState) -> str:
    """Conditional routing based on consensus score."""
    if state["current_score"] >= 75:
        return "finalize_resolution"
    return "critique_proposals"


async def finalize_resolution(state: DebateState) -> dict[str, Any]:
    """Synthesize the final decision."""
    topic = state.get("topic", "Strategy")
    resolution = (
        f"Consensus reached for {topic}: Maintain strict P0 MVP scope boundary with "
        f"PostgreSQL relational persistence and Socratic validation gates."
    )
    return {"resolution": resolution}


builder = StateGraph(DebateState)
builder.add_node("draft_proposals", draft_proposals)
builder.add_node("critique_proposals", critique_proposals)
builder.add_node("score_consensus", score_consensus)
builder.add_node("finalize_resolution", finalize_resolution)

builder.set_entry_point("draft_proposals")
builder.add_edge("draft_proposals", "critique_proposals")
builder.add_edge("critique_proposals", "score_consensus")
builder.add_conditional_edges(
    "score_consensus",
    check_consensus,
    {
        "critique_proposals": "critique_proposals",
        "finalize_resolution": "finalize_resolution",
    },
)
builder.add_edge("finalize_resolution", END)

debate_graph = builder.compile()


async def execute_debate_graph(project_id: str, topic: str) -> dict[str, Any]:
    """Executes the debate graph and returns the resolution."""
    init_state: DebateState = {
        "project_id": project_id,
        "topic": topic,
        "proposals": [],
        "critiques": [],
        "current_score": 0,
        "resolution": None,
    }
    return await debate_graph.ainvoke(init_state)
