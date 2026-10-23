"""Schemas for Gemini Persistent Co-Founder Intelligence Layer and 4-Layer Memory."""
from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProjectMemory(BaseModel):
    core_thesis: str
    target_audience: str
    icp_archetype: str
    value_proposition: str
    monetization_model: str
    key_competitors: list[str] = Field(default_factory=list)
    tam_estimate: str | None = None


class DecisionMemoryItem(BaseModel):
    id: str
    timestamp: datetime
    category: Literal["technical", "market", "product", "pricing", "gtm"]
    decision: str
    rationale: str
    rejected_alternatives: list[str] = Field(default_factory=list)
    trade_offs: list[str] = Field(default_factory=list)
    status: Literal["active", "reversed", "superseded"] = "active"


class ProductMemoryItem(BaseModel):
    component: str
    specification: str
    technical_stack: list[str] = Field(default_factory=list)
    status: Literal["designed", "in_sprint", "shipped"] = "designed"
    artifacts: list[str] = Field(default_factory=list)


class ExecutionMemorySummary(BaseModel):
    sprints_completed: int
    velocity_trend: str
    critical_bottlenecks: list[str] = Field(default_factory=list)
    agent_efficiency_score: int = Field(ge=0, le=100)
    tasks_closed_total: int
    tasks_remaining: int


class ContradictionAlert(BaseModel):
    id: str
    severity: Literal["critical", "warning", "info"]
    title: str
    description: str
    conflicting_elements: list[str] = Field(default_factory=list)
    recommendation: str
    detected_at: datetime


class CofounderInsight(BaseModel):
    id: str
    type: Literal["suggestion", "warning", "risk", "opportunity"]
    title: str
    message: str
    reasoning: str
    context_workspace: str  # "mission", "evidence", "architecture", "sprints", "launch", "growth"
    action_label: str
    action_type: str
    impact_score: int = Field(default=85, ge=0, le=100)


class WorkspaceGuidance(BaseModel):
    workspace: str
    headline: str
    executive_summary: str
    proactive_insights: list[CofounderInsight] = Field(default_factory=list)
    contradictions: list[ContradictionAlert] = Field(default_factory=list)
    challenged_assumptions: list[str] = Field(default_factory=list)
    next_best_actions: list[str] = Field(default_factory=list)
    generated_by: str = "gemini-2.0-flash"


class CofounderMemoryState(BaseModel):
    project_id: UUID
    project_memory: ProjectMemory
    decision_memory: list[DecisionMemoryItem] = Field(default_factory=list)
    product_memory: list[ProductMemoryItem] = Field(default_factory=list)
    execution_memory: ExecutionMemorySummary
    active_contradictions: list[ContradictionAlert] = Field(default_factory=list)
    last_synced_at: datetime


class DecisionCreateRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    project_id: UUID
    category: Literal["technical", "market", "product", "pricing", "gtm"]
    decision: str = Field(min_length=5, max_length=500)
    rationale: str = Field(min_length=5, max_length=2000)
    rejected_alternatives: list[str] = Field(default_factory=list)
    trade_offs: list[str] = Field(default_factory=list)


class AssumptionChallengeRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    project_id: UUID
    assumption: str = Field(min_length=5, max_length=1000)


class AssumptionChallengeResponse(BaseModel):
    assumption: str
    counter_factual_analysis: str
    vulnerability_score: int = Field(ge=0, le=100)
    historical_conflicts: list[str] = Field(default_factory=list)
    seven_day_experiment: str
    recommended_action: str


class CofounderExplainDecisionResponse(BaseModel):
    decision_id: str
    topic: str
    status: str
    category: str
    consensus_score: int = 85
    explanation: str
    trade_offs: list[str] = Field(default_factory=list)
    rejected_alternatives: list[str] = Field(default_factory=list)
    participating_agents: list[str] = Field(default_factory=list)
    evidence_sources: list[str] = Field(default_factory=list)
    recommended_action: str


class CofounderExplainArchitectureResponse(BaseModel):
    project_id: UUID
    summary: str
    stack_overview: list[dict[str, Any]] = Field(default_factory=list)
    scalability_assessment: str
    technical_risks: list[str] = Field(default_factory=list)
    data_model_rationale: str
    security_posture: str
    suggested_refinements: list[str] = Field(default_factory=list)


class CofounderExplainRoadmapResponse(BaseModel):
    project_id: UUID
    current_stage: str
    summary: str
    milestones: list[dict[str, Any]] = Field(default_factory=list)
    critical_path: list[str] = Field(default_factory=list)
    runway_alignment: str
    velocity_projection: str
    immediate_focus: str


class CofounderExplainRisksResponse(BaseModel):
    project_id: UUID
    overall_risk_score: int = Field(default=35, ge=0, le=100)
    summary: str
    validation_risks: list[dict[str, Any]] = Field(default_factory=list)
    technical_risks: list[dict[str, Any]] = Field(default_factory=list)
    go_to_market_risks: list[dict[str, Any]] = Field(default_factory=list)
    burn_rate_risks: list[dict[str, Any]] = Field(default_factory=list)
    prioritized_mitigations: list[str] = Field(default_factory=list)


class CofounderExplainStageResponse(BaseModel):
    project_id: UUID
    stage: str
    confidence_score: int = Field(default=85, ge=0, le=100)
    inputs_summary: dict[str, Any] = Field(default_factory=dict)
    outputs_summary: dict[str, Any] = Field(default_factory=dict)
    reasoning_deep_dive: str
    evidence_cited: list[dict[str, Any]] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)
    cofounder_verdict: str

