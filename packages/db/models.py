"""
ORBIT v2 — SQLAlchemy 2.0 Async Models.
Maps 1:1 to packages/db/schema.sql (3NF Postgres).
Designed by DataModelerAgent (Division B2).
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    """Standardized UTC audit timestamps."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.current_timestamp(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
        nullable=False,
    )


# =============================================================================
# 1. USER MODEL
# =============================================================================
class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    sessions: Mapped[list[Session]] = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    memberships: Mapped[list[Membership]] = relationship("Membership", back_populates="user", cascade="all, delete-orphan")
    runs: Mapped[list[Run]] = relationship("Run", back_populates="creator")
    orders: Mapped[list[Order]] = relationship("Order", back_populates="user")


# =============================================================================
# 2. ORGANIZATION (ORG) MODEL
# =============================================================================
class Org(Base, TimestampMixin):
    __tablename__ = "orgs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    billing_email: Mapped[str] = mapped_column(String(255), nullable=False)
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True)
    subscription_tier: Mapped[str] = mapped_column(String(50), default="free", nullable=False)

    # Relationships
    memberships: Mapped[list[Membership]] = relationship("Membership", back_populates="org", cascade="all, delete-orphan")
    runs: Mapped[list[Run]] = relationship("Run", back_populates="org", cascade="all, delete-orphan")
    orders: Mapped[list[Order]] = relationship("Order", back_populates="org")


# =============================================================================
# 3. MEMBERSHIP MODEL
# =============================================================================
class Membership(Base, TimestampMixin):
    __tablename__ = "memberships"
    __table_args__ = (
        UniqueConstraint("user_id", "org_id", name="uq_membership_user_org"),
        Index("idx_memberships_user_id", "user_id"),
        Index("idx_memberships_org_id", "org_id"),
        Index("idx_memberships_role", "role"),
        CheckConstraint("role IN ('owner', 'admin', 'member', 'viewer')", name="chk_membership_role"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="member", nullable=False)

    # Relationships
    user: Mapped[User] = relationship("User", back_populates="memberships")
    org: Mapped[Org] = relationship("Org", back_populates="memberships")


# =============================================================================
# 4. SESSION MODEL (REFRESH TOKENS)
# =============================================================================
class Session(Base, TimestampMixin):
    __tablename__ = "sessions"
    __table_args__ = (
        Index("idx_sessions_user_id", "user_id"),
        Index("idx_sessions_token_hash", "refresh_token_hash"),
        Index("idx_sessions_expires_at", "expires_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    refresh_token_hash: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45))
    user_agent: Mapped[Optional[str]] = mapped_column(Text)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    user: Mapped[User] = relationship("User", back_populates="sessions")


# =============================================================================
# 5. RUN MODEL (ORCHESTRATION PIPELINE)
# =============================================================================
class Run(Base, TimestampMixin):
    __tablename__ = "runs"
    __table_args__ = (
        Index("idx_runs_run_id", "run_id"),
        Index("idx_runs_org_id", "org_id"),
        Index("idx_runs_created_by", "created_by"),
        Index("idx_runs_status", "status"),
        Index("idx_runs_current_node", "current_node"),
        Index("idx_runs_created_at", "created_at"),
        CheckConstraint(
            "status IN ('intake', 'awaiting_clarification', 'scope_locked', 'building', 'verifying', 'repaired', 'completed', 'failed')",
            name="chk_run_status",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    run_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    idea_raw: Mapped[str] = mapped_column(Text, nullable=False)
    normalized_idea: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), default="intake", nullable=False)
    current_node: Mapped[str] = mapped_column(String(50), default="Intake", nullable=False)
    clarity_score: Mapped[Optional[float]] = mapped_column(Numeric(3, 2))
    scope_locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    repair_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reproducibility_hash: Mapped[Optional[str]] = mapped_column(String(64))

    # Relationships
    org: Mapped[Org] = relationship("Org", back_populates="runs")
    creator: Mapped[User] = relationship("User", back_populates="runs")
    specifications: Mapped[list[Specification]] = relationship("Specification", back_populates="run", cascade="all, delete-orphan")
    artifacts: Mapped[list[Artifact]] = relationship("Artifact", back_populates="run", cascade="all, delete-orphan")
    repairs: Mapped[list[Repair]] = relationship("Repair", back_populates="run", cascade="all, delete-orphan")
    orders: Mapped[list[Order]] = relationship("Order", back_populates="run")


# =============================================================================
# 6. SPECIFICATION MODEL (PRD, SCOPE CONTRACT, ARCHITECTURE)
# =============================================================================
class Specification(Base, TimestampMixin):
    __tablename__ = "specifications"
    __table_args__ = (
        UniqueConstraint("run_id", "version", name="uq_specifications_run_version"),
        Index("idx_specifications_run_id", "run_id"),
        Index("idx_specifications_scope_contract", "scope_contract", postgresql_using="gin"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    run_id: Mapped[str] = mapped_column(String(64), ForeignKey("runs.run_id", ondelete="CASCADE"), nullable=False)
    prd_markdown: Mapped[str] = mapped_column(Text, nullable=False)
    scope_contract: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    architecture_spec: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Relationships
    run: Mapped[Run] = relationship("Run", back_populates="specifications")


# =============================================================================
# 7. ARTIFACT MODEL
# =============================================================================
class Artifact(Base, TimestampMixin):
    __tablename__ = "artifacts"
    __table_args__ = (
        Index("idx_artifacts_artifact_id", "artifact_id"),
        Index("idx_artifacts_run_id", "run_id"),
        Index("idx_artifacts_type", "artifact_type"),
        CheckConstraint(
            "artifact_type IN ('prd', 'scope_contract', 'openapi_spec', 'db_schema', 'ui_spec', 'package_zip', 'test_report', 'threat_model')",
            name="chk_artifact_type",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    artifact_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    run_id: Mapped[str] = mapped_column(String(64), ForeignKey("runs.run_id", ondelete="CASCADE"), nullable=False)
    artifact_type: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    run: Mapped[Run] = relationship("Run", back_populates="artifacts")


# =============================================================================
# 8. REPAIR MODEL (REMEDIATION LOG)
# =============================================================================
class Repair(Base, TimestampMixin):
    __tablename__ = "repairs"
    __table_args__ = (
        Index("idx_repairs_repair_id", "repair_id"),
        Index("idx_repairs_run_id", "run_id"),
        Index("idx_repairs_node", "node"),
        Index("idx_repairs_status", "status"),
        CheckConstraint(
            "status IN ('in_progress', 'resolved', 'exhausted', 'failed')",
            name="chk_repair_status",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    repair_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    run_id: Mapped[str] = mapped_column(String(64), ForeignKey("runs.run_id", ondelete="CASCADE"), nullable=False)
    node: Mapped[str] = mapped_column(String(50), nullable=False)
    attempt_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    error_type: Mapped[str] = mapped_column(String(100), nullable=False)
    error_message: Mapped[str] = mapped_column(Text, nullable=False)
    diff_applied: Mapped[Optional[str]] = mapped_column(Text)
    files_touched: Mapped[list[str]] = mapped_column(JSONB, default=list, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="in_progress", nullable=False)

    # Relationships
    run: Mapped[Run] = relationship("Run", back_populates="repairs")


# =============================================================================
# 9. ORDER MODEL (PAY-PER-EXPORT $29 MONOREPO DOWNLOADS)
# =============================================================================
class Order(Base, TimestampMixin):
    __tablename__ = "orders"
    __table_args__ = (
        Index("idx_orders_order_number", "order_number"),
        Index("idx_orders_org_id", "org_id"),
        Index("idx_orders_user_id", "user_id"),
        Index("idx_orders_run_id", "run_id"),
        Index("idx_orders_stripe_session_id", "stripe_session_id"),
        Index("idx_orders_download_token", "download_token"),
        Index("idx_orders_status", "status"),
        CheckConstraint("status IN ('pending', 'paid', 'failed', 'refunded')", name="chk_order_status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    order_number: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orgs.id", ondelete="RESTRICT"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    run_id: Mapped[str] = mapped_column(String(64), ForeignKey("runs.run_id", ondelete="RESTRICT"), nullable=False)
    amount_cents: Mapped[int] = mapped_column(Integer, default=2900, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    stripe_session_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True)
    stripe_payment_intent_id: Mapped[Optional[str]] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    download_token: Mapped[Optional[str]] = mapped_column(String(128), unique=True)
    download_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Relationships
    org: Mapped[Org] = relationship("Org", back_populates="orders")
    user: Mapped[User] = relationship("User", back_populates="orders")
    run: Mapped[Run] = relationship("Run", back_populates="orders")
