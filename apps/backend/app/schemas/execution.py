"""Contracts for actionable startup execution plans and the persistent AI co-founder."""
from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

ExecutionPhase = Literal["build", "launch", "growth"]
TaskStatus = Literal["todo", "in_progress", "blocked", "done"]


class EvidenceSource(BaseModel):
    title: str
    url: str | None = None
    provider: str
    retrieved_at: datetime
    freshness: Literal["live", "recent", "baseline"] = "baseline"


class ExecutionTask(BaseModel):
    id: str
    phase: ExecutionPhase
    title: str
    outcome: str
    owner_role: str
    duration_days: int = Field(ge=1, le=365)
    dependencies: list[str] = Field(default_factory=list)
    acceptance_criteria: list[str] = Field(min_length=1)
    recommended_tools: list[str] = Field(default_factory=list)
    status: TaskStatus = "todo"


class TechnicalBlueprint(BaseModel):
    stack: list[dict[str, str]]
    architecture: list[str]
    database_entities: list[dict[str, str | list[str]]]
    api_recommendations: list[dict[str, str]]
    deployment: list[str]
    security_baseline: list[str]


class PhasePlan(BaseModel):
    objective: str
    tasks: list[ExecutionTask] = Field(min_length=1)
    exit_criteria: list[str] = Field(min_length=1)
    kpis: list[str] = Field(min_length=1)


class ValidationReport(BaseModel):
    confidence_score: int = Field(ge=0, le=100)
    logical_consistency: int = Field(ge=0, le=100)
    business_viability: int = Field(ge=0, le=100)
    evidence_quality: int = Field(ge=0, le=100)
    missing_information: list[str] = Field(default_factory=list)
    challenged_assumptions: list[str] = Field(default_factory=list)
    corrections_applied: list[str] = Field(default_factory=list)
    passed: bool


class ExecutionPlan(BaseModel):
    project_id: UUID
    generated_at: datetime
    executive_action: str
    technical_blueprint: TechnicalBlueprint
    competitor_moves: list[str]
    go_to_market: list[str]
    build: PhasePlan
    launch: PhasePlan
    growth: PhasePlan
    launch_checklist: list[str]
    evidence: list[EvidenceSource]
    validation: ValidationReport


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class CofounderMessageCreate(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    project_id: UUID | None = None
    page_context: str | None = Field(default=None, max_length=500)


class CofounderMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime


class CofounderResponse(BaseModel):
    answer: str
    project_id: UUID | None
    provider: str
    confidence_score: int = Field(ge=0, le=100)
    suggested_actions: list[str]
    memory_used: list[str]


class AdminMetric(BaseModel):
    label: str
    value: int | float | str
    trend_percent: float | None = None


class AdminOverview(BaseModel):
    users: list[AdminMetric]
    revenue: list[AdminMetric]
    agents: list[AdminMetric]
    system: list[AdminMetric]
    api_usage: list[AdminMetric]


class AdminUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    full_name: str | None
    role: str
    is_active: bool
    created_at: datetime
