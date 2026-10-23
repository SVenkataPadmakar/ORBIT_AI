export interface ProjectMemory {
  core_thesis: string;
  target_audience: string;
  icp_archetype: string;
  value_proposition: string;
  monetization_model: string;
  key_competitors: string[];
  tam_estimate?: string | null;
}

export interface DecisionMemoryItem {
  id: string;
  timestamp: string;
  category: "technical" | "market" | "product" | "pricing" | "gtm";
  decision: string;
  rationale: string;
  rejected_alternatives: string[];
  trade_offs: string[];
  status: "active" | "reversed" | "superseded";
}

export interface ProductMemoryItem {
  component: string;
  specification: string;
  technical_stack: string[];
  status: "designed" | "in_sprint" | "shipped";
  artifacts: string[];
}

export interface ExecutionMemorySummary {
  sprints_completed: number;
  velocity_trend: string;
  critical_bottlenecks: string[];
  agent_efficiency_score: number;
  tasks_closed_total: number;
  tasks_remaining: number;
}

export interface ContradictionAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  conflicting_elements: string[];
  recommendation: string;
  detected_at: string;
}

export interface CofounderInsight {
  id: string;
  type: "suggestion" | "warning" | "risk" | "opportunity";
  title: string;
  message: string;
  reasoning: string;
  context_workspace: string;
  action_label: string;
  action_type: string;
  impact_score: number;
}

export interface WorkspaceGuidance {
  workspace: string;
  headline: string;
  executive_summary: string;
  proactive_insights: CofounderInsight[];
  contradictions: ContradictionAlert[];
  challenged_assumptions: string[];
  next_best_actions: string[];
  generated_by: string;
}

export interface CofounderMemoryState {
  project_id: string;
  project_memory: ProjectMemory;
  decision_memory: DecisionMemoryItem[];
  product_memory: ProductMemoryItem[];
  execution_memory: ExecutionMemorySummary;
  active_contradictions: ContradictionAlert[];
  last_synced_at: string;
}

export interface DecisionCreateRequest {
  project_id: string;
  category: "technical" | "market" | "product" | "pricing" | "gtm";
  decision: string;
  rationale: string;
  rejected_alternatives?: string[];
  trade_offs?: string[];
}

export interface AssumptionChallengeRequest {
  project_id: string;
  assumption: string;
}

export interface AssumptionChallengeResponse {
  assumption: string;
  counter_factual_analysis: string;
  vulnerability_score: number;
  historical_conflicts: string[];
  seven_day_experiment: string;
  recommended_action: string;
}
