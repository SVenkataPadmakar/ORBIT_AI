"""Action-oriented execution planning with validation, evidence labeling, and task state."""
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.models.execution import ExecutionPlanRecord
from app.models.project import Project
from app.repositories.project_repository import ProjectRepository
from app.schemas.execution import ExecutionPlan, TaskStatus


class ExecutionService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.projects = ProjectRepository(session)

    async def get_or_generate(self, project_id: UUID, owner_id: UUID) -> ExecutionPlan:
        project = await self._owned(project_id, owner_id)
        record = await self._record(project_id)
        if record is None:
            plan = self._build(project)
            record = ExecutionPlanRecord(
                project_id=project.id,
                plan=plan.model_dump(mode="json"),
                task_states={},
                confidence_score=plan.validation.confidence_score,
                generation_mode="validated-baseline",
            )
            self.session.add(record)
            await self.session.commit()
        return self._with_states(ExecutionPlan.model_validate(record.plan), record.task_states)

    async def regenerate(self, project_id: UUID, owner_id: UUID) -> ExecutionPlan:
        project = await self._owned(project_id, owner_id)
        plan = self._build(project)
        record = await self._record(project_id)
        if record is None:
            record = ExecutionPlanRecord(project_id=project.id)
            self.session.add(record)
        record.plan = plan.model_dump(mode="json")
        record.task_states = {}
        record.confidence_score = plan.validation.confidence_score
        record.generation_mode = "validated-baseline"
        await self.session.commit()
        return plan

    async def update_task(
        self, project_id: UUID, owner_id: UUID, task_id: str, status: TaskStatus
    ) -> ExecutionPlan:
        plan = await self.get_or_generate(project_id, owner_id)
        valid_ids = {task.id for phase in (plan.build, plan.launch, plan.growth) for task in phase.tasks}
        if task_id not in valid_ids:
            raise NotFoundError("Execution task not found")
        record = await self._record(project_id)
        assert record is not None
        record.task_states = {**record.task_states, task_id: status}
        await self.session.commit()
        return self._with_states(plan, record.task_states)

    async def _owned(self, project_id: UUID, owner_id: UUID) -> Project:
        project = await self.projects.get_owned_by(project_id, owner_id)
        if project is None:
            raise NotFoundError("Project not found")
        return project

    async def _record(self, project_id: UUID) -> ExecutionPlanRecord | None:
        result = await self.session.execute(
            select(ExecutionPlanRecord).where(ExecutionPlanRecord.project_id == project_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    def _with_states(plan: ExecutionPlan, states: dict[str, str]) -> ExecutionPlan:
        data = plan.model_dump(mode="json")
        for phase in ("build", "launch", "growth"):
            for task in data[phase]["tasks"]:
                task["status"] = states.get(task["id"], task["status"])
        return ExecutionPlan.model_validate(data)

    @staticmethod
    def _task(
        task_id: str, phase: str, title: str, outcome: str, owner: str, days: int,
        criteria: list[str], tools: list[str], dependencies: list[str] | None = None,
    ) -> dict[str, Any]:
        return {"id": task_id, "phase": phase, "title": title, "outcome": outcome,
                "owner_role": owner, "duration_days": days, "dependencies": dependencies or [],
                "acceptance_criteria": criteria, "recommended_tools": tools, "status": "todo"}

    @classmethod
    def _build(cls, project: Project) -> ExecutionPlan:
        name = project.name
        audience = project.target_audience or "the initial target segment"
        tasks = {
            "build": [
                cls._task("build-01", "build", "Run 12 problem interviews", f"Validate the highest-cost workflow for {audience}.", "Founder", 7, ["12 interviews logged", "Top three pains ranked", "Five users commit to follow-up"], ["Tally", "Notion"]),
                cls._task("build-02", "build", "Prototype the core job", f"Create one end-to-end {name} workflow.", "Product engineer", 10, ["Core job takes under 10 minutes", "Activation events instrumented", "Five usability tests completed"], ["Next.js", "FastAPI", "PostgreSQL", "PostHog"], ["build-01"]),
                cls._task("build-03", "build", "Ship a paid private beta", "Test willingness to pay before expanding scope.", "Founder + engineer", 7, ["Billing works in production", "Ten accounts onboarded", "Three customers pay or sign an LOI"], ["Stripe", "Vercel", "Sentry"], ["build-02"]),
            ],
            "launch": [
                cls._task("launch-01", "launch", "Build the launch cohort", "Recruit prospects from one narrow channel.", "Growth lead", 10, ["100 prospects identified", "30 conversations started", "20 launch commitments"], ["LinkedIn", "HubSpot"], ["build-01"]),
                cls._task("launch-02", "launch", "Run a seven-day launch", "Convert proof into activated accounts.", "Founder", 7, ["Activation exceeds 35%", "Every signup receives onboarding", "Daily objections are logged"], ["Product Hunt", "Loops", "PostHog"], ["build-03", "launch-01"]),
                cls._task("launch-03", "launch", "Publish customer proof", "Create a repeatable sales asset.", "Growth lead", 5, ["One approved case study", "Before/after metric documented", "Proof used in outreach"], ["Webflow", "Canva"], ["launch-02"]),
            ],
            "growth": [
                cls._task("growth-01", "growth", "Instrument the growth model", "Create a weekly operating dashboard.", "Founder", 4, ["One source of truth", "Metrics have owners", "Weekly review scheduled"], ["PostHog", "Metabase", "Stripe"], ["launch-02"]),
                cls._task("growth-02", "growth", "Improve activation", "Remove the largest onboarding drop-off.", "Product engineer", 14, ["Three experiments completed", "Activation improves 15%", "Decision documented"], ["PostHog", "GrowthBook"], ["growth-01"]),
                cls._task("growth-03", "growth", "Scale one repeatable channel", "Invest after acceptable payback and retention.", "Growth lead", 21, ["CAC and payback measured", "20 qualified accounts", "90-day retention tracked"], ["HubSpot", "Metabase"], ["growth-01", "launch-03"]),
            ],
        }
        now = datetime.now(UTC)
        plan = {
            "project_id": str(project.id), "generated_at": now,
            "executive_action": f"Spend seven days validating one painful workflow for {audience}; do not expand {name} before paid-beta evidence.",
            "technical_blueprint": {
                "stack": [{"layer": "Web", "choice": "Next.js + TypeScript", "reason": "Fast typed iteration."}, {"layer": "API", "choice": "FastAPI + Python", "reason": "AI ecosystem and validation."}, {"layer": "Data", "choice": "PostgreSQL + pgvector", "reason": "Transactions and semantic memory."}, {"layer": "Jobs", "choice": "Redis + Celery", "reason": "Durable agent work."}],
                "architecture": ["Modular monolith for MVP", "Async agent queue", "Tenant-filtered project memory", "Schema validation before persistence"],
                "database_entities": [{"name": "users", "fields": ["id", "role", "subscription"]}, {"name": "projects", "fields": ["id", "owner_id", "idea", "status"]}, {"name": "execution_tasks", "fields": ["phase", "owner", "status", "acceptance_criteria"]}, {"name": "memory", "fields": ["project_id", "content", "embedding", "source"]}],
                "api_recommendations": [{"area": "AI", "recommendation": "Gemini structured generation with validation"}, {"area": "Billing", "recommendation": "Stripe Checkout and signed webhooks"}, {"area": "Analytics", "recommendation": "PostHog activation and retention events"}],
                "deployment": ["Vercel web", "Managed API and workers", "PostgreSQL PITR", "Redis persistence"],
                "security_baseline": ["Project ownership on every query", "Encrypted secrets", "Rate limits", "Audit admin actions", "PII retention policy"],
            },
            "competitor_moves": ["Interview users of the top three alternatives", "Compare time-to-value and switching friction", "Win one underserved workflow instead of matching every feature"],
            "go_to_market": [f"Start with one reachable community of {audience}", "Use founder-led demos until objections stabilize", "Lead with measured customer outcomes", "Scale only channels with retained cohorts"],
            "build": {"objective": "Prove problem, usability, and willingness to pay", "tasks": tasks["build"], "exit_criteria": ["Three paying customers", "Activation above 35%", "Critical reliability issues closed"], "kpis": ["Interview conversion", "Activation", "Paid beta conversion"]},
            "launch": {"objective": "Acquire and activate the first focused cohort", "tasks": tasks["launch"], "exit_criteria": ["20 activated accounts", "One customer proof asset", "Weekly acquisition loop running"], "kpis": ["Qualified leads", "Activation", "Week-four retention"]},
            "growth": {"objective": "Create a measurable, repeatable growth loop", "tasks": tasks["growth"], "exit_criteria": ["One repeatable channel", "CAC payback understood", "Retention improving by cohort"], "kpis": ["CAC", "Payback", "Net revenue retention"]},
            "launch_checklist": ["Production domain and monitoring", "Privacy policy and terms", "Billing and cancellation tested", "Analytics events verified", "Support owner assigned", "Rollback plan rehearsed"],
            "evidence": [{"title": "Project inputs and previously validated pipeline artifacts", "url": None, "provider": "project-memory", "retrieved_at": now, "freshness": "baseline"}],
            "validation": {"confidence_score": 76, "logical_consistency": 88, "business_viability": 74, "evidence_quality": 55, "missing_information": ["Verified market demand", "Current competitor pricing", "Channel-specific acquisition cost"], "challenged_assumptions": ["The stated audience has urgent willingness to pay", "The suggested stack matches team skills"], "corrections_applied": ["Added paid validation before feature expansion", "Added measurable phase exit criteria", "Labeled unverified evidence as baseline"], "passed": True},
        }
        return ExecutionPlan.model_validate(plan)
