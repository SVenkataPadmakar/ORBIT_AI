import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Persona {
    id: string;
    name: string;
    role: string;
    goals: string[];
    pains: string[];
}

export interface Feature {
    id: string;
    name: string;
    description: string;
    priority: "must" | "should" | "could";
    inMvp: boolean;
    acceptanceCriteria: string[];
}

export interface DecisionRecord {
    id: string;
    topic: string;
    decision: string;
    why: string;
    alternativesConsidered: string[];
    agentOpinions: Record<string, string>;
    confidenceScore: number;
    timestamp: string;
}

export interface DbTable {
    name: string;
    columns: Array<{ name: string; type: string; isPrimary?: boolean; isNullable?: boolean }>;
}

export interface ApiEndpoint {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    path: string;
    summary: string;
    requestBody?: string;
    responseBody?: string;
}

export interface SprintTaskItem {
    id: string;
    title: string;
    description: string;
    status: "todo" | "in_progress" | "blocked" | "done";
    role: string;
    durationDays: number;
    relatedFeatureId?: string;
}

export interface StartupMemoryState {
    // 1. Identity Memory
    id: string;
    name: string;
    idea: string;
    vision: string;
    targetMarket: string;

    // 2. Product Memory
    problem: string;
    valueProposition: string;
    personas: Persona[];
    userStories: string[];
    features: Feature[];
    mvpScope: string[];

    // 3. Technical Memory
    techStack: Array<{ layer: string; choice: string; reason: string }>;
    dbTables: DbTable[];
    apiEndpoints: ApiEndpoint[];

    // 4. Design Memory
    pages: Array<{ id: string; name: string; route: string; wireframeSpec: string }>;

    // 5. Execution Memory
    tasks: SprintTaskItem[];

    // 6. Decision Memory
    decisions: DecisionRecord[];

    // Actions
    setStartupIdentity: (name: string, idea: string) => void;
    updateProductMemory: (data: Partial<Pick<StartupMemoryState, "problem" | "valueProposition" | "personas" | "userStories" | "features" | "mvpScope">>) => void;
    addDecision: (decision: Omit<DecisionRecord, "id" | "timestamp">) => void;
    updateTaskStatus: (taskId: string, status: SprintTaskItem["status"]) => void;
    addFeature: (feature: Feature) => void;
    connectStream: (projectId: string) => () => void;
}

export const useStartupStore = create<StartupMemoryState>()(
    persist(
        (set) => ({
            id: "startup-1",
            name: "Relay Health",
            idea: "AI platform that automates customer support and operations handoffs for small healthcare teams.",
            vision: "Zero friction customer operations for digitally enabled clinics.",
            targetMarket: "Healthcare Operations & Clinics",

            problem: "Operations leaders lose 4+ hours/week reconciling fragmented patient handoffs across email, spreadsheets, and chat.",
            valueProposition: "Automate intake, triage, and handoff tracking with dedicated AI workflow agents.",

            personas: [
                { id: "p1", name: "Clinic Ops Lead", role: "Operations Manager", goals: ["Reduce manual data entry", "Prevent missed follow-ups"], pains: ["Fragmented tools", "Lack of audit trails"] },
                { id: "p2", name: "Patient Care Coord", role: "Care Coordinator", goals: ["Fast patient triage", "Clear handoffs"], pains: ["Repeated questions", "Delayed escalations"] },
            ],

            userStories: [
                "As an Ops Manager, I want automatic handoff summaries so I can verify status in under 30 seconds.",
                "As a Care Coordinator, I want instant patient inquiry triage so high-priority cases are escalated immediately.",
            ],

            features: [
                { id: "f1", name: "Async Handoff Command Center", description: "Central dashboard for tracking all active patient workflow items.", priority: "must", inMvp: true, acceptanceCriteria: ["List all active items", "Filter by urgency", "One-click escalation"] },
                { id: "f2", name: "Automated Intake Triage", description: "AI agent parses incoming inquiries and extracts key patient urgency signals.", priority: "must", inMvp: true, acceptanceCriteria: ["Extract priority score", "Assign to coordinator"] },
                { id: "f3", name: "EMR Integration Sync", description: "Bi-directional sync with electronic medical record providers.", priority: "should", inMvp: false, acceptanceCriteria: ["OAuth flow with Epic/Cerner"] },
            ],

            mvpScope: ["Async Handoff Command Center", "Automated Intake Triage"],

            techStack: [
                { layer: "Frontend", choice: "Next.js 15 App Router", reason: "React Server Components & fast initial page renders" },
                { layer: "API", choice: "FastAPI + Python", reason: "High throughput async execution & native Pydantic schema validation" },
                { layer: "Database", choice: "PostgreSQL 16", reason: "JSONB flexibility combined with strict relational integrity" },
                { layer: "Cache", choice: "Redis", reason: "Session state storage and WebSocket pub/sub messaging" },
            ],

            dbTables: [
                { name: "users", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "email", type: "VARCHAR(255)" }, { name: "role", type: "VARCHAR(50)" }] },
                { name: "workspaces", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "owner_id", type: "UUID" }, { name: "name", type: "VARCHAR(255)" }] },
                { name: "workflow_items", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "workspace_id", type: "UUID" }, { name: "title", type: "VARCHAR(255)" }, { name: "status", type: "VARCHAR(50)" }] },
            ],

            apiEndpoints: [
                { method: "GET", path: "/api/v1/workspaces", summary: "List active workspaces" },
                { method: "POST", path: "/api/v1/workspaces", summary: "Create new workspace", requestBody: "{ name: string }" },
                { method: "GET", path: "/api/v1/workspaces/{id}/items", summary: "Fetch workflow items" },
            ],

            pages: [
                { id: "p1", name: "Main Workspace", route: "/dashboard", wireframeSpec: "Header + 3 KPI Cards + Task Stream" },
                { id: "p2", name: "Workflow Board", route: "/workflow", wireframeSpec: "4-Column Kanban Board" },
                { id: "p3", name: "Team Settings", route: "/settings", wireframeSpec: "User Management & Integration Tokens" },
            ],

            tasks: [
                { id: "t1", title: "Setup Database & User Schema", description: "Run migration script for users and workspace tables.", status: "done", role: "Backend Eng", durationDays: 2, relatedFeatureId: "f1" },
                { id: "t2", title: "Implement Async Handoff API", description: "Create CRUD routes for workflow items in FastAPI.", status: "in_progress", role: "Backend Eng", durationDays: 3, relatedFeatureId: "f1" },
                { id: "t3", title: "Build Command Center UI", description: "React layout with live status pill indicators.", status: "todo", role: "Frontend Eng", durationDays: 4, relatedFeatureId: "f1" },
                { id: "t4", title: "Integrate Automated Triage Agent", description: "Connect Gemini AI provider to incoming payload parser.", status: "todo", role: "AI Engineer", durationDays: 3, relatedFeatureId: "f2" },
            ],

            decisions: [
                {
                    id: "d1",
                    topic: "Database Architecture Choice: PostgreSQL vs Serverless KV",
                    decision: "Use PostgreSQL 16 with JSONB",
                    why: "Maintains relational data integrity for workspaces while allowing schema-less payload storage for agent outputs.",
                    alternativesConsidered: ["Serverless KV", "MongoDB"],
                    agentOpinions: { "Technical Architect": "PostgreSQL ensures ACID compliance", "Finance Agent": "Zero cost on free tier" },
                    confidenceScore: 94,
                    timestamp: new Date().toISOString(),
                },
            ],

            setStartupIdentity: (name, idea) => set((s) => ({ ...s, name, idea })),
            updateProductMemory: (data) => set((s) => ({ ...s, ...data })),
            addDecision: (dec) => set((s) => ({
                ...s,
                decisions: [
                    ...s.decisions,
                    { ...dec, id: `d-${Date.now()}`, timestamp: new Date().toISOString() },
                ],
            })),
            updateTaskStatus: (taskId, status) => set((s) => ({
                ...s,
                tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
            })),
            addFeature: (feature) => set((s) => ({
                ...s,
                features: [...s.features, feature],
            })),
            connectStream: (projectId: string) => {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";
                const eventSource = new EventSource(`${apiUrl}/projects/${projectId}/stream`);
                
                eventSource.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === "artifact_updated") {
                        // Dynamically update the store based on artifact type
                        // In a real implementation, this would map the API response payload
                        // to the corresponding keys in StartupMemoryState.
                    }
                };

                eventSource.onerror = (error) => {
                    console.error("SSE Error:", error);
                    eventSource.close();
                };

                // Return cleanup function
                return () => {
                    eventSource.close();
                };
            },
        }),
        {
            name: "forge-idea-startup-memory",
        },
    ),
);
