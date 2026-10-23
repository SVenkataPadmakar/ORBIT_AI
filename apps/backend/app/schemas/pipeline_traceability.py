"""
Pydantic contracts for 7-Stage Pipeline Traceability:
IDEA -> VALIDATION -> PRODUCT -> ARCHITECTURE -> SPRINTS -> LAUNCH -> GROWTH.
Every stage exposes:
- inputs: Concrete upstream data fed into the stage
- outputs: High-value structured deliverables
- confidence: Calibrated numeric confidence score (0-100)
- reasoning: Chain-of-thought rationale explaining WHY choices were made
- evidence: Empirical proof points, market citations, and benchmarks
- next_steps: Prioritized actionable next steps
"""
from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

PipelineStageName = Literal[
    "idea",
    "validation",
    "product",
    "architecture",
    "sprints",
    "launch",
    "growth",
]


class StageEvidenceItem(BaseModel):
    claim: str
    source: str
    confidence: int = Field(ge=0, le=100)
    data_type: str = "metric"  # "metric", "citation", "interview_quote", "benchmark"
    details: str | None = None


class StageTraceabilityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID | None = None
    project_id: UUID
    stage: PipelineStageName
    status: str = "completed"  # "pending", "running", "completed", "failed"
    agent_names: list[str] = Field(default_factory=list)
    inputs: dict[str, Any] = Field(default_factory=dict)
    outputs: dict[str, Any] = Field(default_factory=dict)
    confidence: int = Field(ge=0, le=100)
    reasoning: str
    evidence: list[StageEvidenceItem] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)
    started_at: datetime | None = None
    completed_at: datetime | None = None
    duration_ms: int = 0


class DebateExchangeItem(BaseModel):
    id: str
    round: int
    agent_a: str
    agent_b: str
    topic: str
    argument_a: str
    argument_b: str
    resolution: str
    confidence_score: int
    status: str = "verified"


class FullPipelineTraceabilityResponse(BaseModel):
    project_id: UUID
    project_name: str
    overall_confidence: int
    consensus_score: int
    consensus_status: str
    stages: dict[PipelineStageName, StageTraceabilityResponse]
    debates: list[DebateExchangeItem] = Field(default_factory=list)
    last_updated: datetime
