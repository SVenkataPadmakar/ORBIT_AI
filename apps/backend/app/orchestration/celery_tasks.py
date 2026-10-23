"""
Celery tasks for durable, asynchronous agent orchestration.
"""
import asyncio
from typing import Any

from app.orchestration.agent_graph import run_agent_workflow
from app.orchestration.langgraph_debater import execute_debate_graph
from app.workers.celery_app import celery_app


@celery_app.task(
    bind=True,
    name="app.orchestration.celery_tasks.run_agent",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    retry_kwargs={"max_retries": 3},
)  # type: ignore[untyped-decorator]
def run_agent(_task: Any, project_id: str, agent_type: str, input_data: dict[str, Any]) -> dict[str, Any]:
    """
    Run an agent synchronously within the Celery worker (wrapping async logic).
    """
    return asyncio.run(run_agent_workflow(project_id, input_data.get("name", "Project"), input_data))


@celery_app.task(
    bind=True,
    name="app.orchestration.celery_tasks.run_debate",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 1},
)  # type: ignore[untyped-decorator]
def run_debate(_task: Any, project_id: str, topic: str, proposals: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    """
    Execute a multi-agent debate using LangGraph.
    """
    return asyncio.run(execute_debate_graph(project_id, topic))
