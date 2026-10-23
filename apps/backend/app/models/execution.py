"""Persistent execution plans and project-aware AI co-founder conversation memory."""
import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.user import User


class ExecutionPlanRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "execution_plans"
    __table_args__ = (UniqueConstraint("project_id", name="uq_execution_plan_project"),)

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    plan: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    task_states: Mapped[dict[str, str]] = mapped_column(JSONB, nullable=False, default=dict)
    confidence_score: Mapped[int] = mapped_column(nullable=False, default=0)
    generation_mode: Mapped[str] = mapped_column(String(30), nullable=False, default="deterministic")

    project: Mapped["Project"] = relationship(back_populates="execution_plan")


class CofounderMessageRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "cofounder_messages"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True, index=True
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    context_snapshot: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    provider: Mapped[str | None] = mapped_column(String(40), nullable=True)
    tokens_used: Mapped[int] = mapped_column(nullable=False, default=0)

    user: Mapped["User"] = relationship(back_populates="cofounder_messages")
    project: Mapped["Project | None"] = relationship(back_populates="cofounder_messages")
