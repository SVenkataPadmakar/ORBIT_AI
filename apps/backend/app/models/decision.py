"""
Decision models for Agent Debates and Founder Approvals.
"""
import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.project import Project


class Decision(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "decisions"

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="PROPOSED", index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, default="technical", index=True)
    
    # Store the final resolution and rationale if approved/rejected
    resolution: Mapped[str | None] = mapped_column(Text, nullable=True)
    rationale: Mapped[str | None] = mapped_column(Text, nullable=True)
    rejected_alternatives: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    trade_offs: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    consensus_score: Mapped[int] = mapped_column(nullable=False, default=90)
    participating_agents: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    
    # E.g. details of the agent debate, proposals, scores
    context_snapshot: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    
    # If a founder explicitly approved this
    approved_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    project: Mapped["Project"] = relationship(back_populates="decisions")
