"""
Shared ORM mixins applied consistently across every model so identity and
audit-timestamp behavior doesn't get reimplemented per table.

`default=` is set alongside `server_default=` on purpose: the Python-side
default lets a newly-constructed instance be used (e.g. for a relationship
that needs `.id` before the row is flushed) without a round trip, while
`server_default` keeps the same default expressed in the generated DDL for
any insert that bypasses the ORM.
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column


class UUIDPrimaryKeyMixin:
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
