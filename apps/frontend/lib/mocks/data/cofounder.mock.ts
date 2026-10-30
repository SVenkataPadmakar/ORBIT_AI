/**
 * apps/frontend/lib/mocks/data/cofounder.mock.ts
 * Socratic AI Co-Founder responses, workspace guidance, and assumption challenge engine.
 */
import type { CofounderMessage, CofounderResponse } from "@/types/api";
import type {
  WorkspaceGuidance,
  AssumptionChallengeRequest,
  AssumptionChallengeResponse,
  DecisionCreateRequest,
  DecisionMemoryItem,
  CofounderMemoryState,
} from "@/types/cofounder";

export const INITIAL_COFOUNDER_MESSAGES: Record<string, CofounderMessage[]> = {
  "startup-1": [
    {
      role: "assistant",
      content: "Welcome to Relay Health, founder. I've analyzed your clinical intake problem statement. Your immediate priority is validating the urgency scoring threshold with the 5 pilot clinics before expanding EHR connectors. What area of the technical blueprint should we stress-test first?",
      created_at: "2026-10-23T08:00:15.000Z",
    },
    {
      role: "user",
      content: "What should we build first in Sprint 1?",
      created_at: "2026-10-23T08:05:00.000Z",
    },
    {
      role: "assistant",
      content: "In Sprint 1, build the Async Command Center and the Urgency Classifier. Do not build custom billing or complex EHR adapters yet. If coordinators can see incoming inquiries ranked by urgency in under 2 seconds, you establish immediate clinical trust.",
      created_at: "2026-10-23T08:05:03.000Z",
    },
  ],
};

export function getMockCofounderResponse(message: string, projectId: string | null): CofounderResponse {
  const lower = message.toLowerCase();
  let answer = "As your AI Co-Founder, I recommend prioritizing core user velocity over peripheral tooling. Make sure each sprint task maps directly to an observable reduction in coordinator triage time.";
  const suggested_actions: string[] = ["Review Sprint 1 tasks", "Confirm pilot clinic criteria", "Inspect clinical audit trail"];

  if (lower.includes("build") || lower.includes("first") || lower.includes("start")) {
    answer = "Focus strictly on the Async Command Center and the Urgency Classifier. Avoid premature EHR integrations until your 5 pilot practices validate the triage accuracy threshold (target >96%).";
    suggested_actions.unshift("Open Execution Center", "Assign Sprint 1 Task B1");
  } else if (lower.includes("price") || lower.includes("pricing") || lower.includes("cost") || lower.includes("money")) {
    answer = "Your financial model targets a 5.2x LTV:CAC with a $499/mo Clinic Pro tier. I recommend offering the first 90 days of the pilot at $199/mo with an agreement to participate in weekly feedback interviews.";
    suggested_actions.unshift("Inspect Financial Forecast", "Download Pricing Model");
  } else if (lower.includes("market") || lower.includes("competitor")) {
    answer = "Incumbent EMR patient portals have high switching costs but terrible UX and zero automated triage. Your wedge is not replacing the EMR—it is sitting as an intelligent layer above it.";
    suggested_actions.unshift("Review Competitor Matrix", "View Market Research Brief");
  } else if (lower.includes("risk") || lower.includes("worry") || lower.includes("fail")) {
    answer = "The primary operational risk is coordinator notification fatigue. Ensure urgency tier-1 messages trigger push alerts, but tier-2 and tier-3 messages remain batched in the asynchronous queue.";
    suggested_actions.unshift("Run Assumption Stress-Test", "View Risk Diligence Scorecard");
  }

  return {
    answer,
    project_id: projectId,
    provider: "gemini-1.5-pro",
    confidence_score: 95,
    suggested_actions,
    memory_used: [
      "Project Identity: Relay Health",
      "PRD: Async Command Center & Triage",
      "Financials: $499/mo Clinic Pro Tier",
      "Decision Ledger: PostgreSQL with strict audit logging",
    ],
  };
}

export function getMockWorkspaceGuidance(projectId: string, workspace: string): WorkspaceGuidance {
  return {
    workspace,
    headline: `Socratic Guidance for ${workspace.toUpperCase()}`,
    executive_summary: "Prioritize low-latency user workflows. Maintain strict evidence traceability for all architectural and go-to-market assumptions.",
    proactive_insights: [
      {
        id: `ins-1-${workspace}`,
        type: "suggestion",
        title: "Enforce Sub-2s Triage Latency",
        message: "Coordinator adoption correlates directly with UI responsiveness. Keep state updates optimistic in React Query.",
        reasoning: "Clinical operations staff juggle incoming phone calls while checking queues.",
        context_workspace: workspace,
        action_label: "Review Sprint Tasks",
        action_type: "navigate",
        impact_score: 89,
      },
      {
        id: `ins-2-${workspace}`,
        type: "opportunity",
        title: "Pilot Clinic Reference Program",
        message: "Lock in reference interview agreements with your first 5 clinics before launch.",
        reasoning: "Social proof reduces enterprise sales cycles from 90 to 30 days.",
        context_workspace: workspace,
        action_label: "Open GTM Roadmap",
        action_type: "navigate",
        impact_score: 92,
      },
    ],
    contradictions: [],
    challenged_assumptions: [
      "Assuming coordinators will read multi-paragraph AI explanations during urgent triage (Refuted: Use single-line highlights).",
    ],
    next_best_actions: [
      "Verify mock local storage persistence survives page reloads",
      "Complete Command Center UI assembly",
      "Conduct simulated pilot intake demo",
    ],
    generated_by: "Orbit Socratic Kernel v2.4",
  };
}

export function getMockAssumptionChallenge(req: AssumptionChallengeRequest): AssumptionChallengeResponse {
  return {
    assumption: req.assumption,
    counter_factual_analysis: `If the assumption '${req.assumption}' fails, coordinator workflow friction could increase by 30% without proper fallback heuristics.`,
    vulnerability_score: 68,
    historical_conflicts: [
      "Previous healthcare SaaS startups struggled when imposing multi-step manual confirmation on clinicians.",
    ],
    seven_day_experiment: "Run a 7-day shadow test where 50 simulated inquiries are scored automatically, and measure coordinator override frequency.",
    recommended_action: "Implement a 1-click override button with automated feedback collection.",
  };
}

export function getMockCofounderMemoryState(projectId: string): CofounderMemoryState {
  return {
    project_id: projectId,
    project_memory: {
      core_thesis: "Automated urgency triage eliminates outpatient coordinator burnout and prevents dropped clinical follow-ups.",
      target_audience: "Outpatient clinic operations managers & care coordinators",
      icp_archetype: "Mid-tier outpatient specialty practice with 3-10 providers",
      value_proposition: "Automate intake, triage, and handoff tracking with dedicated AI workflow agents.",
      monetization_model: "$499/mo per clinic practice location",
      key_competitors: ["Legacy EMR portals", "Generic chatbots"],
      tam_estimate: "$8.4B USD",
    },
    decision_memory: [
      {
        id: `dec-1-${projectId}`,
        timestamp: "2026-10-23T08:00:00.000Z",
        category: "technical",
        decision: "Adopt Next.js 15 App Router with Client-Side Mock Layer",
        rationale: "Delivers instant page response, zero backend container overhead, and seamless Vercel edge deployment.",
        rejected_alternatives: ["Heavy Python FastAPI microservices", "Dockerized Celery queue dependencies"],
        trade_offs: ["Requires structured in-memory mock persistence for mutations"],
        status: "active",
      },
      {
        id: `dec-2-${projectId}`,
        timestamp: "2026-10-23T08:15:00.000Z",
        category: "product",
        decision: "Single-line urgency indicators over verbose AI explanations",
        rationale: "Busy clinic coordinators need instant scanability under 2 seconds.",
        rejected_alternatives: ["Multi-paragraph clinical reasoning cards"],
        trade_offs: ["Full explanation is deferred to an expand-on-click drawer"],
        status: "active",
      },
    ],
    product_memory: [
      {
        component: "Async Command Center",
        specification: "Next.js 15 dashboard with severity badges and search filters",
        technical_stack: ["React 19", "Tailwind", "Radix UI", "Zustand"],
        status: "shipped",
        artifacts: ["CommandCenter.tsx", "useStartupStore.ts"],
      },
    ],
    execution_memory: {
      sprints_completed: 1,
      velocity_trend: "+24% velocity across initial build phase",
      critical_bottlenecks: [],
      agent_efficiency_score: 96,
      tasks_closed_total: 4,
      tasks_remaining: 3,
    },
    active_contradictions: [],
    last_synced_at: "2026-10-23T08:30:00.000Z",
  };
}
