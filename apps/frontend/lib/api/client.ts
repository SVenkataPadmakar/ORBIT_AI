/**
 * apps/frontend/lib/api/client.ts
 * Centralized API client routed to the ORBIT mock layer.
 * Preserves 100% interface compatibility for all consuming components.
 */
import { useAuthStore } from "@/lib/stores/auth-store";
import type {
  LoginRequest,
  PipelineRunResponse,
  PipelineStatus,
  ProjectCreate,
  RegisterRequest,
} from "@/types/api";

import {
  mockAuthApi,
  mockAuthHandlers,
  mockProjectsApi,
  mockCofounderApi,
  mockMemoryApi,
  mockAdminApi,
  mockDebateApi,
  getMockApiHealth,
  withLatency,
} from "@/lib/mocks";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiNetworkError extends ApiError {
  constructor(message = "The operating system is unavailable. Check the API service and try again.") {
    super(0, "NETWORK_ERROR", message);
    this.name = "ApiNetworkError";
  }
}

export interface RequestOptions extends RequestInit {
  accessToken?: string | null;
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

/**
 * Universal apiFetch mock dispatcher for legacy routes (e.g. /projects/:id/debate).
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method?.toUpperCase() || "GET";
  const body = options.body ? JSON.parse(options.body as string) : {};

  return withLatency(async () => {
    // Debate system handler
    if (path.includes("/debate")) {
      const match = path.match(/\/projects\/([^/]+)\/debate/);
      const projectId = (match && match[1]) ? match[1] : "startup-1";
      if (method === "POST") {
        return mockDebateApi.runDebate(projectId) as unknown as T;
      }
      return mockDebateApi.getDebate(projectId) as unknown as T;
    }

    // Auth routes
    if (path === "/auth/login") {
      const res = await mockAuthApi.login(body as LoginRequest);
      useAuthStore.getState().setSession(res);
      return res as unknown as T;
    }
    if (path === "/auth/register") {
      const res = await mockAuthApi.register(body as RegisterRequest);
      useAuthStore.getState().setSession(res);
      return res as unknown as T;
    }
    if (path === "/auth/me") {
      return (await mockAuthApi.me()) as unknown as T;
    }
    if (path === "/auth/logout") {
      useAuthStore.getState().clearSession();
      return { detail: "Logged out" } as unknown as T;
    }

    // Projects list
    if (path === "/projects" || path.startsWith("/projects?")) {
      if (method === "POST") {
        return (await mockProjectsApi.create(body as ProjectCreate)) as unknown as T;
      }
      return (await mockProjectsApi.list()) as unknown as T;
    }

    // Single project routes
    const projectMatch = path.match(/\/projects\/([^/]+)/);
    if (projectMatch && projectMatch[1]) {
      const projectId = projectMatch[1];
      if (path.endsWith("/execution")) {
        return (await mockProjectsApi.execution(projectId)) as unknown as T;
      }
      if (path.endsWith("/memory")) {
        return (await mockMemoryApi.getState(projectId)) as unknown as T;
      }
      return (await mockProjectsApi.get(projectId)) as unknown as T;
    }

    // Fallback empty response
    return {} as T;
  });
}

// Export mock-backed domain namespaces with 100% signature matching
export const authApi = {
  ...mockAuthApi,
  login: async (data: LoginRequest) => {
    const res = await mockAuthHandlers.login(data);
    useAuthStore.getState().login(res);
    return res;
  },
  register: async (data: RegisterRequest) => {
    const res = await mockAuthHandlers.register(data);
    useAuthStore.getState().login(res);
    return res;
  },
  logout: async () => {
    useAuthStore.getState().clearSession();
    return mockAuthHandlers.logout();
  },
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const projectsApi = {
  ...mockProjectsApi,
  startPipeline: async (
    projectId: string,
    options?: { idea?: string } | string
  ): Promise<PipelineRunResponse> => {
    // 1. Resolve idea text from parameter or project details
    let ideaText = typeof options === "string" ? options : options?.idea;
    if (!ideaText) {
      try {
        const proj = await mockProjectsApi.get(projectId);
        ideaText = proj.idea_description || proj.name;
      } catch {
        ideaText = "Autonomous AI Startup Venture";
      }
    }

    // 2. Make POST request to the real backend endpoint POST /api/runs with idea payload
    const effectiveRunId = `run-${projectId}-${Date.now()}`;
    const userId = useAuthStore.getState().user?.id || "default-user";

    try {
      const response = await fetch(`${API_BASE_URL}/api/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          idea: ideaText,
          run_id: effectiveRunId,
          tenant_id: "default-tenant",
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new ApiError(
          response.status,
          "RUN_START_FAILED",
          `Failed to launch pipeline: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        pipeline_run_id: data.run_id || effectiveRunId,
        project_id: projectId,
        status: (data.status as PipelineStatus) || "running",
        run_count: 1,
        execution: "inline",
        mode: "provider",
        provider: "gemini-2.0-flash",
      };
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      console.warn("Backend /api/runs unreachable, falling back to mock pipeline:", err);
      return mockProjectsApi.startPipeline(projectId);
    }
  },
};
export const cofounderApi = mockCofounderApi;
export const memoryApi = mockMemoryApi;
export const adminApi = mockAdminApi;
export const getApiHealth = getMockApiHealth;
