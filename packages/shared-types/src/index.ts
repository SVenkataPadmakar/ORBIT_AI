/**
 * Types shared between the frontend and any other TypeScript consumer of the
 * backend API. Hand-written for the small set of cross-cutting enums the
 * frontend needs before route-by-route types are generated from the FastAPI
 * OpenAPI schema (planned once Phase 4's core APIs land) via
 * `openapi-typescript`.
 */

export type ProjectStatus = "draft" | "running" | "complete" | "archived";

export type BlueprintStatus = "not_started" | "in_progress" | "complete" | "partial";

export type AgentKey =
  | "problem_discovery"
  | "market_research"
  | "product_strategy"
  | "finance"
  | "pitch_deck"
  | "vc_evaluation";

export type AgentRunStatus = "queued" | "running" | "success" | "failed" | "partial" | "retrying";

export interface AgentStatusEvent {
  event: "agent.started" | "agent.completed" | "agent.failed";
  agent_key: AgentKey;
  report_id?: string;
  tokens_used?: number;
  error_message?: string;
}
