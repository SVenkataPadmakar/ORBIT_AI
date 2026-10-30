/**
 * apps/frontend/lib/mocks/storage.ts
 * In-memory state store with localStorage persistence for mutations.
 */
import type {
  Project,
  ProjectCreate,
  ExecutionPlan,
  CofounderMessage,
} from "@/types/api";
import type { DecisionCreateRequest, DecisionMemoryItem } from "@/types/cofounder";
import { INITIAL_MOCK_PROJECTS } from "./data/projects.mock";
import { getMockExecutionPlan } from "./data/execution.mock";
import { INITIAL_COFOUNDER_MESSAGES } from "./data/cofounder.mock";

const STORAGE_KEY = "asc-mock-store";

interface MockStorageState {
  projects: Project[];
  executionPlans: Record<string, ExecutionPlan>;
  cofounderHistory: Record<string, CofounderMessage[]>;
  decisions: Record<string, DecisionMemoryItem[]>;
}

function loadInitialState(): MockStorageState {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Fallback to initial seeds
    }
  }

  const executionPlans: Record<string, ExecutionPlan> = {};
  for (const p of INITIAL_MOCK_PROJECTS) {
    executionPlans[p.id] = getMockExecutionPlan(p.id);
  }

  return {
    projects: [...INITIAL_MOCK_PROJECTS],
    executionPlans,
    cofounderHistory: { ...INITIAL_COFOUNDER_MESSAGES },
    decisions: {},
  };
}

let state: MockStorageState = loadInitialState();

function persistState() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota or private browsing safeguard
    }
  }
}

export const mockStorage = {
  getProjects: (): Project[] => {
    return state.projects;
  },

  getProject: (id: string): Project | undefined => {
    return state.projects.find((p) => p.id === id);
  },

  createProject: (data: ProjectCreate): Project => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      owner_id: "usr-orbit-founder-001",
      name: data.name,
      idea_description: data.idea_description,
      industry: data.industry || "B2B Software",
      target_audience: data.target_audience || "Founders & Builders",
      budget_band: data.budget_band || "$15k - $50k",
      goals: data.goals || "Deploy MVP within 90 days",
      status: "active",
      blueprint_status: "in_progress",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.projects.unshift(newProject);
    state.executionPlans[newProject.id] = getMockExecutionPlan(newProject.id);
    persistState();
    return newProject;
  },

  updateProject: (id: string, patch: Partial<ProjectCreate> & { status?: Project["status"] }): Project => {
    const fallback = INITIAL_MOCK_PROJECTS[0] || {
      id: "startup-1",
      owner_id: "usr-orbit-founder-001",
      name: "Relay Health",
      idea_description: "Clinical Operations AI",
      industry: "Digital Health",
      target_audience: "Clinic Coordinators",
      budget_band: "$15k - $50k",
      goals: "Validate MVP",
      status: "active" as const,
      blueprint_status: "complete",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const idx = state.projects.findIndex((p) => p.id === id);
    if (idx === -1) {
      return state.projects[0] || fallback;
    }
    const current = state.projects[idx] || fallback;
    const updated: Project = {
      id: current.id,
      owner_id: current.owner_id,
      name: patch.name ?? current.name,
      idea_description: patch.idea_description ?? current.idea_description,
      industry: patch.industry !== undefined ? (patch.industry ?? null) : current.industry,
      target_audience: patch.target_audience !== undefined ? (patch.target_audience ?? null) : current.target_audience,
      budget_band: patch.budget_band !== undefined ? (patch.budget_band ?? null) : current.budget_band,
      goals: patch.goals !== undefined ? (patch.goals ?? null) : current.goals,
      status: patch.status ?? current.status,
      blueprint_status: current.blueprint_status,
      created_at: current.created_at,
      updated_at: new Date().toISOString(),
    };
    state.projects[idx] = updated;
    persistState();
    return updated;
  },

  removeProject: (id: string): void => {
    state.projects = state.projects.filter((p) => p.id !== id);
    delete state.executionPlans[id];
    delete state.cofounderHistory[id];
    persistState();
  },

  getExecutionPlan: (projectId: string): ExecutionPlan => {
    if (!state.executionPlans[projectId]) {
      state.executionPlans[projectId] = getMockExecutionPlan(projectId);
      persistState();
    }
    return state.executionPlans[projectId];
  },

  updateExecutionTask: (projectId: string, taskId: string, status: string): ExecutionPlan => {
    const plan = mockStorage.getExecutionPlan(projectId);
    const validStatus = status as "todo" | "in_progress" | "blocked" | "done";

    for (const phase of [plan.build, plan.launch, plan.growth]) {
      const task = phase.tasks.find((t) => t.id === taskId);
      if (task) {
        task.status = validStatus;
        break;
      }
    }
    persistState();
    return plan;
  },

  getCofounderHistory: (projectId?: string): CofounderMessage[] => {
    const key = projectId || "startup-1";
    return state.cofounderHistory[key] || INITIAL_COFOUNDER_MESSAGES["startup-1"] || [];
  },

  addCofounderMessage: (projectId: string | null, message: CofounderMessage): void => {
    const key = projectId || "startup-1";
    if (!state.cofounderHistory[key]) {
      state.cofounderHistory[key] = [];
    }
    state.cofounderHistory[key].push(message);
    persistState();
  },

  logDecision: (data: DecisionCreateRequest): DecisionMemoryItem => {
    const key = data.project_id || "startup-1";
    if (!state.decisions[key]) {
      state.decisions[key] = [];
    }
    const item: DecisionMemoryItem = {
      id: `dec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: data.category,
      decision: data.decision,
      rationale: data.rationale,
      rejected_alternatives: data.rejected_alternatives || [],
      trade_offs: data.trade_offs || [],
      status: "active",
    };
    state.decisions[key].unshift(item);
    persistState();
    return item;
  },

  resetMockStore: (): void => {
    state = {
      projects: [...INITIAL_MOCK_PROJECTS],
      executionPlans: {},
      cofounderHistory: { ...INITIAL_COFOUNDER_MESSAGES },
      decisions: {},
    };
    for (const p of INITIAL_MOCK_PROJECTS) {
      state.executionPlans[p.id] = getMockExecutionPlan(p.id);
    }
    persistState();
  },
};
