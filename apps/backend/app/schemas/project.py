"""Pydantic contracts for ownership-scoped project APIs."""
from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

ProjectStatus = Literal["draft", "active", "archived"]


class ProjectFields(BaseModel):
    @field_validator(
        "name",
        "idea_description",
        "industry",
        "target_audience",
        "budget_band",
        "goals",
        mode="before",
        check_fields=False,
    )
    @classmethod
    def normalize_text(cls, value: object) -> object:
        if isinstance(value, str):
            normalized = value.strip()
            return normalized or None
        return value


class ProjectCreate(ProjectFields):
    name: str = Field(min_length=1, max_length=255)
    idea_description: str = Field(min_length=1, max_length=20_000)
    industry: str | None = Field(default=None, max_length=100)
    target_audience: str | None = Field(default=None, max_length=5_000)
    budget_band: str | None = Field(default=None, max_length=50)
    goals: str | None = Field(default=None, max_length=5_000)


class ProjectUpdate(ProjectFields):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    idea_description: str | None = Field(default=None, min_length=1, max_length=20_000)
    industry: str | None = Field(default=None, max_length=100)
    target_audience: str | None = Field(default=None, max_length=5_000)
    budget_band: str | None = Field(default=None, max_length=50)
    goals: str | None = Field(default=None, max_length=5_000)
    status: ProjectStatus | None = None

    @model_validator(mode="after")
    def require_change(self) -> "ProjectUpdate":
        if not self.model_fields_set:
            raise ValueError("At least one project field must be provided")
        return self


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    owner_id: UUID
    name: str
    idea_description: str
    industry: str | None
    target_audience: str | None
    budget_band: str | None
    goals: str | None
    status: ProjectStatus
    blueprint_status: str
    created_at: datetime
    updated_at: datetime


class ProjectListResponse(BaseModel):
    items: list[ProjectResponse]
    total: int
    offset: int
    limit: int
