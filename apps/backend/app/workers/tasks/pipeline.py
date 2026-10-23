"""Celery entrypoint for retryable six-stage pipeline execution."""
import asyncio
from typing import Any
from uuid import UUID

from app.db.session import session_scope
from app.services.pipeline_service import PipelineService
from app.workers.celery_app import celery_app


async def _execute_pipeline(pipeline_run_id: UUID) -> dict[str, Any]:
    async with session_scope() as session:
        runs = await PipelineService(session).execute(pipeline_run_id)
        return {
            "pipeline_run_id": str(pipeline_run_id),
            "status": PipelineService.aggregate_status(runs),
            "run_count": len(runs),
        }


@celery_app.task(
    bind=True,
    name="app.workers.tasks.pipeline.run_pipeline",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    retry_kwargs={"max_retries": 2},
)  # type: ignore[untyped-decorator]
def run_pipeline(_task: Any, pipeline_run_id: str) -> dict[str, Any]:
    """Run one prepared pipeline; the service makes completed stages retry-safe."""
    return asyncio.run(_execute_pipeline(UUID(pipeline_run_id)))
