"""Deterministic fallback generator for demo runs and unit testing."""
from typing import Any

from app.schemas.agent_io.pipeline import (
    ChannelEconomics,
    Competitor,
    FinancialOutput,
    ForecastPeriod,
    MarketResearchOutput,
    MarketSize,
    Persona,
    PitchDeckOutput,
    PitchSlide,
    PricingTier,
    ProblemCandidate,
    ProblemDiscoveryOutput,
    ProductFeature,
    ProductStrategyOutput,
    RoadmapPhase,
    ScoreDimension,
    StageOutput,
    VCEvaluationOutput,
)


def demo_output(stage: str, context: dict[str, Any]) -> StageOutput:
    project = context.get("project", {})
    name = str(project.get("name", "FocusFlow"))
    idea = str(project.get("idea_description", "A planning tool for distributed product teams."))
    audience = str(project.get("target_audience", "distributed product teams"))
    industry = str(project.get("industry", "B2B SaaS"))

    if stage == "problem_discovery":
        return ProblemDiscoveryOutput(
            stage="problem_discovery",
            executive_summary=f"Problem validation analysis for {name} targeting {audience} in {industry}.",
            focus_problem=f"Fragmented planning and alignment workflows across {audience}.",
            problem_candidates=[
                ProblemCandidate(
                    problem=f"Information silos and context loss in {industry} operations",
                    affected_users=audience,
                    severity_score=8,
                    evidence=[
                        "High daily friction reported during sprint planning",
                        "Manual documentation sync creates operational delays",
                    ],
                ),
                ProblemCandidate(
                    problem="Inability to track execution progress against high-level strategic milestones",
                    affected_users="Engineering leads and founders",
                    severity_score=9,
                    evidence=[
                        "Frequent missed deadlines due to undetected blockers",
                        "Lack of unified real-time dashboard",
                    ],
                ),
            ],
            assumptions_to_validate=[
                f"{audience} will adopt an integrated planning co-founder interface",
                "Founders are willing to pay for automated execution workflows",
            ],
            interview_questions=[
                "How do you currently track sprint and product roadmap alignment?",
                "What is the most time-consuming part of strategic planning in your team?",
                "How much time do you spend synchronizing tools weekly?",
            ],
        )

    if stage == "market_research":
        return MarketResearchOutput(
            stage="market_research",
            executive_summary=f"Market analysis for {name} within the {industry} landscape.",
            market_size=MarketSize(
                tam_usd=12_000_000_000,
                sam_usd=2_500_000_000,
                som_usd=150_000_000,
                methodology="Bottom-up sizing based on estimated company count and target ACV.",
            ),
            competitors=[
                Competitor(
                    name="Legacy Incumbent",
                    positioning="Enterprise project management suite",
                    strengths=["Broad feature set", "Established enterprise sales"],
                    weaknesses=["High complexity", "No intelligent agent co-pilot"],
                ),
                Competitor(
                    name="Point Solution App",
                    positioning="Lightweight task tracker",
                    strengths=["Simple UI", "Fast onboarding"],
                    weaknesses=["Lacks strategic pipeline and financial modeling"],
                ),
            ],
            trends=[
                "Accelerated adoption of AI-driven workflow copilots",
                "Shift towards unified execution workspaces",
            ],
            opportunities=[
                "First-mover advantage in specialized autonomous startup execution",
                "High willingness to pay for developer and founder productivity tools",
            ],
            risks=[
                "Rapidly evolving generative AI landscape",
                "Customer inertia with existing toolchains",
            ],
        )

    if stage == "product_strategy":
        return ProductStrategyOutput(
            stage="product_strategy",
            product_vision=f"The intelligent operating system for {name} founders and operators.",
            value_proposition=f"Transform ideas into executable blueprints with verified AI agents for {audience}.",
            personas=[
                Persona(
                    name="Alex Founder",
                    role="Technical Founder / CEO",
                    goals=["Rapidly validate assumptions", "Execute launch plans efficiently"],
                    pains=["Scattered toolsets", "Uncertain market benchmarks"],
                ),
                Persona(
                    name="Sarah Product Lead",
                    role="Head of Product",
                    goals=["Align engineering roadmap with business KPIs"],
                    pains=["Manual status reporting", "Siloed communication"],
                ),
            ],
            user_stories=[
                f"As a {audience} user, I want automated execution plans so I can launch faster.",
                "As a founder, I want deterministic financial models so I can plan runway.",
                "As an operator, I want interactive co-founder chat to refine tactical decisions.",
            ],
            features=[
                ProductFeature(
                    name="Execution Center & Task Matrix",
                    priority="must",
                    rationale="Core workspace for managing phase gates and dependencies.",
                    acceptance_criteria=[
                        "Displays categorized build, launch, and growth tasks",
                        "Persists completion status per project",
                    ],
                ),
                ProductFeature(
                    name="Agent Analysis Pipeline",
                    priority="must",
                    rationale="Generates multi-stage structured artifacts from project intake.",
                    acceptance_criteria=[
                        "Validates problem, market, PRD, financial model, pitch deck, and VC scorecard",
                        "Supports both live LLMs and offline deterministic mode",
                    ],
                ),
                ProductFeature(
                    name="AI Co-Founder Chat",
                    priority="should",
                    rationale="Interactive guidance with project memory context.",
                    acceptance_criteria=[
                        "Floating assistant interface available across all screens",
                        "Contextual awareness of active project",
                    ],
                ),
                ProductFeature(
                    name="Admin Intelligence Dashboard",
                    priority="could",
                    rationale="Platform overview for monitoring usage and agent health.",
                    acceptance_criteria=[
                        "Guarded by admin role check",
                        "Displays aggregated metrics and activity logs",
                    ],
                ),
            ],
            success_metrics=[
                "Project creation to full execution plan generation under 3 minutes",
                "Weekly active users returning to task checklist > 40%",
            ],
            roadmap=[
                RoadmapPhase(
                    name="Phase 1: Foundation & Core Pipeline",
                    duration_weeks=4,
                    outcomes=["Validated MVP pipeline", "Authentication and project workspace"],
                    features=["Intake form", "Multi-stage pipeline", "Durable storage"],
                ),
                RoadmapPhase(
                    name="Phase 2: Execution Center & Co-Founder Chat",
                    duration_weeks=4,
                    outcomes=["Interactive execution management", "Conversational AI assistant"],
                    features=["Task dependencies", "Gemini assistant integration", "Live updates"],
                ),
                RoadmapPhase(
                    name="Phase 3: Ecosystem & Monetization",
                    duration_weeks=4,
                    outcomes=["Billing integration", "Collaboration tools", "External connectors"],
                    features=["Stripe checkout", "Team workspaces", "Export to PDF/Docs"],
                ),
            ],
            out_of_scope=[
                "Custom on-premise deployments in MVP",
                "Complex multi-tenant sub-organizations",
            ],
        )

    if stage == "finance":
        return FinancialOutput(
            stage="finance",
            pricing_strategy="Tiered SaaS subscription with self-serve starter and high-touch pro tiers.",
            pricing_tiers=[
                PricingTier(
                    name="Starter",
                    monthly_price_usd=29,
                    target_segment="Early-stage solo founders",
                    included=["3 active projects", "Standard pipeline analysis", "Basic AI co-founder"],
                ),
                PricingTier(
                    name="Pro",
                    monthly_price_usd=99,
                    target_segment="Funded startups & small teams",
                    included=["Unlimited projects", "Priority LLM models", "Advanced export & custom prompts"],
                ),
                PricingTier(
                    name="Scale",
                    monthly_price_usd=299,
                    target_segment="High-growth teams & incubators",
                    included=["Team seat management", "Dedicated compute", "Custom integrations"],
                ),
            ],
            forecast=[
                ForecastPeriod(
                    period="Month 1-6",
                    customers=50,
                    revenue_usd=25_000,
                    expenses_usd=18_000,
                    cash_balance_usd=82_000,
                ),
                ForecastPeriod(
                    period="Month 7-12",
                    customers=220,
                    revenue_usd=110_000,
                    expenses_usd=65_000,
                    cash_balance_usd=127_000,
                ),
                ForecastPeriod(
                    period="Month 13-18",
                    customers=650,
                    revenue_usd=325_000,
                    expenses_usd=170_000,
                    cash_balance_usd=282_000,
                ),
            ],
            cac_by_channel=[
                ChannelEconomics(channel="Organic Content & SEO", cac_usd=120, expected_share_percent=40),
                ChannelEconomics(channel="Developer / Product Communities", cac_usd=180, expected_share_percent=35),
                ChannelEconomics(channel="Targeted Paid Search", cac_usd=350, expected_share_percent=25),
            ],
            ltv_usd=1200,
            ltv_cac_ratio=5.8,
            runway_months=18.0,
            funding_required_usd=100_000,
            assumptions=[
                "Average customer lifespan of 14 months",
                "Gross margin on software subscription of 85%",
                "Monthly churn rate estimated under 4%",
            ],
        )

    if stage == "pitch_deck":
        return PitchDeckOutput(
            stage="pitch_deck",
            deck_title=f"{name} — Pitch Deck",
            one_liner=f"The intelligent startup execution copilot for {audience}.",
            slides=[
                PitchSlide(
                    number=1,
                    title="Title",
                    headline=f"{name}: AI Execution Operating System",
                    bullets=["Turning startup ideas into verified, executable reality", "Founded by experienced operators"],
                    speaker_notes="Introduce the company mission and founding team background.",
                ),
                PitchSlide(
                    number=2,
                    title="The Problem",
                    headline="Startups fail due to execution drag and fragmented planning",
                    bullets=[
                        "Over 90% of early-stage startups fail from unverified assumptions",
                        "Founders waste 30+ hours weekly switching between disconnected tools",
                        "High cost of agency consultants for early product and market strategy",
                    ],
                    speaker_notes="Highlight the immense friction and burn rate caused by poor early execution.",
                ),
                PitchSlide(
                    number=3,
                    title="The Solution",
                    headline="An autonomous multi-agent co-founder system",
                    bullets=[
                        "Automated 6-stage structured pipeline from idea to launch",
                        "Persistent project memory and real-time guidance",
                        "Actionable execution plans with dependencies and acceptance criteria",
                    ],
                    speaker_notes="Showcase how our platform solves the planning problem instantly.",
                ),
                PitchSlide(
                    number=4,
                    title="Product Architecture",
                    headline="Specialist AI agents working in harmony",
                    bullets=[
                        "Problem Discovery, Market Research, Product Strategy",
                        "Financial Modeling, Pitch Deck Builder, VC Scorecard",
                        "Integrated Execution Center with interactive checklists",
                    ],
                    speaker_notes="Walk through the core user experience and agent capabilities.",
                ),
                PitchSlide(
                    number=5,
                    title="Market Opportunity",
                    headline="$12B global market for founder & developer tooling",
                    bullets=[
                        "Over 5M new business applications filed annually",
                        "Boom in AI-first indie hackers and technical founders",
                        "$2.5B immediate serviceable addressable market",
                    ],
                    speaker_notes="Demonstrate the macro tailwinds driving our addressable market size.",
                ),
                PitchSlide(
                    number=6,
                    title="Business Model",
                    headline="High-margin B2B SaaS with tier expansion",
                    bullets=[
                        "$29/mo Starter, $99/mo Pro, $299/mo Scale plans",
                        "Expansion revenue from team seats and premium compute",
                        "85%+ gross margin profile",
                    ],
                    speaker_notes="Explain the subscription tiers and unit economics.",
                ),
                PitchSlide(
                    number=7,
                    title="Go-To-Market",
                    headline="Product-led growth combined with founder communities",
                    bullets=[
                        "Viral sharing of generated blueprints and pitch artifacts",
                        "Partnerships with startup accelerators and universities",
                        "High-ranking SEO content on startup playbooks",
                    ],
                    speaker_notes="Detail the acquisition flywheel and organic CAC advantages.",
                ),
                PitchSlide(
                    number=8,
                    title="Competitive Landscape",
                    headline="Positioned at the intersection of AI intelligence and execution",
                    bullets=[
                        "Distinct from general chatbots with persistent project state",
                        "Far more strategic than traditional rigid project management software",
                        "End-to-end verified schemas prevent hallucination",
                    ],
                    speaker_notes="Position our defensibility and specialized workflow depth.",
                ),
                PitchSlide(
                    number=9,
                    title="Traction & Milestones",
                    headline="Rapid validation and proven pipeline architecture",
                    bullets=[
                        "Full 6-stage deterministic and provider-backed pipeline built",
                        "Active developer and user testing underway",
                        "Clear roadmap for next 3 quarters",
                    ],
                    speaker_notes="Share progress to date and validation metrics.",
                ),
                PitchSlide(
                    number=10,
                    title="Financial Projections",
                    headline="Path to $1M ARR within 18 months",
                    bullets=[
                        "Month 6: 50 customers ($25k revenue run-rate)",
                        "Month 12: 220 customers ($110k revenue run-rate)",
                        "Month 18: 650 customers ($325k revenue run-rate)",
                    ],
                    speaker_notes="Summarize key financial milestones and breakeven trajectory.",
                ),
                PitchSlide(
                    number=11,
                    title="Team",
                    headline="World-class engineers and product builders",
                    bullets=[
                        "Deep experience in full-stack architecture and AI systems",
                        "Track record in scaling SaaS products",
                    ],
                    speaker_notes="Introduce leadership strengths and execution speed.",
                ),
                PitchSlide(
                    number=12,
                    title="The Ask",
                    headline="Seeking $100k to accelerate product growth and distribution",
                    bullets=[
                        "18 months of runway",
                        "70% allocated to engineering & product development",
                        "30% allocated to user acquisition and partnerships",
                    ],
                    speaker_notes="State the investment request and capital allocation clearly.",
                ),
            ],
            business_plan_markdown=f"# {name} Business Plan\n\n## Vision\n{idea}\n\n## Target Market\n{audience} in {industry}.",
            executive_summary_markdown=f"# Executive Summary: {name}\n\nComprehensive execution blueprint for {name}.",
        )

    if stage == "vc_evaluation":
        return VCEvaluationOutput(
            stage="vc_evaluation",
            investment_readiness_score=82,
            recommendation="proceed",
            scorecard=[
                ScoreDimension(dimension="Market Size & Timing", score=85, rationale="Large expanding market with strong AI adoption tailwinds."),
                ScoreDimension(dimension="Product & Defensibility", score=80, rationale="Clear structured pipeline and interactive execution system."),
                ScoreDimension(dimension="Unit Economics", score=84, rationale="Strong LTV/CAC ratio and healthy software margins."),
                ScoreDimension(dimension="Execution Capability", score=80, rationale="Modular architecture with durable state persistence."),
            ],
            strengths=[
                "Strong product-market alignment addressing real founder friction",
                "High gross margin SaaS business model",
                "Multi-model provider support with robust fallback",
            ],
            concerns=[
                "Market competition from general LLM wrapper apps",
                "Customer retention needs ongoing validation",
            ],
            diligence_questions=[
                "How do you plan to defend against new foundational model native features?",
                "What is your target customer acquisition cost across paid channels?",
                "What is your initial cohort churn rate after the first 30 days?",
                "How do you ensure structured data output reliability across LLM providers?",
                "What integrations are highest priority for user workflows?",
            ],
            next_milestones=[
                "Acquire first 50 active paying customers",
                "Complete Stripe billing integration and live webhook processing",
                "Publish comprehensive customer benchmark case studies",
            ],
        )

    raise ValueError(f"Unknown pipeline stage: {stage}")
