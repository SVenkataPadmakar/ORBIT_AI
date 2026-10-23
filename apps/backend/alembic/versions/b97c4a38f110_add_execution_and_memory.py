"""add execution plans and cofounder memory

Revision ID: b97c4a38f110
Revises: 134d42a430c6
Create Date: 2026-08-13 17:10:00
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "b97c4a38f110"
down_revision: str | None = "134d42a430c6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "execution_plans",
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("plan", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("task_states", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("confidence_score", sa.Integer(), nullable=False),
        sa.Column("generation_mode", sa.String(length=30), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("project_id", name="uq_execution_plan_project"),
    )
    op.create_index("ix_execution_plans_project_id", "execution_plans", ["project_id"])
    op.create_table(
        "cofounder_messages",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("context_snapshot", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("provider", sa.String(length=40), nullable=True),
        sa.Column("tokens_used", sa.Integer(), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_cofounder_messages_project_id", "cofounder_messages", ["project_id"])
    op.create_index("ix_cofounder_messages_user_id", "cofounder_messages", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_cofounder_messages_user_id", table_name="cofounder_messages")
    op.drop_index("ix_cofounder_messages_project_id", table_name="cofounder_messages")
    op.drop_table("cofounder_messages")
    op.drop_index("ix_execution_plans_project_id", table_name="execution_plans")
    op.drop_table("execution_plans")
