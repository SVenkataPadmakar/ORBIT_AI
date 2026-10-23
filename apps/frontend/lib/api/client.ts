import { useAuthStore } from "@/lib/stores/auth-store";
import type {
  AdminOverview,
  AdminUser,
  CofounderMessage,
  CofounderResponse,
  ExecutionPlan,
  FinancialArtifact,
  ForgotPasswordRequest,
  GoogleOAuthRequest,
  LoginRequest,
  OtpSendRequest,
  OtpSendResponse,
  OtpVerifyRequest,
  PipelineResultResponse,
  PipelineRunResponse,
  PipelineStatusResponse,
  PitchArtifact,
  Project,
  ProjectCreate,
  ProjectListResponse,
  RegisterRequest,
  ReportArtifact,
  ResetPasswordRequest,
  TokenResponse,
  User,
} from "@/types/api";
import type {
  AssumptionChallengeRequest,
  AssumptionChallengeResponse,
  CofounderMemoryState,
  DecisionCreateRequest,
  DecisionMemoryItem,
  WorkspaceGuidance,
} from "@/types/cofounder";
import type {
  MemoryRecordRequest,
  MemoryRecordResponse,
  MemoryReindexResponse,
  MemorySearchRequest,
  MemorySearchResponse,
  MemoryStatsResponse,
} from "@/types/memory";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/v1";

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

interface RequestOptions extends RequestInit {
  accessToken?: string | null;
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

let refreshPromise: Promise<TokenResponse> | null = null;

async function parseError(response: Response): Promise<ApiError> {
  const body = await response.json().catch(() => ({}));
  const validationDetail = Array.isArray(body?.detail)
    ? body.detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join(". ")
    : body?.detail;
  return new ApiError(
    response.status,
    body?.error?.code ?? (response.status === 422 ? "VALIDATION_ERROR" : "UNKNOWN_ERROR"),
    body?.error?.detail ?? body?.error?.message ?? validationDetail ?? response.statusText ?? "Request failed",
  );
}

async function request(input: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new ApiNetworkError();
  }
}

async function refreshSession(): Promise<TokenResponse> {
  if (!refreshPromise) {
    refreshPromise = request(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) throw await parseError(response);
        const session = (await response.json()) as TokenResponse;
        useAuthStore.getState().setSession(session);
        return session;
      })
      .catch((error) => {
        useAuthStore.getState().clearSession();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { accessToken, headers, skipAuth = false, skipRefresh = false, ...rest } = options;
  const token = accessToken === undefined ? useAuthStore.getState().accessToken : accessToken;

  const response = await request(`${API_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (response.status === 401 && !skipAuth && !skipRefresh) {
    const session = await refreshSession();
    return apiFetch<T>(path, { ...options, accessToken: session.access_token, skipRefresh: true });
  }

  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiFetch<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),
  register: (data: RegisterRequest) =>
    apiFetch<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),
  refresh: refreshSession,
  me: () => apiFetch<User>("/auth/me"),
  logout: async () => {
    try {
      return await apiFetch<{ detail: string }>("/auth/logout", { method: "POST" });
    } finally {
      useAuthStore.getState().clearSession();
    }
  },
  sendOtp: (data: OtpSendRequest) =>
    apiFetch<OtpSendResponse>("/auth/otp/send", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),
  verifyOtp: (data: OtpVerifyRequest) =>
    apiFetch<TokenResponse>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),
  forgotPassword: (data: ForgotPasswordRequest) =>
    apiFetch<{ detail: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),
  resetPassword: (data: ResetPasswordRequest) =>
    apiFetch<TokenResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),
  googleOAuth: (data: GoogleOAuthRequest) =>
    apiFetch<TokenResponse>("/auth/oauth/google", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),
};

export const projectsApi = {
  list: (params?: { status?: string; offset?: number; limit?: number }) => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.offset !== undefined) search.set("offset", String(params.offset));
    if (params?.limit !== undefined) search.set("limit", String(params.limit));
    const query = search.toString();
    return apiFetch<ProjectListResponse>(`/projects${query ? `?${query}` : ""}`);
  },
  get: (projectId: string) => apiFetch<Project>(`/projects/${projectId}`),
  create: (data: ProjectCreate) =>
    apiFetch<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
  update: (projectId: string, data: Partial<ProjectCreate> & { status?: Project["status"] }) =>
    apiFetch<Project>(`/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (projectId: string) => apiFetch<void>(`/projects/${projectId}`, { method: "DELETE" }),
  startPipeline: (projectId: string) =>
    apiFetch<PipelineRunResponse>(`/projects/${projectId}/pipeline/start`, { method: "POST" }),
  latestPipelineStatus: (projectId: string) =>
    apiFetch<PipelineStatusResponse>(`/projects/${projectId}/pipeline/latest`),
  pipelineStatus: (projectId: string, runId: string) =>
    apiFetch<PipelineStatusResponse>(`/projects/${projectId}/pipeline/${runId}`),
  pipelineResult: (projectId: string, runId: string) =>
    apiFetch<PipelineResultResponse>(`/projects/${projectId}/pipeline/${runId}/result`),
  reports: (projectId: string) => apiFetch<ReportArtifact[]>(`/projects/${projectId}/reports`),
  artifact: {
    research: (projectId: string) =>
      apiFetch<ReportArtifact>(`/projects/${projectId}/artifacts/research`),
    prd: (projectId: string) => apiFetch<ReportArtifact>(`/projects/${projectId}/artifacts/prd`),
    roadmap: (projectId: string) =>
      apiFetch<ReportArtifact>(`/projects/${projectId}/artifacts/roadmap`),
    financials: (projectId: string) =>
      apiFetch<FinancialArtifact>(`/projects/${projectId}/artifacts/financials`),
    pitch: (projectId: string) =>
      apiFetch<PitchArtifact>(`/projects/${projectId}/artifacts/pitch`),
    vc: (projectId: string) => apiFetch<ReportArtifact>(`/projects/${projectId}/artifacts/vc`),
  },
  execution: (projectId: string) => apiFetch<ExecutionPlan>(`/projects/${projectId}/execution`),
  regenerateExecution: (projectId: string) =>
    apiFetch<ExecutionPlan>(`/projects/${projectId}/execution/regenerate`, { method: "POST" }),
  updateExecutionTask: (projectId: string, taskId: string, status: string) =>
    apiFetch<ExecutionPlan>(`/projects/${projectId}/execution/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

export const cofounderApi = {
  history: (projectId?: string) =>
    apiFetch<CofounderMessage[]>(`/cofounder/history${projectId ? `?project_id=${projectId}` : ""}`),
  chat: (message: string, projectId?: string, pageContext?: string) =>
    apiFetch<CofounderResponse>("/cofounder/chat", {
      method: "POST",
      body: JSON.stringify({ message, project_id: projectId, page_context: pageContext }),
    }),
  getMemory: (projectId: string) =>
    apiFetch<CofounderMemoryState>(`/cofounder/memory?project_id=${projectId}`),
  getGuidance: (projectId: string, workspace: string) =>
    apiFetch<WorkspaceGuidance>(`/cofounder/guidance?project_id=${projectId}&workspace=${workspace}`),
  logDecision: (data: DecisionCreateRequest) =>
    apiFetch<DecisionMemoryItem>("/cofounder/decisions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  challengeAssumption: (data: AssumptionChallengeRequest) =>
    apiFetch<AssumptionChallengeResponse>("/cofounder/challenge", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const memoryApi = {
  getState: (projectId: string) =>
    apiFetch<CofounderMemoryState>(`/projects/${projectId}/memory`),
  search: (projectId: string, data: MemorySearchRequest) =>
    apiFetch<MemorySearchResponse>(`/projects/${projectId}/memory/search`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  index: (projectId: string) =>
    apiFetch<MemoryReindexResponse>(`/projects/${projectId}/memory/index`, {
      method: "POST",
    }),
  record: (projectId: string, data: MemoryRecordRequest) =>
    apiFetch<MemoryRecordResponse>(`/projects/${projectId}/memory/record`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getStats: (projectId: string) =>
    apiFetch<MemoryStatsResponse>(`/projects/${projectId}/memory/stats`),
  delete: (projectId: string, memoryId: string) =>
    apiFetch<{ status: string; memory_id: string }>(`/projects/${projectId}/memory/${memoryId}`, {
      method: "DELETE",
    }),
};

export const adminApi = {
  overview: () => apiFetch<AdminOverview>("/admin/overview"),
  users: () => apiFetch<AdminUser[]>("/admin/users"),
};

export async function getApiHealth(): Promise<{ status: string; database: string }> {
  const rootUrl = API_URL.replace(/\/v1\/?$/, "");
  const response = await request(`${rootUrl}/health`, {});
  if (!response.ok) throw new ApiError(response.status, "HEALTH_CHECK_FAILED", response.statusText);
  return response.json();
}
