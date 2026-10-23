"""
AgentRun — the transactional execution log. Groups by `pipeline_run_id` so
all six agent runs belonging to one "Run Copilot" click can be queried
together (the Activity Feed's data source), while each row still tracks its
own agent's status independently — this is what enables partial re-runs.
"""
import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.agent import Agent
    from app.models.financial_model import FinancialModel
    from app.models.pitch_deck import PitchDeck
    from app.models.project import Project
    from app.models.report import Report


class AgentRun(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "agent_runs"
    __table_args__ = (
        UniqueConstraint("pipeline_run_id", "agent_id", name="uq_agent_runs_pipeline_agent"),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    agent_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("agents.id"), nullable=False
    )
    pipeline_run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="queued", server_default="queued", index=True
    )
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default="1")
    input_context: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    structured_output: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    tokens_used: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cost_usd: Mapped[Decimal | None] = mapped_column(Numeric(10, 4), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    project: Mapped["Project"] = relationship(back_populates="agent_runs")
    agent: Mapped["Agent"] = relationship(back_populates="agent_runs")
    reports: Mapped[list["Report"]] = relationship(
        back_populates="agent_run", cascade="all, delete-orphan"
    )
    financial_model: Mapped["FinancialModel | None"] = relationship(
        back_populates="agent_run", uselist=False, cascade="all, delete-orphan"
    )
    pitch_deck: Mapped["PitchDeck | None"] = relationship(
        back_populates="agent_run", uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<AgentRun id={self.id} status={self.status!r} pipeline_run_id={self.pipeline_run_id}>"
