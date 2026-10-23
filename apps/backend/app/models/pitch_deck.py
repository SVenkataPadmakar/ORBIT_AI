"""
PitchDeck — the Pitch Deck Agent's output: slide deck, business plan, and
executive summary for one project, plus export URLs once PPTX/PDF exports
have been generated (Phase 3 in the roadmap: Blueprint & Export).
"""
import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import ForeignKey, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.agent_run import AgentRun
    from app.models.project import Project


class PitchDeck(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "pitch_decks"
    __table_args__ = (
        UniqueConstraint("agent_run_id", name="uq_pitch_decks_agent_run_id"),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    agent_run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="CASCADE"), nullable=False
    )
    slides: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, nullable=False)
    business_plan_markdown: Mapped[str | None] = mapped_column(Text, nullable=True)
    executive_summary_markdown: Mapped[str | None] = mapped_column(Text, nullable=True)
    exported_pptx_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    exported_pdf_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    project: Mapped["Project"] = relationship(back_populates="pitch_decks")
    agent_run: Mapped["AgentRun"] = relationship(back_populates="pitch_deck")

    def __repr__(self) -> str:
        return f"<PitchDeck id={self.id} project_id={self.project_id}>"
