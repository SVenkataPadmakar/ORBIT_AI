/**
 * apps/frontend/lib/mocks/data/execution.mock.ts
 * Execution plans, sprint tasks, and blueprint recommendations.
 */
import type { ExecutionPlan } from "@/types/api";

export function getMockExecutionPlan(projectId: string): ExecutionPlan {
  return {
    project_id: projectId,
    generated_at: "2026-10-23T08:00:12.000Z",
    executive_action: "Execute Phase 1 Build immediately: deploy command center UI and validate urgency triage with the 5 pilot clinic leads.",
    technical_blueprint: {
      stack: [
        { layer: "Frontend", choice: "Next.js 15 App Router + React 19", reason: "Server components, fast initial paint, and fluid Framer Motion states." },
        { layer: "Styling", choice: "Tailwind CSS + Strict 3-Layer Design Tokens", reason: "Complete dark void palette harmony and responsive accessibility." },
        { layer: "3D & Canvas", choice: "React Three Fiber + Custom GLSL", reason: "High conviction narrative graphics deferred to requestIdleCallback." },
        { layer: "State Management", choice: "Zustand + TanStack React Query v5", reason: "Optimistic updates, local caching, and offline-ready persistence." },
      ],
      architecture: [
        "Unidirectional state flow with client-side mock storage and simulated SSE pipelines.",
        "Modular domain adapters preserving 100% component compatibility with future microservices.",
        "Zero-latency localStorage persistence for instant offline navigation.",
      ],
      database_entities: [
        { name: "projects", fields: ["id (UUID)", "name", "idea_description", "status", "created_at"] },
        { name: "workflow_items", fields: ["id (UUID)", "project_id", "title", "urgency_score", "status"] },
        { name: "decisions", fields: ["id (UUID)", "topic", "decision", "confidence_score", "timestamp"] },
      ],
      api_recommendations: [
        { method: "GET", path: "/v1/projects", description: "List founder projects with client-side search" },
        { method: "POST", path: "/v1/projects", description: "Initialize new venture mission workspace" },
        { method: "POST", path: "/v1/cofounder/chat", description: "Socratic advisory with contextual memory retrieval" },
      ],
      deployment: [
        "Vercel Edge Network for global frontend distribution",
        "Deterministic client-side mock evaluation for instant sandboxed demo runs",
      ],
      security_baseline: [
        "Strict Content Security Policy (CSP)",
        "Zero telemetry leaks; non-blocking analytics beacons",
        "Encrypted local storage tokens",
      ],
    },
    competitor_moves: [
      "Legacy EMR vendors are announcing generic LLM integrations in Q4.",
      "Generic chatbots are facing clinical safety pushback due to unconstrained hallucination.",
    ],
    go_to_market: [
      "Phase 1: Founder-led direct sales to specialty clinic operations directors.",
      "Phase 2: Co-marketing case studies with early pilot reference accounts.",
      "Phase 3: Integration listings in digital health partner directories.",
    ],
    build: {
      objective: "Deliver functional Async Command Center with urgency scoring engine.",
      exit_criteria: ["100% test pass on triage workflows", "Under 2-second UI response time"],
      kpis: ["Coordinator satisfaction > 90%", "Zero missed urgent escalations"],
      tasks: [
        {
          id: "task-b1",
          phase: "build",
          title: "Assemble Command Center Layout",
          outcome: "Responsive Next.js workspace with priority badge indicators.",
          owner_role: "Frontend Engineer",
          duration_days: 3,
          dependencies: [],
          acceptance_criteria: ["Displays active patient triage queue", "Filters by severity score"],
          recommended_tools: ["Next.js", "Tailwind", "Radix UI"],
          status: "done",
        },
        {
          id: "task-b2",
          phase: "build",
          title: "Implement Urgency Classification Engine",
          outcome: "Evaluates incoming triage payloads and assigns severity scores from 1-10.",
          owner_role: "AI Engineer",
          duration_days: 4,
          dependencies: ["task-b1"],
          acceptance_criteria: ["Sub-500ms scoring", "Passes clinical safety test suite"],
          recommended_tools: ["Zustand", "Mock Engine"],
          status: "in_progress",
        },
        {
          id: "task-b3",
          phase: "build",
          title: "Cryptographic Audit Ledger",
          outcome: "Immutable trace recording every routing decision for compliance.",
          owner_role: "Systems Architect",
          duration_days: 2,
          dependencies: ["task-b2"],
          acceptance_criteria: ["Records timestamp, user role, and severity rationale"],
          recommended_tools: ["Web Crypto API", "IndexedDB"],
          status: "todo",
        },
      ],
    },
    launch: {
      objective: "Deploy closed pilot with 5 specialty outpatient clinics.",
      exit_criteria: ["All 5 clinics active for 14 continuous days", "NPS score > 60"],
      kpis: ["Daily active coordinators > 15", "Triage resolution time < 2 mins"],
      tasks: [
        {
          id: "task-l1",
          phase: "launch",
          title: "Clinic Pilot Onboarding",
          outcome: "Train operations coordinators and import existing staff rosters.",
          owner_role: "Founder / GTM Lead",
          duration_days: 5,
          dependencies: ["task-b3"],
          acceptance_criteria: ["Conduct 30-min walkthrough with clinic manager"],
          recommended_tools: ["Loom", "Notion Guides"],
          status: "todo",
        },
      ],
    },
    growth: {
      objective: "Scale to 50 active practices with self-serve signup flow.",
      exit_criteria: ["Monthly recurring revenue > $25,000", "LTV:CAC ratio > 4.5x"],
      kpis: ["Net revenue retention > 110%", "Organic referral rate > 20%"],
      tasks: [
        {
          id: "task-g1",
          phase: "growth",
          title: "EHR Directory Integration",
          outcome: "Publish verified listing in AthenaHealth & Epic partner marketplaces.",
          owner_role: "Partnerships Lead",
          duration_days: 10,
          dependencies: ["task-l1"],
          acceptance_criteria: ["Approved partner badge and listing live"],
          recommended_tools: ["FHIR Sandbox"],
          status: "todo",
        },
      ],
    },
    launch_checklist: [
      "Verify zero unhandled console warnings in Next.js",
      "Benchmark WebGL canvas 60 FPS performance on standard laptops",
      "Confirm mock persistence survives page reloads and cache clearing",
    ],
    evidence: [
      {
        title: "AMA Practice Management Survey 2026",
        url: null,
        provider: "American Medical Association",
        retrieved_at: "2026-10-23T08:00:00.000Z",
        freshness: "Verified Q3 2026",
      },
      {
        title: "Outpatient Workflow Bottleneck Analysis",
        url: null,
        provider: "Healthcare Informatics Review",
        retrieved_at: "2026-10-23T08:00:00.000Z",
        freshness: "Verified Q3 2026",
      },
    ],
    validation: {
      confidence_score: 94,
      logical_consistency: 96,
      business_viability: 93,
      evidence_quality: 92,
      missing_information: ["Specialty billing codes for Medicaid reimbursement"],
      challenged_assumptions: ["Assumed clinics require live phone calls for all tier-1 escalations"],
      corrections_applied: ["Added SMS and secure portal push notifications as primary urgent channels"],
      passed: true,
    },
  };
}
