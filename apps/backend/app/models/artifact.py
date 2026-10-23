"""
Artifact models for persistent Startup Memory and Dependency Tracking.
"""
import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.project import Project


class Artifact(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "artifacts"

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Type of artifact (e.g. PRD, DB_SCHEMA, UX_FLOW, TASK)
    type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="DRAFT", index=True)
    # Current version number
    version: Mapped[int] = mapped_column(nullable=False, default=1)
    
    # The active/latest content, redundant with the latest ArtifactVersion for faster querying
    content: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    project: Mapped["Project"] = relationship(back_populates="artifacts")
    versions: Mapped[list["ArtifactVersion"]] = relationship(
        back_populates="artifact", cascade="all, delete-orphan", order_by="desc(ArtifactVersion.version)"
    )


class ArtifactVersion(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "artifact_versions"
    __table_args__ = (UniqueConstraint("artifact_id", "version", name="uq_artifact_version"),)

    artifact_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("artifacts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version: Mapped[int] = mapped_column(nullable=False)
    content: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    artifact: Mapped["Artifact"] = relationship(back_populates="versions")


class ArtifactDependency(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "artifact_dependencies"
    __table_args__ = (UniqueConstraint("source_artifact_id", "target_artifact_id", name="uq_artifact_dep"),)

    source_artifact_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("artifacts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    target_artifact_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("artifacts.id", ondelete="CASCADE"), nullable=False, index=True
    )

    source_artifact: Mapped["Artifact"] = relationship("Artifact", foreign_keys=[source_artifact_id])
    target_artifact: Mapped["Artifact"] = relationship("Artifact", foreign_keys=[target_artifact_id])
