"""Pydantic contracts for pipeline execution and artifact APIs."""
from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

PipelineStatus = Literal["queued", "running", "completed", "failed"]
PipelineExecution = Literal["queued", "inline"]
PipelineMode = Literal["provider", "demo"]


class PipelineRunResponse(BaseModel):
    pipeline_run_id: UUID
    project_id: UUID
    status: PipelineStatus
    run_count: int
    execution: PipelineExecution
    mode: PipelineMode
    provider: str


class AgentRunResponse(BaseModel):
    id: UUID
    pipeline_run_id: UUID
    stage: str
    status: str
    mode: PipelineMode
    provider: str
    model: str | None
    error_message: str | None
    started_at: datetime | None
    completed_at: datetime | None


class PipelineStatusResponse(BaseModel):
    pipeline_run_id: UUID
    project_id: UUID
    status: PipelineStatus
    runs: list[AgentRunResponse]


class PipelineResultResponse(PipelineStatusResponse):
    outputs: dict[str, dict[str, Any]]


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    project_id: UUID
    agent_run_id: UUID
    report_type: str
    title: str
    content_markdown: str | None
    content_json: dict[str, Any] | None
    version: int
    created_at: datetime
    updated_at: datetime


class FinancialModelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    project_id: UUID
    agent_run_id: UUID
    pricing_model: dict[str, Any] | None
    forecast: list[dict[str, Any]] | None
    cac_by_channel: list[dict[str, Any]] | None
    ltv_usd: float | None
    ltv_cac_ratio: float | None
    runway_months: float | None
    assumptions: list[str] | None
    created_at: datetime
    updated_at: datetime


class PitchDeckResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    project_id: UUID
    agent_run_id: UUID
    slides: list[dict[str, Any]]
    business_plan_markdown: str | None
    executive_summary_markdown: str | None
    exported_pptx_url: str | None
    exported_pdf_url: str | None
    created_at: datetime
    updated_at: datetime
