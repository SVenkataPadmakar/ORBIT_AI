"""
StageExecutionRecord — Persistent traceability record for each of the 7 pipeline stages:
IDEA -> VALIDATION -> PRODUCT -> ARCHITECTURE -> SPRINTS -> LAUNCH -> GROWTH.
Every stage stores: inputs, outputs, confidence, reasoning, evidence, next_steps.
"""
import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.project import Project


class StageExecutionRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "stage_executions"

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    pipeline_run_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        index=True,
    )
    stage: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )  # "idea", "validation", "product", "architecture", "sprints", "launch", "growth"
    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="completed",
        index=True,
    )  # "pending", "running", "completed", "failed"
    agent_names: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )  # ["Problem Discovery Agent", "Market Research Agent", ...]
    inputs: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )
    outputs: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )
    confidence: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=85,
    )  # 0 to 100
    reasoning: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="",
    )  # Chain-of-thought rationale explaining WHY decisions were made
    evidence: Mapped[list[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )  # Empirical citations, benchmarks, interview data, CAGR numbers
    next_steps: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )  # Concrete next milestones
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    duration_ms: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    project: Mapped["Project"] = relationship(back_populates="stage_executions")

    def __repr__(self) -> str:
        return f"<StageExecutionRecord stage={self.stage!r} status={self.status!r} confidence={self.confidence}>"
