"""
Data access for AgentRun. `list_for_pipeline` backs the pipeline-status
polling/WebSocket endpoint; the `mark_*` helpers are the single place status
transitions happen so timestamp handling (`started_at`/`completed_at`) can't
drift between call sites (the Celery task, retry logic, and any future admin
tooling all go through the same three methods).
"""
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent_run import AgentRun
from app.repositories.base_repository import BaseRepository


class AgentRunRepository(BaseRepository[AgentRun]):
    model = AgentRun

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def list_for_pipeline(self, pipeline_run_id: UUID) -> list[AgentRun]:
        result = await self.session.execute(
            select(AgentRun)
            .where(AgentRun.pipeline_run_id == pipeline_run_id)
            .order_by(AgentRun.created_at.asc())
        )
        return list(result.scalars().all())

    async def list_for_project(self, project_id: UUID, *, limit: int = 50) -> list[AgentRun]:
        result = await self.session.execute(
            select(AgentRun)
            .where(AgentRun.project_id == project_id)
            .order_by(AgentRun.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def mark_started(self, agent_run: AgentRun) -> AgentRun:
        agent_run.status = "running"
        agent_run.started_at = datetime.now(UTC)
        await self.session.flush()
        return agent_run

    async def mark_completed(
        self,
        agent_run: AgentRun,
        *,
        structured_output: dict[str, Any],
        tokens_used: int,
        cost_usd: float,
    ) -> AgentRun:
        agent_run.status = "success"
        agent_run.structured_output = structured_output
        agent_run.tokens_used = tokens_used
        # asyncpg requires a Decimal (not a bare float) for NUMERIC columns;
        # converting via str() avoids binary-float representation artifacts
        # (e.g. 0.1 + 0.2 != Decimal("0.3")) that Decimal(float) would carry over.
        agent_run.cost_usd = Decimal(str(cost_usd))
        agent_run.completed_at = datetime.now(UTC)
        await self.session.flush()
        return agent_run

    async def mark_failed(self, agent_run: AgentRun, *, error_message: str) -> AgentRun:
        agent_run.status = "failed"
        agent_run.error_message = error_message
        agent_run.completed_at = datetime.now(UTC)
        await self.session.flush()
        return agent_run
