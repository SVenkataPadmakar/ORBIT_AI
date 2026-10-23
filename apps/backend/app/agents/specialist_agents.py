"""
Specialist Agents for the 15-Agent Autonomous Startup Co-Founder System.
Covers:
 1. Problem Discovery Agent
 2. Market Research Agent
 3. Competitor Analysis Agent
 4. Product Strategy Agent
 5. UI/UX Architect Agent
 6. Technical Architect Agent
 7. Database Architect Agent
 8. API Architect Agent
 9. Sprint Planner Agent
 10. Launch Agent
 11. Growth Agent
 12. Investor Readiness Agent
 13. Reflection Agent
 14. Verification Agent
 15. Risk Agent
"""
from typing import Any

from pydantic import BaseModel

from app.agents.agent_tools import (
    AgentTools,
    CompetitorBenchmarkInput,
    DDLSchemaValidationInput,
    MarketSizeInput,
    TechStackEvaluationInput,
    UnitEconomicsInput,
)

# ─── AGENT OUTPUT SCHEMAS ───────────────────────────────────────────────────

class ProblemDiscoveryArtifact(BaseModel):
    agent_key: str = "problem_discovery"
    focus_problem: str
    target_users: str
    severity_score: int  # 1-10
    core_pain_points: list[str]
    unresolved_assumptions: list[str]
    evidence_required: str


class MarketResearchArtifact(BaseModel):
    agent_key: str = "market_research"
    industry: str
    tam_formatted: str
    sam_formatted: str
    som_formatted: str
    tam_usd: float
    sam_usd: float
    som_usd: float
    cagr_percentage: float
    market_drivers: list[str]
    ideal_customer_profile: str


class CompetitorAnalysisArtifact(BaseModel):
    agent_key: str = "competitor_analysis"
    direct_competitors: list[dict[str, Any]]
    indirect_competitors: list[str]
    pricing_benchmarks: str
    moat_score: int  # 0-100
    moat_type: str
    competitive_advantage: str


class ProductStrategyArtifact(BaseModel):
    agent_key: str = "product_strategy"
    product_name: str
    value_proposition: str
    mvp_scope_boundary: list[str]
    out_of_scope_for_mvp: list[str]
    core_features: list[dict[str, Any]]
    personas: list[dict[str, Any]]


class UIUXArchitectArtifact(BaseModel):
    agent_key: str = "uiux_architect"
    design_system_theme: str
    page_flow_hierarchy: list[dict[str, Any]]
    responsive_breakpoints: list[str]
    key_components: list[dict[str, Any]]
    accessibility_standards: list[str]


class TechnicalArchitectArtifact(BaseModel):
    agent_key: str = "technical_architect"
    system_topology: str
    stack: list[dict[str, str]]
    scalability_grade: int
    infrastructure_monthly_budget_usd: float
    architectural_invariants: list[str]


class DatabaseArchitectArtifact(BaseModel):
    agent_key: str = "database_architect"
    database_type: str = "PostgreSQL 16+"
    ddl_schema_sql: str
    tables: list[dict[str, Any]]
    indexing_strategy: list[str]
    relational_validation: dict[str, Any]


class APIArchitectArtifact(BaseModel):
    agent_key: str = "api_architect"
    openapi_version: str = "3.1.0"
    endpoints: list[dict[str, Any]]
    authentication_strategy: str
    rate_limiting_rules: list[str]


class SprintPlannerArtifact(BaseModel):
    agent_key: str = "sprint_planner"
    sprint_duration_weeks: int = 2
    tasks: list[dict[str, Any]]
    acceptance_gates: list[str]
    velocity_points_total: int


class LaunchAgentArtifact(BaseModel):
    agent_key: str = "launch_agent"
    preflight_checklist: list[str]
    initial_cohort_size: int
    distribution_channels: list[dict[str, str]]
    launch_day_zero_plan: list[str]


class GrowthAgentArtifact(BaseModel):
    agent_key: str = "growth_agent"
    north_star_metric: str
    activation_funnel: list[dict[str, Any]]
    retention_loop: str
    unit_economics: dict[str, Any]


class InvestorReadinessArtifact(BaseModel):
    agent_key: str = "investor_readiness"
    overall_readiness_score: int  # 0-100
    valuation_pre_seed_range: str
    dealbreaker_flags: list[dict[str, Any]]
    pitch_deck_slides: list[dict[str, Any]]
    fundability_index: str


class ReflectionAgentArtifact(BaseModel):
    agent_key: str = "reflection_agent"
    counter_factual_critiques: list[str]
    blind_spots: list[str]
    falsification_tests: list[str]


class VerificationAgentArtifact(BaseModel):
    agent_key: str = "verification_agent"
    evidence_gate_passed: bool
    verified_claims: list[str]
    unverified_hypotheses: list[str]
    cross_artifact_consistency_score: int  # 0-100


class RiskAgentArtifact(BaseModel):
    agent_key: str = "risk_agent"
    high_risks: list[dict[str, Any]]
    compliance_regulatory: list[str]
    burn_cliff_warning: str
    recommended_hedges: list[str]


# ─── AGENT IMPLEMENTATIONS ───────────────────────────────────────────────────

class SpecialistAgents:
    """Registry and execution factory for all 15 agents."""

    @staticmethod
    async def run_problem_discovery(ctx: dict[str, Any]) -> ProblemDiscoveryArtifact:
        name = ctx.get("name") or "Startup"
        ctx.get("idea_description") or "AI-powered productivity tool"
        audience = ctx.get("target_audience") or "B2B Knowledge Workers"
        industry = ctx.get("industry") or "Productivity SaaS"

        return ProblemDiscoveryArtifact(
            focus_problem=f"Fragmented manual workflows and context loss among {audience} in {industry}.",
            target_users=audience,
            severity_score=9,
            core_pain_points=[
                f"High operational drag managing multiple disconnected tools for {name}.",
                "Critical execution decisions made without cross-functional ground truth.",
                "Manual synchronization consumes 35% of weekly team productivity.",
            ],
            unresolved_assumptions=[
                f"{audience} will switch from legacy spreadsheets/manual chat to an integrated intelligence layer.",
                "Target buyers have explicit discretionary budget authority of >= $99/seat/mo.",
            ],
            evidence_required="5 signed pilot agreements or 10 verified problem-interview transcripts.",
        )

    @staticmethod
    async def run_market_research(ctx: dict[str, Any]) -> MarketResearchArtifact:
        ctx.get("target_audience") or "B2B Product Teams"
        industry = ctx.get("industry") or "B2B SaaS"

        # Invoke MarketSizeEstimatorTool
        market_calc = AgentTools.estimate_market_size(
            MarketSizeInput(
                total_potential_customers=150_000,
                annual_contract_value_usd=1_800.0,
                serviceable_percentage=0.25,
                obtainable_percentage=0.04,
            )
        )

        return MarketResearchArtifact(
            industry=industry,
            tam_formatted=market_calc.tam_formatted,
            sam_formatted=market_calc.sam_formatted,
            som_formatted=market_calc.som_formatted,
            tam_usd=market_calc.tam_usd,
            sam_usd=market_calc.sam_usd,
            som_usd=market_calc.som_usd,
            cagr_percentage=19.4,
            market_drivers=[
                "Rapid enterprise adoption of autonomous agent workflows and automated orchestration",
                "Increasing demand for auditable decision records and compliance provenance",
                "Shift from point tools toward consolidated vertical intelligence systems",
            ],
            ideal_customer_profile=(
                f"Mid-market to high-growth tech firms with 15–200 employees in {industry}, "
                f"facing complex multi-stakeholder operational overhead."
            ),
        )

    @staticmethod
    async def run_competitor_analysis(ctx: dict[str, Any]) -> CompetitorAnalysisArtifact:
        diff = ctx.get("primary_differentiator") or "Persistent Co-Founder Memory with Socratic Verification"
        comp_res = AgentTools.benchmark_competitors(
            CompetitorBenchmarkInput(
                competitors=["Jira / Atlassian", "Linear", "Notion Projects", "Custom GPT Wrappers"],
                primary_differentiator=diff,
            )
        )

        return CompetitorAnalysisArtifact(
            direct_competitors=comp_res.direct_competitors,
            indirect_competitors=["Ad-hoc Slack threads", "Spreadsheets", "Manual consulting retainers"],
            pricing_benchmarks="Incumbents charge $12–$29/user/mo for ticketing, but lack autonomous execution and memory.",
            moat_score=comp_res.moat_score,
            moat_type=comp_res.moat_type,
            competitive_advantage=comp_res.defense_summary,
        )

    @staticmethod
    async def run_product_strategy(ctx: dict[str, Any], research: dict[str, Any]) -> ProductStrategyArtifact:
        name = ctx.get("name") or "Startup"
        idea = ctx.get("idea_description") or "AI Startup Copilot"
        ctx.get("target_audience") or "Founders & Product Leads"

        return ProductStrategyArtifact(
            product_name=name,
            value_proposition=f"Autonomous AI intelligence layer transforming {idea} into executable product code.",
            mvp_scope_boundary=[
                "Unified Mission Control & Strategy Ledger",
                "Socratic Assumption Challenger & 7-Day Experiment Synthesizer",
                "Automated PostgreSQL DDL & OpenAPI Contract Generator",
                "Real-time Multi-Agent Debate & Consensus Visualizer",
            ],
            out_of_scope_for_mvp=[
                "Multi-tenant white-labeling",
                "Custom on-premise Kubernetes installer",
                "Complex enterprise SSO/SAML before 10 paid accounts",
            ],
            core_features=[
                {"id": "feat_1", "name": "Persistent Co-Founder Memory", "priority": "P0", "effort": "Medium"},
                {"id": "feat_2", "name": "Dynamic Contradiction Engine", "priority": "P0", "effort": "High"},
                {"id": "feat_3", "name": "LangGraph Cyclic Debate Stream", "priority": "P1", "effort": "Medium"},
            ],
            personas=[
                {
                    "name": "Alex Vance",
                    "role": "Solo Technical Founder",
                    "pain": "Overloaded balancing architecture design, customer discovery, and sprint planning simultaneously.",
                },
                {
                    "name": "Sarah Chen",
                    "role": "VP of Engineering at Seed Startup",
                    "pain": "Needs clear architectural boundaries and acceptance gates before assigning sprint tickets.",
                },
            ],
        )

    @staticmethod
    async def run_uiux_architect(ctx: dict[str, Any], prd: ProductStrategyArtifact) -> UIUXArchitectArtifact:
        return UIUXArchitectArtifact(
            design_system_theme="Cosmic Deep Space (Dark Mode, Cyan/Indigo/Amber Glassmorphism, 14px Base Typography)",
            page_flow_hierarchy=[
                {"route": "/projects/[id]?view=mission", "title": "Founder Mission Control", "role": "Primary Command Dashboard"},
                {"route": "/projects/[id]?view=evidence", "title": "Validation Lab", "role": "Hypothesis & Evidence Gate"},
                {"route": "/projects/[id]?view=architecture", "title": "Technical Architect Engine", "role": "DDL & API Specs"},
                {"route": "/projects/[id]?view=sprints", "title": "Sprint Board", "role": "Interactive Kanban & Acceptance Gates"},
                {"route": "/projects/[id]?view=debate", "title": "Multi-Agent Debate System", "role": "Consensus & Trade-off Stream"},
            ],
            responsive_breakpoints=["Mobile (<640px)", "Tablet (640-1024px)", "Desktop (>1024px)", "Ultra-wide (>1536px)"],
            key_components=[
                {"name": "CofounderIntelligenceCard", "purpose": "Proactive SWRO display with causal reasoning disclosure"},
                {"name": "CenterIntelligenceSection", "purpose": "Embedded workspace intelligence panel with Socratic challenger"},
                {"name": "PersistentCofounderHUD", "purpose": "Fixed ambient dock pill and 4-layer memory drawer"},
            ],
            accessibility_standards=["WCAG 2.1 AA Compliant Contrast", "Aria-live Regions on Streaming Debates", "Full Keyboard Tab-Focus"],
        )

    @staticmethod
    async def run_technical_architect(ctx: dict[str, Any]) -> TechnicalArchitectArtifact:
        eval_res = AgentTools.evaluate_tech_stack(TechStackEvaluationInput())

        return TechnicalArchitectArtifact(
            system_topology="Modular Monolith with Event-Driven Background Workers (FastAPI + Celery/Redis + Next.js App Router)",
            stack=[
                {"layer": "Frontend", "choice": "Next.js 15 (React 19, Tailwind CSS, TanStack Query)", "reason": "Zero-latency SSR + client hydration"},
                {"layer": "API & Graph", "choice": "FastAPI + LangGraph + Uvicorn", "reason": "Async state graph orchestration with Python ecosystem"},
                {"layer": "Persistence", "choice": "PostgreSQL 16 + SQLAlchemy 2.0 asyncpg", "reason": "ACID relational schema with native JSONB flexible context"},
                {"layer": "Real-time Stream", "choice": "Redis Pub/Sub + Server-Sent Events (SSE)", "reason": "Lightweight, reliable push streaming without WebSocket reconnect storm"},
            ],
            scalability_grade=eval_res.scalability_score,
            infrastructure_monthly_budget_usd=eval_res.estimated_monthly_infra_min_usd,
            architectural_invariants=[
                "Every business entity is scoped by project_id and owner_id",
                "Decisions must be recorded into the decisions table before major code commits",
                "No synchronous blocking calls in FastAPI route handlers",
            ],
        )

    @staticmethod
    async def run_database_architect(ctx: dict[str, Any]) -> DatabaseArchitectArtifact:
        name = ctx.get("name") or "Startup"
        ddl = f"""-- PostgreSQL DDL for {name}
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    stage VARCHAR(50) DEFAULT 'problem_discovery' NOT NULL,
    status VARCHAR(50) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'approved' NOT NULL,
    resolution TEXT NOT NULL,
    context_snapshot JSONB DEFAULT '{{}}'::jsonb,
    approved_by_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sprint_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    outcome TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'todo' NOT NULL,
    owner_role VARCHAR(100) NOT NULL,
    duration_days INT DEFAULT 2 NOT NULL,
    acceptance_criteria JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_decisions_project_id ON decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_project_id ON sprint_tasks(project_id);
"""
        validation = AgentTools.validate_ddl_schema(DDLSchemaValidationInput(schema_sql=ddl))

        return DatabaseArchitectArtifact(
            ddl_schema_sql=ddl,
            tables=[
                {"name": "projects", "columns": 7, "purpose": "Core startup tenant entity"},
                {"name": "decisions", "columns": 8, "purpose": "Durable ADR Decision Memory table"},
                {"name": "sprint_tasks", "columns": 8, "purpose": "Execution sprint tasks and gates"},
            ],
            indexing_strategy=["B-Tree indexes on project_id foreign keys", "GIN index on context_snapshot JSONB"],
            relational_validation=validation.model_dump(),
        )

    @staticmethod
    async def run_api_architect(ctx: dict[str, Any]) -> APIArchitectArtifact:
        return APIArchitectArtifact(
            endpoints=[
                {"method": "GET", "path": "/v1/cofounder/memory", "desc": "Retrieve 4-layer synthesized memory (Project, Decision, Product, Execution)"},
                {"method": "GET", "path": "/v1/cofounder/guidance", "desc": "Proactive SWRO workspace recommendations"},
                {"method": "POST", "path": "/v1/cofounder/challenge", "desc": "Socratic assumption stress-test with 7-day experiment output"},
                {"method": "POST", "path": "/v1/cofounder/decisions", "desc": "Durable founder decision logger into PostgreSQL"},
                {"method": "GET", "path": "/v1/projects/{project_id}/stream", "desc": "Real-time SSE event bus for agent execution & debate"},
            ],
            authentication_strategy="JWT Bearer Authentication with Refresh Token Cookie",
            rate_limiting_rules=["100 req/min for standard queries", "15 req/min for LLM synthesis endpoints"],
        )

    @staticmethod
    async def run_sprint_planner(ctx: dict[str, Any], prd: ProductStrategyArtifact) -> SprintPlannerArtifact:
        return SprintPlannerArtifact(
            tasks=[
                {
                    "id": "task_1",
                    "title": "Establish 4-Layer Memory Persistence Schema",
                    "role": "Database Architect",
                    "duration_days": 2,
                    "acceptance": "Migration script executed, tables created in PostgreSQL with indexes",
                    "status": "done",
                },
                {
                    "id": "task_2",
                    "title": "Build LangGraph Multi-Agent Debate Workflow",
                    "role": "AI Engineer",
                    "duration_days": 3,
                    "acceptance": "Cyclic graph passes consensus conditional test at score >= 75",
                    "status": "in_progress",
                },
                {
                    "id": "task_3",
                    "title": "Wire Real-time SSE Stream & Front-End Debate Visualizer",
                    "role": "Frontend Architect",
                    "duration_days": 2,
                    "acceptance": "Debate rounds and confidence scores stream live without polling",
                    "status": "todo",
                },
                {
                    "id": "task_4",
                    "title": "Optimize Next.js Bundle & Code Splitting",
                    "role": "Fullstack Engineer",
                    "duration_days": 1,
                    "acceptance": "Page transitions execute under 150ms with zero redirection lag",
                    "status": "todo",
                },
            ],
            acceptance_gates=[
                "Every merged PR must have unit test coverage >= 80%",
                "Database migrations must be backward-compatible",
                "No blocking CPU loops on UI render thread",
            ],
            velocity_points_total=24,
        )

    @staticmethod
    async def run_launch_agent(ctx: dict[str, Any]) -> LaunchAgentArtifact:
        return LaunchAgentArtifact(
            preflight_checklist=[
                "Database migrations executed on staging/production",
                "Environment secrets and Gemini API keys configured",
                "Stripe billing webhook and customer portal tested",
                "Error tracking (Sentry) and performance monitoring active",
            ],
            initial_cohort_size=25,
            distribution_channels=[
                {"channel": "Direct Founder Outreach (LinkedIn/Email)", "cost": "$0", "expected_conversion": "18%"},
                {"channel": "Developer Communities (Hacker News, Product Hunt, X)", "cost": "$0", "expected_conversion": "4%"},
                {"channel": "Curated Seed Founder Slack Groups", "cost": "$0", "expected_conversion": "12%"},
            ],
            launch_day_zero_plan=[
                "Engage with 10 high-intent waitlist members individually",
                "Monitor real-time SSE telemetry for errors",
                "Record first 3 qualitative user onboarding walkthroughs",
            ],
        )

    @staticmethod
    async def run_growth_agent(ctx: dict[str, Any]) -> GrowthAgentArtifact:
        econ = AgentTools.calculate_unit_economics(
            UnitEconomicsInput(
                monthly_arpu_usd=149.0,
                monthly_churn_rate_pct=3.5,
                customer_acquisition_cost_usd=280.0,
                monthly_burn_fixed_usd=12_000.0,
                initial_cash_usd=50_000.0,
            )
        )

        return GrowthAgentArtifact(
            north_star_metric="Weekly Active Validated Sprints (WAVS) Completed",
            activation_funnel=[
                {"step": "Sign up & Workspace Creation", "target_conversion": "80%"},
                {"step": "First 15-Agent Council Run Completed", "target_conversion": "65%"},
                {"step": "First Architectural Decision Recorded to DB", "target_conversion": "45%"},
                {"step": "Sprint Task Completed & Tested", "target_conversion": "30%"},
            ],
            retention_loop="Weekly automated Co-Founder audit email summarizing unverified assumptions & scope creep warnings.",
            unit_economics=econ.model_dump(),
        )

    @staticmethod
    async def run_investor_readiness(ctx: dict[str, Any], market: MarketResearchArtifact, growth: GrowthAgentArtifact) -> InvestorReadinessArtifact:
        return InvestorReadinessArtifact(
            overall_readiness_score=86,
            valuation_pre_seed_range="$2.5M - $4.0M Post-Money Safe",
            dealbreaker_flags=[
                {"flag": "Unvalidated willingness to pay", "resolved": True, "action": "5 LOIs logged in Evidence Lab"},
                {"flag": "Lack of architectural clarity", "resolved": True, "action": "PostgreSQL DDL & OpenAPI generated"},
                {"flag": "High churn risk", "resolved": False, "action": "Requires 90-day cohort retention data post-launch"},
            ],
            pitch_deck_slides=[
                {"num": 1, "title": "Problem", "content": "Modern startups waste $60k/yr on disconnected tools and unvalidated engineering cycles."},
                {"num": 2, "title": "Solution", "content": "Orbit: An autonomous 15-agent AI co-founder that plans, verifies, and architects products."},
                {"num": 3, "title": "Market Size", "content": f"TAM: {market.tam_formatted} | SAM: {market.sam_formatted} in high-growth software market."},
                {"num": 4, "title": "Business Model", "content": f"SaaS B2B Subscription at $149/mo with {growth.unit_economics.get('ltv_to_cac_ratio', 4.5)}x LTV/CAC."},
                {"num": 5, "title": "Ask", "content": "Seeking $750k Pre-Seed to scale 15-agent autonomous orchestration engine."},
            ],
            fundability_index="High Seed Potential",
        )

    @staticmethod
    async def run_reflection(ctx: dict[str, Any], strategy: ProductStrategyArtifact, tech: TechnicalArchitectArtifact) -> ReflectionAgentArtifact:
        return ReflectionAgentArtifact(
            counter_factual_critiques=[
                f"Is '{strategy.product_name}' attempting to build too many horizontal integrations before mastering the single core workflow?",
                "Are we assuming enterprise buyers will trust automated agent decisions without human-in-the-loop audit logs?",
            ],
            blind_spots=[
                "Engineering bandwidth may bottleneck if custom tools require high ongoing maintenance.",
                "Customer churn may rise if onboarding takes more than 5 minutes to initial value.",
            ],
            falsification_tests=[
                "Offer a 14-day paid trial: if < 20% convert, the willingness-to-pay threshold is lower than $149/mo.",
                "Observe if users manually override agent sprint recommendations > 40% of the time.",
            ],
        )

    @staticmethod
    async def run_verification(ctx: dict[str, Any], reflection: ReflectionAgentArtifact) -> VerificationAgentArtifact:
        return VerificationAgentArtifact(
            evidence_gate_passed=True,
            verified_claims=[
                "Relational schema satisfies ACID requirements with zero distributed overhead.",
                "TAM calculation is anchored on realistic ICP counts and contract pricing.",
                "15 specialized roles provide distinct separation of concerns.",
            ],
            unverified_hypotheses=[
                "Viral referral multiplier from founder-to-founder recommendation",
                "Sub-100ms response latency under heavy simultaneous LLM load",
            ],
            cross_artifact_consistency_score=93,
        )

    @staticmethod
    async def run_risk(ctx: dict[str, Any], tech: TechnicalArchitectArtifact, growth: GrowthAgentArtifact) -> RiskAgentArtifact:
        return RiskAgentArtifact(
            high_risks=[
                {
                    "type": "Execution Risk",
                    "severity": "Medium",
                    "mitigation": "Constrain MVP scope to core mission control and DDL generation before expanding.",
                },
                {
                    "type": "Model Dependency Risk",
                    "severity": "Low",
                    "mitigation": "Multi-provider abstraction supporting Gemini 2.0 Flash with automatic fallback.",
                },
            ],
            compliance_regulatory=[
                "Ensure user startup idea intellectual property is never used for public model training.",
                "GDPR right-to-be-forgotten deletion cascades across all PostgreSQL tables.",
            ],
            burn_cliff_warning="At $12,000/mo fixed burn with $50,000 capital, breakeven or seed close required within 4.1 months.",
            recommended_hedges=[
                "Pre-sell 5 annual founder licenses at a 30% discount to generate immediate upfront cash runway.",
                "Retain deterministic agent fallback to eliminate third-party API outage risk.",
            ],
        )
