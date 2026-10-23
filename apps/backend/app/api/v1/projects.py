"""Project CRUD, pipeline orchestration, and artifact endpoints."""
from uuid import UUID

from fastapi import APIRouter, Query, Response, status
from redis.asyncio import Redis

from app.agents.providers import select_provider
from app.api.dependencies import CurrentUser, DbSession
from app.core.config import get_settings
from app.core.errors import ServiceUnavailableError
from app.models.agent_run import AgentRun
from app.orchestration.agent_graph import run_agent_workflow
from app.schemas.debate import DebateCycleResponse, DebateEventItem
from app.schemas.pipeline import (
    AgentRunResponse,
    FinancialModelResponse,
    PipelineResultResponse,
    PipelineRunResponse,
    PipelineStatusResponse,
    PitchDeckResponse,
    ReportResponse,
)
from app.schemas.project import ProjectCreate, ProjectListResponse, ProjectResponse, ProjectUpdate
from app.services.pipeline_service import PipelineService
from app.services.project_service import ProjectService

router = APIRouter()


def _run_response(run: AgentRun) -> AgentRunResponse:
    mode, provider, model = PipelineService.run_metadata(run)
    return AgentRunResponse(
        id=run.id,
        pipeline_run_id=run.pipeline_run_id,
        stage=run.agent.key,
        status=run.status,
        mode=mode,
        provider=provider,
        model=model,
        error_message=run.error_message,
        started_at=run.started_at,
        completed_at=run.completed_at,
    )


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate, current_user: CurrentUser, db: DbSession
) -> ProjectResponse:
    return ProjectResponse.model_validate(await ProjectService(db).create(current_user.id, data))


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    current_user: CurrentUser,
    db: DbSession,
    status_filter: str | None = Query(default=None, alias="status"),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
) -> ProjectListResponse:
    items, total = await ProjectService(db).projects.list_for_owner(
        current_user.id, status=status_filter, offset=offset, limit=limit
    )
    return ProjectListResponse(
        items=[ProjectResponse.model_validate(item) for item in items],
        total=total,
        offset=offset,
        limit=limit,
    )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID, current_user: CurrentUser, db: DbSession
) -> ProjectResponse:
    project = await ProjectService(db).get_owned(project_id, current_user.id)
    return ProjectResponse.model_validate(project)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID, data: ProjectUpdate, current_user: CurrentUser, db: DbSession
) -> ProjectResponse:
    project = await ProjectService(db).update(project_id, current_user.id, data)
    return ProjectResponse.model_validate(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID, current_user: CurrentUser, db: DbSession
) -> Response:
    await ProjectService(db).delete(project_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{project_id}/pipeline/start", response_model=PipelineRunResponse)
async def start_pipeline(
    project_id: UUID, current_user: CurrentUser, db: DbSession
) -> PipelineRunResponse:
    service = PipelineService(db)
    run_id, count = await service.prepare_run(project_id, current_user.id)
    settings = get_settings()
    inline = settings.pipeline_execution_mode == "inline" or (
        settings.pipeline_execution_mode == "auto"
        and settings.environment in {"development", "test"}
    )

    if inline:
        runs = await service.execute(run_id)
        execution = "inline"
        response_status = service.aggregate_status(runs)
    else:
        try:
            redis = Redis.from_url(
                settings.redis_url, socket_connect_timeout=0.35, socket_timeout=0.35
            )
            try:
                await redis.ping()
            finally:
                await redis.aclose()
            from app.workers.tasks.pipeline import run_pipeline

            run_pipeline.apply_async(args=[str(run_id)], queue="pipeline")
        except Exception as exc:
            await service.fail_dispatch(run_id)
            raise ServiceUnavailableError(
                "Pipeline queue is unavailable; retry after the worker infrastructure is ready"
            ) from exc
        execution = "queued"
        response_status = "queued"

    provider = select_provider()
    return PipelineRunResponse(
        pipeline_run_id=run_id,
        project_id=project_id,
        status=response_status,
        run_count=count,
        execution=execution,
        mode="provider" if provider is not None else "demo",
        provider=provider.name if provider is not None else "deterministic-demo",
    )


@router.get("/{project_id}/pipeline/latest", response_model=PipelineStatusResponse)
async def latest_pipeline_status(
    project_id: UUID, current_user: CurrentUser, db: DbSession
) -> PipelineStatusResponse:
    service = PipelineService(db)
    runs = await service.latest_status(project_id, current_user.id)
    pipeline_run_id = runs[0].pipeline_run_id
    return PipelineStatusResponse(
        pipeline_run_id=pipeline_run_id,
        project_id=project_id,
        status=service.aggregate_status(runs),
        runs=[_run_response(run) for run in runs],
    )


@router.get("/{project_id}/pipeline/{pipeline_run_id}", response_model=PipelineStatusResponse)
async def pipeline_status(
    project_id: UUID, pipeline_run_id: UUID, current_user: CurrentUser, db: DbSession
) -> PipelineStatusResponse:
    service = PipelineService(db)
    runs = await service.status(project_id, pipeline_run_id, current_user.id)
    return PipelineStatusResponse(
        pipeline_run_id=pipeline_run_id,
        project_id=project_id,
        status=service.aggregate_status(runs),
        runs=[_run_response(run) for run in runs],
    )


@router.get(
    "/{project_id}/pipeline/{pipeline_run_id}/result",
    response_model=PipelineResultResponse,
)
async def pipeline_result(
    project_id: UUID, pipeline_run_id: UUID, current_user: CurrentUser, db: DbSession
) -> PipelineResultResponse:
    service = PipelineService(db)
    runs, outputs = await service.result(project_id, pipeline_run_id, current_user.id)
    return PipelineResultResponse(
        pipeline_run_id=pipeline_run_id,
        project_id=project_id,
        status=service.aggregate_status(runs),
        runs=[_run_response(run) for run in runs],
        outputs=outputs,
    )


@router.get("/{project_id}/reports", response_model=list[ReportResponse])
async def list_reports(
    project_id: UUID, current_user: CurrentUser, db: DbSession
) -> list[ReportResponse]:
    reports = await PipelineService(db).reports(project_id, current_user.id)
    return [ReportResponse.model_validate(report) for report in reports]


@router.get("/{project_id}/artifacts/research", response_model=ReportResponse)
async def get_research_artifact(
    project_id: UUID, current_user: CurrentUser, db: DbSession
) -> ReportResponse:
    artifact = await PipelineService(db).report_artifact(
        project_id, current_user.id, "market_research"
    )
    return ReportResponse.model_validate(artifact)


@router.get("/{project_id}/artifacts/prd", response_model=ReportResponse)
async def get_prd_artifact(
    project_id: UUID, current_user: CurrentUser, db: DbSession
) -> ReportResponse:
    artifact = await PipelineService(db).report_artifact(project_id, current_user.id, "prd")
    return ReportResponse.model_validate(artifact)


@router.get("/{project_id}/artifacts/roadmap", response_model=ReportResponse)
async def get_roadmap_artifact(
    project_id: UUID, current_user: CurrentUser, db: DbSession
) -> ReportResponse:
    artifact = await PipelineService(db).report_artifact(project_id, current_user.id, "roadmap")
    return ReportResponse.model_validate(artifact)


@router.get("/{project_id}/artifacts/financials", response_model=FinancialModelResponse)
async def get_financial_artifact(
    project_id: UUID, current_user: CurrentUser, db: DbSession
) -> FinancialModelResponse:
    artifact = await PipelineService(db).financial_artifact(project_id, current_user.id)
    return FinancialModelResponse.model_validate(artifact)


@router.get("/{project_id}/artifacts/pitch", response_model=PitchDeckResponse)
async def get_pitch_artifact(
    project_id: UUID, current_user: CurrentUser, db: DbSession
) -> PitchDeckResponse:
    artifact = await PipelineService(db).pitch_artifact(project_id, current_user.id)
    return PitchDeckResponse.model_validate(artifact)


@router.get("/{project_id}/artifacts/vc", response_model=ReportResponse)
async def get_vc_artifact(
    project_id: UUID, current_user: CurrentUser, db: DbSession
) -> ReportResponse:
    artifact = await PipelineService(db).report_artifact(
        project_id, current_user.id, "vc_evaluation"
    )
    return ReportResponse.model_validate(artifact)


@router.post("/{project_id}/debate", response_model=DebateCycleResponse)
async def trigger_debate_cycle(
    project_id: UUID, current_user: CurrentUser, db: DbSession
) -> DebateCycleResponse:
    """Trigger a multi-agent debate and consensus cycle via LangGraph."""
    project = await ProjectService(db).get_owned(project_id, current_user.id)
    graph_res = await run_agent_workflow(
        str(project.id),
        project.name,
        {"industry": project.industry, "target_audience": project.target_audience},
    )

    debates = [
        DebateEventItem(
            id=d.get("id", f"deb_{idx}"),
            agentA=d.get("agentA", "Agent A"),
            agentB=d.get("agentB", "Agent B"),
            topic=d.get("topic", "Architectural Strategy"),
            agentAArg=d.get("agentAArg", ""),
            agentBArg=d.get("agentBArg", ""),
            resolution=d.get("resolution", ""),
            confidenceScore=d.get("confidenceScore", 90),
            status=d.get("status", "verified"),
        )
        for idx, d in enumerate(graph_res.get("debate_rounds", []))
    ]

    return DebateCycleResponse(
        project_id=str(project.id),
        status=graph_res.get("consensus_status", "Consensus Reached"),
        consensus_score=graph_res.get("consensus_score", 90),
        debates=debates,
        round=graph_res.get("current_debate_round", 1),
        reflection_count=len(graph_res.get("reflections", [])),
    )


@router.get("/{project_id}/debate", response_model=DebateCycleResponse)
async def get_debate_state(
    project_id: UUID, current_user: CurrentUser, db: DbSession
) -> DebateCycleResponse:
    """Retrieve the latest debate status and consensus score."""
    project = await ProjectService(db).get_owned(project_id, current_user.id)
    # Return active cycle or fast synthesis
    graph_res = await run_agent_workflow(
        str(project.id),
        project.name,
        {"industry": project.industry, "target_audience": project.target_audience},
    )

    debates = [
        DebateEventItem(
            id=d.get("id", f"deb_{idx}"),
            agentA=d.get("agentA", "Agent A"),
            agentB=d.get("agentB", "Agent B"),
            topic=d.get("topic", "Architectural Strategy"),
            agentAArg=d.get("agentAArg", ""),
            agentBArg=d.get("agentBArg", ""),
            resolution=d.get("resolution", ""),
            confidenceScore=d.get("confidenceScore", 90),
            status=d.get("status", "verified"),
        )
        for idx, d in enumerate(graph_res.get("debate_rounds", []))
    ]

    return DebateCycleResponse(
        project_id=str(project.id),
        status=graph_res.get("consensus_status", "Consensus Reached"),
        consensus_score=graph_res.get("consensus_score", 90),
        debates=debates,
        round=graph_res.get("current_debate_round", 1),
        reflection_count=len(graph_res.get("reflections", [])),
    )

