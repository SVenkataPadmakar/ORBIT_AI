"""
Project — the "Workspace" a user runs the agent pipeline against. Owns every
downstream artifact (agent runs, reports, financial models, pitch decks,
documents, notifications) via cascading deletes, so deleting a project
cleans up its entire blueprint.
"""
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.agent_run import AgentRun
    from app.models.artifact import Artifact
    from app.models.decision import Decision
    from app.models.document import Document
    from app.models.execution import CofounderMessageRecord, ExecutionPlanRecord
    from app.models.financial_model import FinancialModel
    from app.models.notification import Notification
    from app.models.pitch_deck import PitchDeck
    from app.models.report import Report
    from app.models.stage_execution import StageExecutionRecord
    from app.models.task import Task
    from app.models.user import User


class Project(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "projects"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    idea_description: Mapped[str] = mapped_column(Text, nullable=False)
    industry: Mapped[str | None] = mapped_column(String(100), nullable=True)
    target_audience: Mapped[str | None] = mapped_column(Text, nullable=True)
    budget_band: Mapped[str | None] = mapped_column(String(50), nullable=True)
    goals: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft", server_default="draft", index=True
    )
    blueprint_status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="not_started", server_default="not_started"
    )

    owner: Mapped["User"] = relationship(back_populates="projects")
    agent_runs: Mapped[list["AgentRun"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    reports: Mapped[list["Report"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    financial_models: Mapped[list["FinancialModel"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    pitch_decks: Mapped[list["PitchDeck"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    documents: Mapped[list["Document"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    notifications: Mapped[list["Notification"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    execution_plan: Mapped["ExecutionPlanRecord | None"] = relationship(
        back_populates="project", uselist=False, cascade="all, delete-orphan"
    )
    cofounder_messages: Mapped[list["CofounderMessageRecord"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    artifacts: Mapped[list["Artifact"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    decisions: Mapped[list["Decision"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    stage_executions: Mapped[list["StageExecutionRecord"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    tasks: Mapped[list["Task"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Project id={self.id} name={self.name!r} status={self.status!r}>"
