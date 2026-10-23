import asyncio
import json
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.agents.demo import demo_output
from app.agents.providers import AIProvider, ProviderResult, model_for_provider, select_provider
from app.core.errors import ConflictError, NotFoundError
from app.models.agent import Agent
from app.models.agent_run import AgentRun
from app.models.financial_model import FinancialModel
from app.models.pitch_deck import PitchDeck
from app.models.project import Project
from app.models.report import Report
from app.orchestration.agent_graph import run_agent_workflow
from app.repositories.project_repository import ProjectRepository
from app.schemas.agent_io.pipeline import STAGE_OUTPUT_MODELS, FinancialOutput, PitchDeckOutput
from app.schemas.pipeline import PipelineMode, PipelineStatus

PIPELINE_STAGES = (
    "problem_discovery",
    "market_research",
    "product_strategy",
    "finance",
    "pitch_deck",
    "vc_evaluation",
)
SUCCESS_STATUSES = {"success", "completed"}


class PipelineExecutionError(RuntimeError):
    """Raised after pipeline failure state has been durably recorded."""


class PipelineService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.projects = ProjectRepository(session)

    async def _owned_project(self, project_id: UUID, owner_id: UUID) -> Project:
        project = await self.projects.get_owned_by(project_id, owner_id)
        if project is None:
            raise NotFoundError("Project not found")
        return project

    async def prepare_run(self, project_id: UUID, owner_id: UUID) -> tuple[UUID, int]:
        """Create the six queued rows before dispatch so status is immediately observable."""
        project = await self._owned_project(project_id, owner_id)
        active = await self.session.execute(
            select(AgentRun.id).where(
                AgentRun.project_id == project_id,
                AgentRun.status.in_(("queued", "running")),
            )
        )
        if active.first() is not None:
            raise ConflictError("A pipeline run is already in progress for this project")

        agents = await self._required_agents()
        pipeline_run_id = uuid4()
        provider = select_provider()
        mode = "provider" if provider is not None else "demo"
        for stage in PIPELINE_STAGES:
            agent = agents[stage]
            self.session.add(
                AgentRun(
                    project_id=project.id,
                    agent_id=agent.id,
                    pipeline_run_id=pipeline_run_id,
                    status="queued",
                    input_context={
                        "mode": mode,
                        "provider": provider.name if provider is not None else "deterministic-demo",
                        "stage": stage,
                        "project_name": project.name,
                    },
                )
            )

        project.status = "active"
        project.blueprint_status = "queued"
        await self.session.commit()
        return pipeline_run_id, len(PIPELINE_STAGES)

    async def start_demo(self, project_id: UUID, owner_id: UUID) -> tuple[UUID, int]:
        """Backward-compatible synchronous entrypoint used by older callers and tests."""
        pipeline_run_id, count = await self.prepare_run(project_id, owner_id)
        await self.execute(pipeline_run_id, provider=None)
        return pipeline_run_id, count

    async def execute(
        self, pipeline_run_id: UUID, *, provider: AIProvider | None = None
    ) -> list[AgentRun]:
        """Execute or resume a run; successful stages and their artifacts are reused on retry."""
        runs = await self._pipeline_runs(pipeline_run_id)
        if not runs:
            raise NotFoundError("Pipeline run not found")
        project = runs[0].project
        run_by_stage = {run.agent.key: run for run in runs}
        missing = [stage for stage in PIPELINE_STAGES if stage not in run_by_stage]
        if missing:
            raise PipelineExecutionError(f"Pipeline is missing configured stages: {', '.join(missing)}")

        selected_provider = provider if provider is not None else select_provider()
        context: dict[str, Any] = {"project": self._project_context(project), "stages": {}}
        project.status = "active"
        project.blueprint_status = "running"
        await self.session.commit()

        # Trigger real-time 15-Agent LangGraph Workflow & Live SSE Event Stream
        asyncio.create_task(
            run_agent_workflow(str(project.id), project.name, context["project"])
        )

        for stage in PIPELINE_STAGES:
            run = run_by_stage[stage]
            if run.status in SUCCESS_STATUSES and run.structured_output is not None:
                context["stages"][stage] = run.structured_output
                continue

            try:
                if run.status == "failed":
                    run.attempt_number += 1
                run.status = "running"
                run.started_at = datetime.now(UTC)
                run.completed_at = None
                run.error_message = None
                await self.session.commit()

                result = await self._generate(stage, run.agent, context, selected_provider)
                output = result.output.model_dump(mode="json")
                await self._persist_artifacts(project, run, result.output)
                run.status = "success"
                run.structured_output = output
                run.tokens_used = result.tokens_used
                run.cost_usd = Decimal(str(result.cost_usd))
                run.completed_at = datetime.now(UTC)
                run.input_context = {
                    "mode": "demo" if result.provider == "deterministic-demo" else "provider",
                    "provider": result.provider,
                    "model": result.model,
                    "stage": stage,
                    "project_name": project.name,
                }
                context["stages"][stage] = output
                await self.session.commit()
            except Exception as exc:
                await self.session.rollback()
                failed_run = await self.session.get(AgentRun, run.id)
                failed_project = await self.session.get(Project, project.id)
                if failed_run is not None:
                    failed_run.status = "failed"
                    failed_run.error_message = self._safe_error(exc)
                    failed_run.completed_at = datetime.now(UTC)
                if failed_project is not None:
                    failed_project.status = "draft"
                    failed_project.blueprint_status = "failed"
                await self.session.commit()
                raise PipelineExecutionError(
                    f"Pipeline stage {stage!r} failed: {type(exc).__name__}"
                ) from exc

        project.blueprint_status = "completed"
        await self.session.commit()
        return await self._pipeline_runs(pipeline_run_id)

    async def status(
        self, project_id: UUID, pipeline_run_id: UUID, owner_id: UUID
    ) -> list[AgentRun]:
        await self._owned_project(project_id, owner_id)
        runs = await self._pipeline_runs(pipeline_run_id, project_id=project_id)
        if not runs:
            raise NotFoundError("Pipeline run not found")
        return runs

    async def latest_status(self, project_id: UUID, owner_id: UUID) -> list[AgentRun]:
        await self._owned_project(project_id, owner_id)
        result = await self.session.execute(
            select(AgentRun.pipeline_run_id)
            .where(AgentRun.project_id == project_id)
            .order_by(AgentRun.created_at.desc())
            .limit(1)
        )
        pipeline_run_id = result.scalar_one_or_none()
        if pipeline_run_id is None:
            raise NotFoundError("Pipeline run not found")
        return await self._pipeline_runs(pipeline_run_id, project_id=project_id)

    async def result(
        self, project_id: UUID, pipeline_run_id: UUID, owner_id: UUID
    ) -> tuple[list[AgentRun], dict[str, dict[str, Any]]]:
        runs = await self.status(project_id, pipeline_run_id, owner_id)
        outputs = {
            run.agent.key: run.structured_output
            for run in runs
            if run.structured_output is not None
        }
        return runs, outputs

    async def fail_dispatch(self, pipeline_run_id: UUID) -> None:
        runs = await self._pipeline_runs(pipeline_run_id)
        now = datetime.now(UTC)
        for run in runs:
            if run.status == "queued":
                run.status = "failed"
                run.error_message = "Pipeline dispatch failed before execution"
                run.completed_at = now
        if runs:
            runs[0].project.status = "draft"
            runs[0].project.blueprint_status = "failed"
        await self.session.commit()

    async def reports(self, project_id: UUID, owner_id: UUID) -> list[Report]:
        await self._owned_project(project_id, owner_id)
        result = await self.session.execute(
            select(Report).where(Report.project_id == project_id).order_by(Report.created_at)
        )
        return list(result.scalars().all())

    async def report_artifact(
        self, project_id: UUID, owner_id: UUID, report_type: str
    ) -> Report:
        await self._owned_project(project_id, owner_id)
        result = await self.session.execute(
            select(Report)
            .where(Report.project_id == project_id, Report.report_type == report_type)
            .order_by(Report.version.desc(), Report.updated_at.desc())
            .limit(1)
        )
        report = result.scalar_one_or_none()
        if report is None:
            raise NotFoundError(f"{report_type.replace('_', ' ').title()} artifact not found")
        return report

    async def financial_artifact(self, project_id: UUID, owner_id: UUID) -> FinancialModel:
        await self._owned_project(project_id, owner_id)
        result = await self.session.execute(
            select(FinancialModel)
            .where(FinancialModel.project_id == project_id)
            .order_by(FinancialModel.updated_at.desc())
            .limit(1)
        )
        artifact = result.scalar_one_or_none()
        if artifact is None:
            raise NotFoundError("Financial artifact not found")
        return artifact

    async def pitch_artifact(self, project_id: UUID, owner_id: UUID) -> PitchDeck:
        await self._owned_project(project_id, owner_id)
        result = await self.session.execute(
            select(PitchDeck)
            .where(PitchDeck.project_id == project_id)
            .order_by(PitchDeck.updated_at.desc())
            .limit(1)
        )
        artifact = result.scalar_one_or_none()
        if artifact is None:
            raise NotFoundError("Pitch deck artifact not found")
        return artifact

    async def _required_agents(self) -> dict[str, Agent]:
        result = await self.session.execute(
            select(Agent).where(Agent.is_active.is_(True), Agent.key.in_(PIPELINE_STAGES))
        )
        agents = {agent.key: agent for agent in result.scalars().all()}
        missing = [stage for stage in PIPELINE_STAGES if stage not in agents]
        if missing:
            raise ConflictError(
                "Required agents are not configured; run the database seed first "
                f"(missing: {', '.join(missing)})"
            )
        return agents

    async def _pipeline_runs(
        self, pipeline_run_id: UUID, *, project_id: UUID | None = None
    ) -> list[AgentRun]:
        query = (
            select(AgentRun)
            .options(selectinload(AgentRun.agent), selectinload(AgentRun.project))
            .where(AgentRun.pipeline_run_id == pipeline_run_id)
        )
        if project_id is not None:
            query = query.where(AgentRun.project_id == project_id)
        result = await self.session.execute(query.order_by(AgentRun.created_at, AgentRun.id))
        runs = list(result.scalars().all())
        order = {stage: index for index, stage in enumerate(PIPELINE_STAGES)}
        return sorted(runs, key=lambda run: order.get(run.agent.key, len(order)))

    async def _generate(
        self,
        stage: str,
        agent: Agent,
        context: dict[str, Any],
        provider: AIProvider | None,
    ) -> ProviderResult:
        output_model = STAGE_OUTPUT_MODELS[stage]
        if provider is None:
            output = demo_output(stage, context)
            return ProviderResult(
                output=output,
                provider="deterministic-demo",
                model="deterministic-demo",
                tokens_used=0,
                cost_usd=0.0,
            )
        model = model_for_provider(provider, agent.default_model)
        return await provider.generate(
            stage=stage,
            model=model,
            output_model=output_model,
            context=context,
        )

    async def _persist_artifacts(
        self, project: Project, run: AgentRun, output: BaseModel
    ) -> None:
        data = output.model_dump(mode="json")
        stage = str(data["stage"])
        if stage == "finance":
            await self._upsert_financial(project, run, FinancialOutput.model_validate(data))
            return
        if stage == "pitch_deck":
            await self._upsert_pitch(project, run, PitchDeckOutput.model_validate(data))
            return
        if stage == "product_strategy":
            await self._upsert_report(project, run, "prd", data)
            roadmap_data = {
                "stage": "roadmap",
                "roadmap": data["roadmap"],
                "success_metrics": data["success_metrics"],
            }
            await self._upsert_report(project, run, "roadmap", roadmap_data)
            return
        await self._upsert_report(project, run, stage, data)

    async def _upsert_report(
        self, project: Project, run: AgentRun, report_type: str, data: dict[str, Any]
    ) -> None:
        result = await self.session.execute(
            select(Report).where(
                Report.agent_run_id == run.id,
                Report.report_type == report_type,
            )
        )
        report = result.scalar_one_or_none()
        title = f"{report_type.replace('_', ' ').title()}: {project.name}"
        markdown = self._markdown(title, data)
        if report is None:
            self.session.add(
                Report(
                    project_id=project.id,
                    agent_run_id=run.id,
                    report_type=report_type,
                    title=title,
                    content_markdown=markdown,
                    content_json=data,
                )
            )
        elif not report.is_user_edited:
            report.title = title
            report.content_markdown = markdown
            report.content_json = data

    async def _upsert_financial(
        self, project: Project, run: AgentRun, output: FinancialOutput
    ) -> None:
        result = await self.session.execute(
            select(FinancialModel).where(FinancialModel.agent_run_id == run.id)
        )
        artifact = result.scalar_one_or_none()
        values: dict[str, Any] = {
            "pricing_model": {
                "strategy": output.pricing_strategy,
                "tiers": [tier.model_dump(mode="json") for tier in output.pricing_tiers],
                "funding_required_usd": output.funding_required_usd,
            },
            "forecast": [period.model_dump(mode="json") for period in output.forecast],
            "cac_by_channel": [channel.model_dump(mode="json") for channel in output.cac_by_channel],
            "ltv_usd": Decimal(output.ltv_usd),
            "ltv_cac_ratio": Decimal(str(output.ltv_cac_ratio)),
            "runway_months": Decimal(str(output.runway_months)),
            "assumptions": output.assumptions,
        }
        if artifact is None:
            self.session.add(FinancialModel(project_id=project.id, agent_run_id=run.id, **values))
        else:
            for field, value in values.items():
                setattr(artifact, field, value)

    async def _upsert_pitch(
        self, project: Project, run: AgentRun, output: PitchDeckOutput
    ) -> None:
        result = await self.session.execute(
            select(PitchDeck).where(PitchDeck.agent_run_id == run.id)
        )
        artifact = result.scalar_one_or_none()
        slides = [slide.model_dump(mode="json") for slide in output.slides]
        if artifact is None:
            self.session.add(
                PitchDeck(
                    project_id=project.id,
                    agent_run_id=run.id,
                    slides=slides,
                    business_plan_markdown=output.business_plan_markdown,
                    executive_summary_markdown=output.executive_summary_markdown,
                )
            )
        else:
            artifact.slides = slides
            artifact.business_plan_markdown = output.business_plan_markdown
            artifact.executive_summary_markdown = output.executive_summary_markdown

    @staticmethod
    def _project_context(project: Project) -> dict[str, Any]:
        return {
            "id": str(project.id),
            "name": project.name,
            "idea_description": project.idea_description,
            "industry": project.industry,
            "target_audience": project.target_audience,
            "budget_band": project.budget_band,
            "goals": project.goals,
        }

    @staticmethod
    def run_metadata(run: AgentRun) -> tuple[PipelineMode, str, str | None]:
        context = run.input_context or {}
        mode: PipelineMode = "provider" if context.get("mode") == "provider" else "demo"
        provider = str(context.get("provider", "deterministic-demo"))
        model_value = context.get("model")
        model = str(model_value) if model_value is not None else None
        return mode, provider, model

    @staticmethod
    def aggregate_status(runs: list[AgentRun]) -> PipelineStatus:
        statuses = {run.status for run in runs}
        if "failed" in statuses:
            return "failed"
        if statuses and statuses.issubset(SUCCESS_STATUSES):
            return "completed"
        if "running" in statuses:
            return "running"
        return "queued"

    @staticmethod
    def _safe_error(exc: Exception) -> str:
        return f"{type(exc).__name__}: pipeline stage execution failed"

    @staticmethod
    def _markdown(title: str, data: dict[str, Any]) -> str:
        return (
            f"# {title}\n\n"
            "```json\n"
            f"{json.dumps(data, indent=2, sort_keys=True)}\n"
            "```\n\n"
            "_Generated from validated structured pipeline output._"
        )

    @staticmethod
    def _demo_output(project: Project, agent: Agent) -> dict[str, object]:
        """Compatibility helper retained for the original focused contract test."""
        return {
            "mode": "demo",
            "agent": agent.key,
            "project_name": project.name,
        }

    @staticmethod
    def _demo_markdown(project: Project, agent: Agent, output: dict[str, object]) -> str:
        return (
            PipelineService._markdown(f"{agent.name}: {project.name}", output)
            + "\n\n_no external AI provider was called._"
        )
