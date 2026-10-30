/**
 * apps/frontend/lib/mocks/sse/mockEventStream.ts
 * In-browser Server-Sent Events emulator strictly compliant with:
 * ORBIT BACKEND — CONSTITUTION & ARCHITECTURE
 *
 * The 7 Agents (Linear Pipeline):
 * 1. problem_discovery (Gemini 2.0 Flash) -> problem.md
 * 2. market_analysis (Tavily Search + Gemini) -> market.md
 * 3. feasibility (GPT-4o, strict JSON) -> feasibility.json [Gate: score >= 80]
 * 4. prd_generator (Claude 3.5 Sonnet) -> PRD.md
 * 5. design (Claude 3.5 Sonnet) -> architecture.md, schema.sql, openapi.yaml, wireframes.md
 * 6. developer (Claude 3.5 Sonnet + E2B) -> orbit.zip (Code, tests, infra)
 * 7. risk_analysis (Claude 3.5 Sonnet) -> risk.md
 *
 * Progress Event Contract (SSE):
 * Every agent MUST emit:
 * { "run_id": str, "agent": str, "agent_index": int, "status": str, "percent": int, "message": str }
 */
export type ConstitutionAgent =
  | "problem_discovery"
  | "market_analysis"
  | "feasibility"
  | "prd_generator"
  | "design"
  | "developer"
  | "risk_analysis";

export interface ProgressEvent {
  run_id: string;
  agent: ConstitutionAgent | string;
  agent_index: number; // 1 to 7
  status: "pending" | "running" | "done" | "failed";
  percent: number; // 0 to 100
  message: string;
  eta_seconds?: number | null;
  timestamp: string;
}

export interface MockStreamMessage extends ProgressEvent {
  type: "pipeline_progress" | "artifact_updated" | "agent_step" | "status";
  stage?: string;
  progress_percent?: number;
  artifact_type?: string;
  artifact_name?: string;
  model?: string;
  data?: Record<string, unknown>;
}

export interface ConstitutionStageSpec {
  agent: ConstitutionAgent;
  agent_index: number;
  model: string;
  delayMs: number;
  percent: number;
  message: string;
  artifact_name: string;
  artifact_type: string;
  data?: Record<string, unknown>;
}

export const CONSTITUTIONAL_AGENTS: ConstitutionStageSpec[] = [
  {
    agent: "problem_discovery",
    agent_index: 1,
    model: "Gemini 2.0 Flash",
    delayMs: 400,
    percent: 14,
    message: "[problem_discovery] Gemini 2.0 Flash synthesizing customer pain vectors & triage bottlenecks into problem.md...",
    artifact_type: "problem_discovery",
    artifact_name: "problem.md",
  },
  {
    agent: "market_analysis",
    agent_index: 2,
    model: "Tavily Search + Gemini",
    delayMs: 1800,
    percent: 28,
    message: "[market_analysis] Tavily Search + Gemini synthesizing TAM ($8.4B), competitor matrix & clinical wedge into market.md...",
    artifact_type: "market_analysis",
    artifact_name: "market.md",
  },
  {
    agent: "feasibility",
    agent_index: 3,
    model: "GPT-4o (strict JSON)",
    delayMs: 3200,
    percent: 42,
    message: "[feasibility] GPT-4o evaluating feasibility score: 92/100 (Constitutional gate passed >= 80) into feasibility.json...",
    artifact_type: "feasibility",
    artifact_name: "feasibility.json",
    data: { score: 92, status: "passed", gate_passed: true, threshold: 80 },
  },
  {
    agent: "prd_generator",
    agent_index: 4,
    model: "Claude 3.5 Sonnet",
    delayMs: 4800,
    percent: 57,
    message: "[prd_generator] Claude 3.5 Sonnet compiling comprehensive PRD and MVP scope contract into PRD.md...",
    artifact_type: "prd_generator",
    artifact_name: "PRD.md",
  },
  {
    agent: "design",
    agent_index: 5,
    model: "Claude 3.5 Sonnet",
    delayMs: 6400,
    percent: 71,
    message: "[design] Claude 3.5 Sonnet generating architecture.md, schema.sql, openapi.yaml & wireframes.md...",
    artifact_type: "design",
    artifact_name: "architecture.md",
    data: {
      artifacts: ["architecture.md", "schema.sql", "openapi.yaml", "wireframes.md"],
    },
  },
  {
    agent: "developer",
    agent_index: 6,
    model: "Claude 3.5 Sonnet + E2B",
    delayMs: 8000,
    percent: 85,
    message: "[developer] Claude 3.5 Sonnet + E2B sandbox verifying build (0 failures) and packaging orbit.zip...",
    artifact_type: "developer",
    artifact_name: "orbit.zip",
    data: {
      sandbox: "E2B",
      build_status: "verified",
      repairs_attempted: 0,
      artifact: "orbit.zip",
    },
  },
  {
    agent: "risk_analysis",
    agent_index: 7,
    model: "Claude 3.5 Sonnet",
    delayMs: 9600,
    percent: 98,
    message: "[risk_analysis] Claude 3.5 Sonnet compiling regulatory, technical, and execution risks into risk.md...",
    artifact_type: "risk_analysis",
    artifact_name: "risk.md",
  },
];

export function startMockEventStream(
  projectId: string,
  onMessage: (msg: MockStreamMessage) => void,
  onError?: (err: unknown) => void,
): () => void {
  const runId = `run-${projectId}-${Date.now()}`;
  const timers: NodeJS.Timeout[] = [];

  try {
    // Initial SSE connection handshake
    onMessage({
      run_id: runId,
      agent: "problem_discovery",
      agent_index: 1,
      status: "pending",
      percent: 0,
      message: `[ORBIT Constitution] Connected to 7-Agent SSE pipeline for project [${projectId}]`,
      type: "status",
      stage: "initialized",
      progress_percent: 0,
      timestamp: new Date().toISOString(),
    });

    for (const spec of CONSTITUTIONAL_AGENTS) {
      // 1. Stage Start Event (status: running)
      const startTimer = setTimeout(() => {
        onMessage({
          run_id: runId,
          agent: spec.agent,
          agent_index: spec.agent_index,
          status: "running",
          percent: spec.percent,
          message: spec.message,
          type: "pipeline_progress",
          stage: spec.agent,
          progress_percent: spec.percent,
          model: spec.model,
          data: spec.data,
          timestamp: new Date().toISOString(),
        });
      }, spec.delayMs);

      // 2. Stage Handoff & Artifact Generation Event (status: done)
      const artifactTimer = setTimeout(() => {
        onMessage({
          run_id: runId,
          agent: spec.agent,
          agent_index: spec.agent_index,
          status: "done",
          percent: spec.percent,
          message: `[Handoff Contract] Artifact verified & committed to Postgres: ${spec.artifact_name}`,
          type: "artifact_updated",
          stage: spec.agent,
          progress_percent: spec.percent,
          artifact_type: spec.artifact_type,
          artifact_name: spec.artifact_name,
          model: spec.model,
          data: spec.data,
          timestamp: new Date().toISOString(),
        });
      }, spec.delayMs + 600);

      timers.push(startTimer, artifactTimer);
    }

    // Final Completion Event (all 7 agents finished)
    const completeTimer = setTimeout(() => {
      onMessage({
        run_id: runId,
        agent: "risk_analysis",
        agent_index: 7,
        status: "done",
        percent: 100,
        message: "Pipeline consensus reached! All 7 constitutional agents verified and artifacts generated.",
        type: "status",
        stage: "completed",
        progress_percent: 100,
        timestamp: new Date().toISOString(),
      });
    }, 11200);

    timers.push(completeTimer);
  } catch (err) {
    if (onError) onError(err);
  }

  // Teardown function to cancel all pending timers on stream unmount
  return () => {
    for (const t of timers) {
      clearTimeout(t);
    }
  };
}
