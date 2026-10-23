export type ProjectStatus = "draft" | "active" | "archived";
export type PipelineStatus = "queued" | "running" | "completed" | "failed";
export type PipelineMode = "provider" | "demo";
export type AgentStage =
    | "problem_discovery"
    | "market_research"
    | "product_strategy"
    | "finance"
    | "pitch_deck"
    | "vc_evaluation";

export interface User {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
    is_active: boolean;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: "bearer";
    expires_in: number;
    user: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest extends LoginRequest {
    full_name?: string;
}

export interface OtpSendRequest {
    email: string;
}

export interface OtpSendResponse {
    detail: string;
    expires_in_seconds: number;
    dev_code?: string | null;
}

export interface OtpVerifyRequest {
    email: string;
    code: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
}

export interface GoogleOAuthRequest {
    credential?: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
}


export interface ProjectCreate {
    name: string;
    idea_description: string;
    industry?: string;
    target_audience?: string;
    budget_band?: string;
    goals?: string;
}

export interface Project {
    id: string;
    owner_id: string;
    name: string;
    idea_description: string;
    industry: string | null;
    target_audience: string | null;
    budget_band: string | null;
    goals: string | null;
    status: ProjectStatus;
    blueprint_status: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectListResponse {
    items: Project[];
    total: number;
    offset: number;
    limit: number;
}

export interface AgentRun {
    id: string;
    pipeline_run_id: string;
    stage: AgentStage;
    status: string;
    mode: PipelineMode;
    provider: string;
    model: string | null;
    error_message: string | null;
    started_at: string | null;
    completed_at: string | null;
}

export interface PipelineRunResponse {
    pipeline_run_id: string;
    project_id: string;
    status: PipelineStatus;
    run_count: number;
    execution: "queued" | "inline";
    mode: PipelineMode;
    provider: string;
}

export interface PipelineStatusResponse {
    pipeline_run_id: string;
    project_id: string;
    status: PipelineStatus;
    runs: AgentRun[];
}

export interface ProblemCandidate {
    problem: string;
    affected_users: string;
    severity_score: number;
    evidence: string[];
}

export interface ProblemDiscoveryOutput {
    stage: "problem_discovery";
    executive_summary: string;
    focus_problem: string;
    problem_candidates: ProblemCandidate[];
    assumptions_to_validate: string[];
    interview_questions: string[];
}

export interface Competitor {
    name: string;
    positioning: string;
    strengths: string[];
    weaknesses: string[];
}

export interface MarketResearchOutput {
    stage: "market_research";
    executive_summary: string;
    market_size: {
        tam_usd: number;
        sam_usd: number;
        som_usd: number;
        methodology: string;
    };
    competitors: Competitor[];
    trends: string[];
    opportunities: string[];
    risks: string[];
}

export interface ProductFeature {
    name: string;
    priority: "must" | "should" | "could";
    rationale: string;
    acceptance_criteria: string[];
}

export interface ProductStrategyOutput {
    stage: "product_strategy";
    product_vision: string;
    value_proposition: string;
    personas: Array<{ name: string; role: string; goals: string[]; pains: string[] }>;
    user_stories: string[];
    features: ProductFeature[];
    success_metrics: string[];
    roadmap: Array<{ name: string; duration_weeks: number; outcomes: string[]; features: string[] }>;
    out_of_scope: string[];
}

export interface FinancialOutput {
    stage: "finance";
    pricing_strategy: string;
    pricing_tiers: Array<{
        name: string;
        monthly_price_usd: number;
        target_segment: string;
        included: string[];
    }>;
    forecast: Array<{
        period: string;
        customers: number;
        revenue_usd: number;
        expenses_usd: number;
        cash_balance_usd: number;
    }>;
    cac_by_channel: Array<{ channel: string; cac_usd: number; expected_share_percent: number }>;
    ltv_usd: number;
    ltv_cac_ratio: number;
    runway_months: number;
    funding_required_usd: number;
    assumptions: string[];
}

export interface PitchSlide {
    number: number;
    title: string;
    headline: string;
    bullets: string[];
    speaker_notes: string;
}

export interface PitchDeckOutput {
    stage: "pitch_deck";
    deck_title: string;
    one_liner: string;
    slides: PitchSlide[];
    business_plan_markdown: string;
    executive_summary_markdown: string;
}

export interface VCEvaluationOutput {
    stage: "vc_evaluation";
    investment_readiness_score: number;
    recommendation: "pass" | "watch" | "proceed";
    scorecard: Array<{ dimension: string; score: number; rationale: string }>;
    strengths: string[];
    concerns: string[];
    diligence_questions: string[];
    next_milestones: string[];
}

export interface PipelineOutputs {
    problem_discovery?: ProblemDiscoveryOutput;
    market_research?: MarketResearchOutput;
    product_strategy?: ProductStrategyOutput;
    finance?: FinancialOutput;
    pitch_deck?: PitchDeckOutput;
    vc_evaluation?: VCEvaluationOutput;
}

export interface PipelineResultResponse extends PipelineStatusResponse {
    outputs: PipelineOutputs;
}

export interface ReportArtifact {
    id: string;
    project_id: string;
    agent_run_id: string;
    report_type: string;
    title: string;
    content_markdown: string | null;
    content_json: Record<string, unknown> | null;
    version: number;
    created_at: string;
    updated_at: string;
}

export interface FinancialArtifact {
    id: string;
    project_id: string;
    agent_run_id: string;
    pricing_model: Record<string, unknown> | null;
    forecast: Array<Record<string, unknown>> | null;
    cac_by_channel: Array<Record<string, unknown>> | null;
    ltv_usd: number | null;
    ltv_cac_ratio: number | null;
    runway_months: number | null;
    assumptions: string[] | null;
    created_at: string;
    updated_at: string;
}

export type ExecutionPhase = "build" | "launch" | "growth";
export type ExecutionTaskStatus = "todo" | "in_progress" | "blocked" | "done";

export interface ExecutionTask {
    id: string; phase: ExecutionPhase; title: string; outcome: string; owner_role: string;
    duration_days: number; dependencies: string[]; acceptance_criteria: string[];
    recommended_tools: string[]; status: ExecutionTaskStatus;
}

export interface PhasePlan {
    objective: string; tasks: ExecutionTask[]; exit_criteria: string[]; kpis: string[];
}

export interface ExecutionPlan {
    project_id: string; generated_at: string; executive_action: string;
    technical_blueprint: {
        stack: Array<Record<string, string>>; architecture: string[];
        database_entities: Array<{ name: string; fields: string[] }>;
        api_recommendations: Array<Record<string, string>>; deployment: string[]; security_baseline: string[];
    };
    competitor_moves: string[]; go_to_market: string[]; build: PhasePlan; launch: PhasePlan; growth: PhasePlan;
    launch_checklist: string[];
    evidence: Array<{ title: string; url: string | null; provider: string; retrieved_at: string; freshness: string }>;
    validation: {
        confidence_score: number; logical_consistency: number; business_viability: number;
        evidence_quality: number; missing_information: string[]; challenged_assumptions: string[];
        corrections_applied: string[]; passed: boolean
    };
}

export interface CofounderMessage { role: "user" | "assistant"; content: string; created_at: string }
export interface CofounderResponse {
    answer: string; project_id: string | null; provider: string; confidence_score: number;
    suggested_actions: string[]; memory_used: string[];
}
export interface AdminMetric { label: string; value: number | string; trend_percent: number | null }
export interface AdminOverview {
    users: AdminMetric[]; revenue: AdminMetric[]; agents: AdminMetric[]; system: AdminMetric[]; api_usage: AdminMetric[];
}
export interface AdminUser {
    id: string; email: string; full_name: string | null; role: string; is_active: boolean; created_at: string;
}

export interface PitchArtifact {
    id: string;
    project_id: string;
    agent_run_id: string;
    slides: Array<Record<string, unknown>>;
    business_plan_markdown: string | null;
    executive_summary_markdown: string | null;
    exported_pptx_url: string | null;
    exported_pdf_url: string | null;
    created_at: string;
    updated_at: string;
}
