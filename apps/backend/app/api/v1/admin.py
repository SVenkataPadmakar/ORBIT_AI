"""Role-guarded administration metrics and user management views for the single administrator."""
from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy import case, func, select

from app.api.dependencies import AdminUser, DbSession
from app.core.config import get_settings
from app.models.agent_run import AgentRun
from app.models.execution import CofounderMessageRecord
from app.models.project import Project
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.auth import AdminLoginRequest, TokenResponse, UserResponse
from app.schemas.execution import AdminMetric, AdminOverview, AdminUserResponse
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/login", response_model=TokenResponse, summary="Separate Admin Login Portal")
async def admin_portal_login(
    data: AdminLoginRequest, request: Request, response: Response, db: DbSession
) -> TokenResponse:
    """
    Dedicated admin login route under /v1/admin/login.
    Rule: Requires role == 'admin'. Customer accounts are forbidden.
    """
    auth_service = AuthService(db)
    user = await auth_service.authenticate_admin(data)
    access, refresh = await auth_service.issue_tokens(
        user,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )
    settings = get_settings()
    response.set_cookie(
        "refresh_token",
        refresh,
        max_age=settings.refresh_token_expire_days * 86400,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        path="/v1/auth",
    )
    return TokenResponse(
        access_token=access,
        expires_in=settings.access_token_expire_minutes * 60,
        user=UserResponse.model_validate(user),
    )


@router.get("/account", response_model=UserResponse, summary="Single Administrator Account Profile")
async def get_admin_account(admin: AdminUser) -> UserResponse:
    """Returns the verified single administrator identity."""
    return UserResponse.model_validate(admin)


@router.get("/overview", response_model=AdminOverview, summary="Platform Overview Telemetry")
async def overview(_admin: AdminUser, db: DbSession) -> AdminOverview:
    user_count = int((await db.execute(select(func.count(User.id)))).scalar_one())
    active_users = int((await db.execute(select(func.count(User.id)).where(User.is_active.is_(True)))).scalar_one())
    project_count = int((await db.execute(select(func.count(Project.id)))).scalar_one())
    runs = (await db.execute(
        select(
            func.count(AgentRun.id),
            func.coalesce(func.sum(AgentRun.tokens_used), 0),
            func.sum(case((AgentRun.status == "failed", 1), else_=0)),
        )
    )).one()
    paid = int((await db.execute(
        select(func.count(Subscription.id)).where(
            Subscription.plan.in_(("pro", "team")), Subscription.status == "active"
        )
    )).scalar_one())
    messages = int((await db.execute(select(func.count(CofounderMessageRecord.id)))).scalar_one())
    total_runs, tokens, failed = int(runs[0]), int(runs[1]), int(runs[2] or 0)
    success_rate = round(((total_runs - failed) / total_runs) * 100, 1) if total_runs else 100.0
    estimated_mrr = paid * 49
    return AdminOverview(
        users=[
            AdminMetric(label="Total users", value=user_count),
            AdminMetric(label="Active users", value=active_users),
            AdminMetric(label="Projects", value=project_count),
        ],
        revenue=[
            AdminMetric(label="Estimated MRR", value=estimated_mrr),
            AdminMetric(label="Paid accounts", value=paid),
            AdminMetric(label="ARPA", value=round(estimated_mrr / paid, 2) if paid else 0),
        ],
        agents=[
            AdminMetric(label="Agent stages", value=total_runs),
            AdminMetric(label="Success rate", value=f"{success_rate}%"),
            AdminMetric(label="Failed stages", value=failed),
        ],
        system=[
            AdminMetric(label="API status", value="Operational"),
            AdminMetric(label="Database", value="Connected"),
            AdminMetric(label="Queue mode", value="Configured"),
        ],
        api_usage=[
            AdminMetric(label="AI tokens", value=tokens),
            AdminMetric(label="Co-founder messages", value=messages),
            AdminMetric(
                label="Avg tokens / stage",
                value=round(tokens / total_runs) if total_runs else 0,
            ),
        ],
    )


@router.get("/users", response_model=list[AdminUserResponse], summary="List Platform Users")
async def list_users(
    _admin: AdminUser,
    db: DbSession,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
) -> list[AdminUserResponse]:
    result = await db.execute(
        select(User).order_by(User.created_at.desc()).offset(offset).limit(limit)
    )
    return [AdminUserResponse.model_validate(user) for user in result.scalars().all()]
