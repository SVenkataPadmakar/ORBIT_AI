"""
Pydantic schemas for Multi-Agent Debate and Consensus status.
"""
from pydantic import BaseModel


class DebateEventItem(BaseModel):
    id: str
    agentA: str
    agentB: str
    topic: str
    agentAArg: str
    agentBArg: str
    resolution: str
    confidenceScore: int
    status: str = "verified"


class DebateCycleResponse(BaseModel):
    project_id: str
    status: str
    consensus_score: int
    debates: list[DebateEventItem]
    round: int
    reflection_count: int
