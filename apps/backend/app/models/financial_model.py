"""
FinancialModel — the Finance Agent's structured output (pricing, forecast,
CAC/LTV, runway) for one project. One-to-one with the AgentRun that produced
it.
"""
import uuid
from decimal import Decimal
from typing import TYPE_CHECKING, Any

from sqlalchemy import ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.agent_run import AgentRun
    from app.models.project import Project


class FinancialModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "financial_models"
    __table_args__ = (
        UniqueConstraint("agent_run_id", name="uq_financial_models_agent_run_id"),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    agent_run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="CASCADE"), nullable=False
    )
    pricing_model: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    forecast: Mapped[list[dict[str, Any]] | None] = mapped_column(JSONB, nullable=True)
    cac_by_channel: Mapped[list[dict[str, Any]] | None] = mapped_column(JSONB, nullable=True)
    ltv_usd: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    ltv_cac_ratio: Mapped[Decimal | None] = mapped_column(Numeric(6, 2), nullable=True)
    runway_months: Mapped[Decimal | None] = mapped_column(Numeric(6, 1), nullable=True)
    assumptions: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)

    project: Mapped["Project"] = relationship(back_populates="financial_models")
    agent_run: Mapped["AgentRun"] = relationship(back_populates="financial_model")

    def __repr__(self) -> str:
        return f"<FinancialModel id={self.id} project_id={self.project_id}>"
