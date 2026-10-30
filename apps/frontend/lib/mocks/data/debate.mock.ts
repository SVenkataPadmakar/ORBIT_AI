/**
 * apps/frontend/lib/mocks/data/debate.mock.ts
 * Agent Council debate turns, reflections, and consensus scores.
 */
export interface DebateEvent {
  id: string;
  agentA: string;
  agentB: string;
  topic: string;
  agentAArg: string;
  agentBArg: string;
  resolution: string;
  confidenceScore: number;
  status: "verified" | "flagged";
}

export interface DebateCycleResponse {
  project_id: string;
  status: string;
  consensus_score: number;
  debates: DebateEvent[];
  round: number;
  reflection_count: number;
}

export function getMockDebateCycle(projectId: string): DebateCycleResponse {
  return {
    project_id: projectId,
    status: "consensus_reached",
    consensus_score: 94,
    round: 3,
    reflection_count: 2,
    debates: [
      {
        id: `deb-1-${projectId}`,
        agentA: "Product Strategy Agent",
        agentB: "Technical Architect Agent",
        topic: "Database Architecture: PostgreSQL with JSONB vs Dedicated Vector DB",
        agentAArg: "Coordinators need instant structured searches, but future patient metadata will have dynamic schema properties.",
        agentBArg: "PostgreSQL 16 with JSONB indexing provides ACID guarantees and handles arbitrary metadata with zero operational container sprawl.",
        resolution: "Adopted PostgreSQL 16 with JSONB columns. Eliminates separate vector cluster maintenance while preserving relational consistency.",
        confidenceScore: 95,
        status: "verified",
      },
      {
        id: `deb-2-${projectId}`,
        agentA: "Market Research Agent",
        agentB: "Finance & Monetization Agent",
        topic: "Pricing Strategy: Per-Coordinator Seat vs Fixed Clinic Tier",
        agentAArg: "Per-seat pricing creates adoption friction when clinic managers hesitate to add part-time coordinators.",
        agentBArg: "Tiered practice pricing ($499/mo Clinic Pro) encourages clinic-wide rollouts and yields a predictable 5.2x LTV:CAC.",
        resolution: "Adopted tiered practice pricing ($199 Starter / $499 Pro / $1299 Enterprise) with unlimited coordinator accounts.",
        confidenceScore: 92,
        status: "verified",
      },
      {
        id: `deb-3-${projectId}`,
        agentA: "Risk & Governance Agent",
        agentB: "Lead Developer Agent",
        topic: "Triage Alert Channels: Live Browser Audio vs Push Notification Queue",
        agentAArg: "Constant audio alerts in high-volume clinics cause immediate alarm fatigue and coordinator annoyance.",
        agentBArg: "Silent push notifications with high-contrast visual badges reduce stress while meeting the sub-2s latency SLA.",
        resolution: "Restricted audible chimes strictly to Tier-1 critical emergency escalations; all others queued visually.",
        confidenceScore: 96,
        status: "verified",
      },
    ],
  };
}
