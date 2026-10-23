"""Execution Center and persistent AI co-founder endpoints."""
from uuid import UUID

from fastapi import APIRouter, Query

from app.api.dependencies import CurrentUser, DbSession
from app.schemas.cofounder_intelligence import (
    AssumptionChallengeRequest,
    AssumptionChallengeResponse,
    CofounderExplainArchitectureResponse,
    CofounderExplainDecisionResponse,
    CofounderExplainRisksResponse,
    CofounderExplainRoadmapResponse,
    CofounderExplainStageResponse,
    CofounderMemoryState,
    DecisionCreateRequest,
    DecisionMemoryItem,
    WorkspaceGuidance,
)
from app.schemas.execution import (
    CofounderMessage,
    CofounderMessageCreate,
    CofounderResponse,
    ExecutionPlan,
    TaskStatusUpdate,
)
from app.services.cofounder_service import CofounderService
from app.services.execution_service import ExecutionService

router = APIRouter()


@router.get("/projects/{project_id}/execution", response_model=ExecutionPlan)
async def get_execution_plan(
    project_id: UUID, current_user: CurrentUser, db: DbSession
) -> ExecutionPlan:
    return await ExecutionService(db).get_or_generate(project_id, current_user.id)


@router.post("/projects/{project_id}/execution/regenerate", response_model=ExecutionPlan)
async def regenerate_execution_plan(
    project_id: UUID, current_user: CurrentUser, db: DbSession
) -> ExecutionPlan:
    return await ExecutionService(db).regenerate(project_id, current_user.id)


@router.patch("/projects/{project_id}/execution/tasks/{task_id}", response_model=ExecutionPlan)
async def update_execution_task(
    project_id: UUID,
    task_id: str,
    data: TaskStatusUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> ExecutionPlan:
    return await ExecutionService(db).update_task(project_id, current_user.id, task_id, data.status)


@router.post("/cofounder/chat", response_model=CofounderResponse)
async def chat(
    data: CofounderMessageCreate, current_user: CurrentUser, db: DbSession
) -> CofounderResponse:
    return await CofounderService(db).ask(
        current_user.id, data.message, data.project_id, data.page_context
    )


@router.get("/cofounder/history", response_model=list[CofounderMessage])
async def chat_history(
    current_user: CurrentUser,
    db: DbSession,
    project_id: UUID | None = None,
    limit: int = Query(default=30, ge=1, le=100),  # noqa: B008
) -> list[CofounderMessage]:
    return await CofounderService(db).history(current_user.id, project_id, limit)


# ─── PERSISTENT CO-FOUNDER INTELLIGENCE LAYER ENDPOINTS ───────────────────────

@router.get("/cofounder/memory", response_model=CofounderMemoryState)
async def get_cofounder_memory(
    project_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> CofounderMemoryState:
    """Retrieve the full 4-layer synthesized memory (Project, Decision, Product, Execution)."""
    return await CofounderService(db).get_memory(project_id, current_user.id)


@router.get("/cofounder/guidance", response_model=WorkspaceGuidance)
async def get_workspace_guidance(
    project_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
    workspace: str = Query(default="mission", max_length=50),
) -> WorkspaceGuidance:
    """Retrieve proactive co-founder suggestions, warnings, risks, and opportunities for a workspace."""
    return await CofounderService(db).get_workspace_guidance(project_id, current_user.id, workspace)


@router.post("/cofounder/decisions", response_model=DecisionMemoryItem)
async def log_decision(
    data: DecisionCreateRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> DecisionMemoryItem:
    """Explicitly record a founder decision, rationale, and trade-offs into Decision Memory."""
    return await CofounderService(db).log_decision(data.project_id, current_user.id, data)


@router.post("/cofounder/challenge", response_model=AssumptionChallengeResponse)
async def challenge_assumption(
    data: AssumptionChallengeRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> AssumptionChallengeResponse:
    """Request counter-factual analysis and a 7-day smoke-test experiment challenging an assumption."""
    return await CofounderService(db).challenge_assumption(data.project_id, current_user.id, data)


# ─── PERMANENT AI CO-FOUNDER EXPLAINABILITY ENDPOINTS ──────────────────────────

@router.get(
    "/projects/{project_id}/cofounder/explain-decision",
    response_model=CofounderExplainDecisionResponse,
)
@router.get(
    "/cofounder/explain-decision",
    response_model=CofounderExplainDecisionResponse,
)
async def explain_decision(
    project_id: UUID,
    decision_id: str = Query(..., description="Decision ID or keyword"),
    current_user: CurrentUser = None,  # type: ignore[assignment]
    db: DbSession = None,  # type: ignore[assignment]
) -> CofounderExplainDecisionResponse:
    """Co-Founder explanation of why a decision was reached, trade-offs, and rejected alternatives."""
    return await CofounderService(db).explain_decision(project_id, current_user.id, decision_id)


@router.get(
    "/projects/{project_id}/cofounder/explain-architecture",
    response_model=CofounderExplainArchitectureResponse,
)
@router.get(
    "/cofounder/explain-architecture",
    response_model=CofounderExplainArchitectureResponse,
)
async def explain_architecture(
    project_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> CofounderExplainArchitectureResponse:
    """Co-Founder explanation of tech stack topology, scalability limits, security posture, and data models."""
    return await CofounderService(db).explain_architecture(project_id, current_user.id)


@router.get(
    "/projects/{project_id}/cofounder/explain-roadmap",
    response_model=CofounderExplainRoadmapResponse,
)
@router.get(
    "/cofounder/explain-roadmap",
    response_model=CofounderExplainRoadmapResponse,
)
async def explain_roadmap(
    project_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> CofounderExplainRoadmapResponse:
    """Co-Founder explanation of the 7-stage roadmap, milestones, critical path, and runway alignment."""
    return await CofounderService(db).explain_roadmap(project_id, current_user.id)


@router.get(
    "/projects/{project_id}/cofounder/explain-risks",
    response_model=CofounderExplainRisksResponse,
)
@router.get(
    "/cofounder/explain-risks",
    response_model=CofounderExplainRisksResponse,
)
async def explain_risks(
    project_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> CofounderExplainRisksResponse:
    """Co-Founder audit of startup risks across validation, technical, GTM, and burn-rate dimensions."""
    return await CofounderService(db).explain_risks(project_id, current_user.id)


@router.get(
    "/projects/{project_id}/cofounder/explain-stage/{stage}",
    response_model=CofounderExplainStageResponse,
)
async def explain_stage_output(
    project_id: UUID,
    stage: str,
    current_user: CurrentUser,
    db: DbSession,
) -> CofounderExplainStageResponse:
    """Co-Founder explanation of a specific agent's stage output, inputs, reasoning, and evidence."""
    return await CofounderService(db).explain_agent_outputs(project_id, current_user.id, stage)

