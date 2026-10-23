"""
Agent — near-static reference table for the six agent types the orchestrator
dispatches to (see docs/00-prd-and-agent-architecture.md). Rows are managed
by app/db/seed.py, not by user-facing API routes.
"""
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.agent_run import AgentRun


class Agent(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "agents"

    key: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    default_model: Mapped[str] = mapped_column(
        String(50), nullable=False, default="claude-sonnet-4-6", server_default="claude-sonnet-4-6"
    )
    output_schema_version: Mapped[str] = mapped_column(
        String(20), nullable=False, default="v1", server_default="v1"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )

    agent_runs: Mapped[list["AgentRun"]] = relationship(back_populates="agent")

    def __repr__(self) -> str:
        return f"<Agent key={self.key!r} name={self.name!r}>"
