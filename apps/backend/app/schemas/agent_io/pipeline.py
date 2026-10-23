"""Validated structured outputs for the six MVP pipeline stages."""
from typing import Literal

from pydantic import BaseModel, Field


class ProblemCandidate(BaseModel):
    problem: str
    affected_users: str
    severity_score: int = Field(ge=1, le=10)
    evidence: list[str]


class ProblemDiscoveryOutput(BaseModel):
    stage: Literal["problem_discovery"] = "problem_discovery"
    executive_summary: str
    focus_problem: str
    problem_candidates: list[ProblemCandidate]
    assumptions_to_validate: list[str]
    interview_questions: list[str]


class Competitor(BaseModel):
    name: str
    positioning: str
    strengths: list[str]
    weaknesses: list[str]


class MarketSize(BaseModel):
    tam_usd: int = Field(ge=0)
    sam_usd: int = Field(ge=0)
    som_usd: int = Field(ge=0)
    methodology: str


class MarketResearchOutput(BaseModel):
    stage: Literal["market_research"] = "market_research"
    executive_summary: str
    market_size: MarketSize
    competitors: list[Competitor]
    trends: list[str]
    opportunities: list[str]
    risks: list[str]


class Persona(BaseModel):
    name: str
    role: str
    goals: list[str]
    pains: list[str]


class ProductFeature(BaseModel):
    name: str
    priority: Literal["must", "should", "could"]
    rationale: str
    acceptance_criteria: list[str]


class RoadmapPhase(BaseModel):
    name: str
    duration_weeks: int = Field(ge=1)
    outcomes: list[str]
    features: list[str]


class ProductStrategyOutput(BaseModel):
    stage: Literal["product_strategy"] = "product_strategy"
    product_vision: str
    value_proposition: str
    personas: list[Persona]
    user_stories: list[str]
    features: list[ProductFeature]
    success_metrics: list[str]
    roadmap: list[RoadmapPhase]
    out_of_scope: list[str]


class PricingTier(BaseModel):
    name: str
    monthly_price_usd: int = Field(ge=0)
    target_segment: str
    included: list[str]


class ForecastPeriod(BaseModel):
    period: str
    customers: int = Field(ge=0)
    revenue_usd: int = Field(ge=0)
    expenses_usd: int = Field(ge=0)
    cash_balance_usd: int


class ChannelEconomics(BaseModel):
    channel: str
    cac_usd: int = Field(ge=0)
    expected_share_percent: int = Field(ge=0, le=100)


class FinancialOutput(BaseModel):
    stage: Literal["finance"] = "finance"
    pricing_strategy: str
    pricing_tiers: list[PricingTier]
    forecast: list[ForecastPeriod]
    cac_by_channel: list[ChannelEconomics]
    ltv_usd: int = Field(ge=0)
    ltv_cac_ratio: float = Field(ge=0)
    runway_months: float = Field(ge=0)
    funding_required_usd: int = Field(ge=0)
    assumptions: list[str]


class PitchSlide(BaseModel):
    number: int = Field(ge=1)
    title: str
    headline: str
    bullets: list[str]
    speaker_notes: str


class PitchDeckOutput(BaseModel):
    stage: Literal["pitch_deck"] = "pitch_deck"
    deck_title: str
    one_liner: str
    slides: list[PitchSlide]
    business_plan_markdown: str
    executive_summary_markdown: str


class ScoreDimension(BaseModel):
    dimension: str
    score: int = Field(ge=0, le=100)
    rationale: str


class VCEvaluationOutput(BaseModel):
    stage: Literal["vc_evaluation"] = "vc_evaluation"
    investment_readiness_score: int = Field(ge=0, le=100)
    recommendation: Literal["pass", "watch", "proceed"]
    scorecard: list[ScoreDimension]
    strengths: list[str]
    concerns: list[str]
    diligence_questions: list[str]
    next_milestones: list[str]


StageOutput = (
    ProblemDiscoveryOutput
    | MarketResearchOutput
    | ProductStrategyOutput
    | FinancialOutput
    | PitchDeckOutput
    | VCEvaluationOutput
)

STAGE_OUTPUT_MODELS: dict[str, type[StageOutput]] = {
    "problem_discovery": ProblemDiscoveryOutput,
    "market_research": MarketResearchOutput,
    "product_strategy": ProductStrategyOutput,
    "finance": FinancialOutput,
    "pitch_deck": PitchDeckOutput,
    "vc_evaluation": VCEvaluationOutput,
}
