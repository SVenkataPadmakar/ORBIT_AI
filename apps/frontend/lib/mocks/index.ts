/**
 * apps/frontend/lib/mocks/index.ts
 * Main entry point for the ORBIT frontend mock layer.
 */
import type {
  AdminOverview,
  AdminUser,
  CofounderMessage,
  CofounderResponse,
  ExecutionPlan,
  FinancialArtifact,
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
  TokenResponse,
  User,
  GoogleOAuthRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
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

export { mockAuthHandlers } from "./data/auth.mock";
import { mockAuthHandlers } from "./data/auth.mock";
import { mockStorage } from "./storage";
import {
  getMockPipelineStatus,
  getMockPipelineResult,
} from "./data/projects.mock";
import {
  getMockResearchArtifact,
  getMockPrdArtifact,
  getMockRoadmapArtifact,
  getMockFinancialArtifact,
  getMockPitchArtifact,
  getMockVcArtifact,
  getMockProblemArtifact,
  getMockMarketAnalysisArtifact,
  getMockFeasibilityArtifact,
  getMockDesignArtifact,
  getMockDeveloperArtifact,
  getMockRiskArtifact,
} from "./data/artifacts.mock";
import {
  getMockCofounderResponse,
  getMockWorkspaceGuidance,
  getMockAssumptionChallenge,
  getMockCofounderMemoryState,
} from "./data/cofounder.mock";
import {
  getMockMemorySearch,
  getMockMemoryStats,
  getMockMemoryReindex,
  createMockMemoryRecord,
} from "./data/memory.mock";
import { getMockDebateCycle, type DebateCycleResponse } from "./data/debate.mock";
import { MOCK_ADMIN_OVERVIEW, MOCK_ADMIN_USERS } from "./data/admin.mock";
import {
  startMockEventStream,
  CONSTITUTIONAL_AGENTS,
  type MockStreamMessage,
  type ProgressEvent,
  type ConstitutionAgent,
  type ConstitutionStageSpec,
} from "./sse/mockEventStream";

/**
 * Fast zero-delay mock executor conforming to the ORBIT Performance Constitution.
 */
export async function withLatency<T>(fn: () => T | Promise<T>, _minMs = 0, _maxMs = 0): Promise<T> {
  return fn();
}

export const mockAuthApi = {
  login: (data: LoginRequest): Promise<TokenResponse> => withLatency(() => mockAuthHandlers.login(data)),
  register: (data: RegisterRequest): Promise<TokenResponse> => withLatency(() => mockAuthHandlers.register(data)),
  refresh: (): Promise<TokenResponse> => withLatency(() => mockAuthHandlers.refresh()),
  me: (): Promise<User> => withLatency(() => mockAuthHandlers.me()),
  logout: (): Promise<{ detail: string }> => withLatency(() => mockAuthHandlers.logout()),
  sendOtp: (data: OtpSendRequest): Promise<OtpSendResponse> => withLatency(() => mockAuthHandlers.sendOtp(data)),
  verifyOtp: (data: OtpVerifyRequest): Promise<TokenResponse> => withLatency(() => mockAuthHandlers.verifyOtp(data)),
  forgotPassword: (data: ForgotPasswordRequest): Promise<{ detail: string }> => withLatency(() => mockAuthHandlers.forgotPassword(data)),
  resetPassword: (data: ResetPasswordRequest): Promise<TokenResponse> => withLatency(() => mockAuthHandlers.resetPassword(data)),
  googleOAuth: (data: GoogleOAuthRequest): Promise<TokenResponse> => withLatency(() => mockAuthHandlers.googleOAuth(data)),
};

export const mockProjectsApi = {
  list: (params?: { status?: string; offset?: number; limit?: number }): Promise<ProjectListResponse> => {
    return withLatency(() => {
      let items = mockStorage.getProjects();
      if (params?.status) {
        items = items.filter((p) => p.status === params.status);
      }
      return {
        items,
        total: items.length,
        offset: params?.offset || 0,
        limit: params?.limit || items.length,
      };
    });
  },

  get: (projectId: string): Promise<Project> => {
    return withLatency(() => {
      const p = mockStorage.getProject(projectId);
      if (!p) {
        // Fallback to first project or generate placeholder
        const fallback = mockStorage.getProjects()[0];
        return fallback || {
          id: projectId,
          owner_id: "usr-orbit-founder-001",
          name: "Project Workspace",
          idea_description: "Active workspace",
          industry: "Tech",
          target_audience: "Founders",
          budget_band: "$15k - $50k",
          goals: "Build MVP",
          status: "active",
          blueprint_status: "complete",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return p;
    });
  },

  create: (data: ProjectCreate): Promise<Project> => {
    return withLatency(() => mockStorage.createProject(data));
  },

  update: (projectId: string, data: Partial<ProjectCreate> & { status?: Project["status"] }): Promise<Project> => {
    return withLatency(() => {
      const updated = mockStorage.updateProject(projectId, data);
      return updated || mockStorage.getProjects()[0];
    });
  },

  remove: (projectId: string): Promise<void> => {
    return withLatency(() => mockStorage.removeProject(projectId));
  },

  startPipeline: (projectId: string): Promise<PipelineRunResponse> => {
    return withLatency(() => ({
      pipeline_run_id: `run-${projectId}-${Date.now()}`,
      project_id: projectId,
      status: "running",
      run_count: 1,
      execution: "inline",
      mode: "demo",
      provider: "orbit-mock",
    }));
  },

  latestPipelineStatus: (projectId: string): Promise<PipelineStatusResponse> => {
    return withLatency(() => getMockPipelineStatus(projectId));
  },

  pipelineStatus: (projectId: string, _runId: string): Promise<PipelineStatusResponse> => {
    return withLatency(() => getMockPipelineStatus(projectId));
  },

  pipelineResult: (projectId: string, _runId: string): Promise<PipelineResultResponse> => {
    return withLatency(() => getMockPipelineResult(projectId));
  },

  reports: (projectId: string): Promise<ReportArtifact[]> => {
    return withLatency(() => [
      getMockResearchArtifact(projectId),
      getMockPrdArtifact(projectId),
      getMockRoadmapArtifact(projectId),
      getMockVcArtifact(projectId),
    ]);
  },

  artifact: {
    // 7 Constitutional Pipeline Artifacts
    problem: (projectId: string): Promise<ReportArtifact> => withLatency(() => getMockProblemArtifact(projectId)),
    marketAnalysis: (projectId: string): Promise<ReportArtifact> => withLatency(() => getMockMarketAnalysisArtifact(projectId)),
    feasibility: (projectId: string): Promise<ReportArtifact> => withLatency(() => getMockFeasibilityArtifact(projectId)),
    prd: (projectId: string): Promise<ReportArtifact> => withLatency(() => getMockPrdArtifact(projectId)),
    design: (projectId: string): Promise<ReportArtifact> => withLatency(() => getMockDesignArtifact(projectId)),
    developer: (projectId: string): Promise<ReportArtifact> => withLatency(() => getMockDeveloperArtifact(projectId)),
    risk: (projectId: string): Promise<ReportArtifact> => withLatency(() => getMockRiskArtifact(projectId)),

    // Domain & Legacy UI Aliases
    research: (projectId: string): Promise<ReportArtifact> => withLatency(() => getMockResearchArtifact(projectId)),
    roadmap: (projectId: string): Promise<ReportArtifact> => withLatency(() => getMockRoadmapArtifact(projectId)),
    financials: (projectId: string): Promise<FinancialArtifact> => withLatency(() => getMockFinancialArtifact(projectId)),
    pitch: (projectId: string): Promise<PitchArtifact> => withLatency(() => getMockPitchArtifact(projectId)),
    vc: (projectId: string): Promise<ReportArtifact> => withLatency(() => getMockVcArtifact(projectId)),
  },

  execution: (projectId: string): Promise<ExecutionPlan> => {
    return withLatency(() => mockStorage.getExecutionPlan(projectId));
  },

  regenerateExecution: (projectId: string): Promise<ExecutionPlan> => {
    return withLatency(() => mockStorage.getExecutionPlan(projectId));
  },

  updateExecutionTask: (projectId: string, taskId: string, status: string): Promise<ExecutionPlan> => {
    return withLatency(() => mockStorage.updateExecutionTask(projectId, taskId, status));
  },
};

export const mockCofounderApi = {
  history: (projectId?: string): Promise<CofounderMessage[]> => {
    return withLatency(() => mockStorage.getCofounderHistory(projectId));
  },

  chat: (message: string, projectId?: string, _pageContext?: string): Promise<CofounderResponse> => {
    return withLatency(() => {
      const pid = projectId || "startup-1";
      mockStorage.addCofounderMessage(pid, {
        role: "user",
        content: message,
        created_at: new Date().toISOString(),
      });
      const response = getMockCofounderResponse(message, pid);
      mockStorage.addCofounderMessage(pid, {
        role: "assistant",
        content: response.answer,
        created_at: new Date().toISOString(),
      });
      return response;
    });
  },

  getMemory: (projectId: string): Promise<CofounderMemoryState> => {
    return withLatency(() => getMockCofounderMemoryState(projectId));
  },

  getGuidance: (projectId: string, workspace: string): Promise<WorkspaceGuidance> => {
    return withLatency(() => getMockWorkspaceGuidance(projectId, workspace));
  },

  logDecision: (data: DecisionCreateRequest): Promise<DecisionMemoryItem> => {
    return withLatency(() => mockStorage.logDecision(data));
  },

  challengeAssumption: (data: AssumptionChallengeRequest): Promise<AssumptionChallengeResponse> => {
    return withLatency(() => getMockAssumptionChallenge(data));
  },
};

export const mockMemoryApi = {
  getState: (projectId: string): Promise<CofounderMemoryState> => {
    return withLatency(() => getMockCofounderMemoryState(projectId));
  },

  search: (projectId: string, data: MemorySearchRequest): Promise<MemorySearchResponse> => {
    return withLatency(() => getMockMemorySearch(projectId, data));
  },

  index: (projectId: string): Promise<MemoryReindexResponse> => {
    return withLatency(() => getMockMemoryReindex(projectId));
  },

  record: (projectId: string, data: MemoryRecordRequest): Promise<MemoryRecordResponse> => {
    return withLatency(() => createMockMemoryRecord(projectId, data));
  },

  getStats: (projectId: string): Promise<MemoryStatsResponse> => {
    return withLatency(() => getMockMemoryStats(projectId));
  },

  delete: (projectId: string, memoryId: string): Promise<{ status: string; memory_id: string }> => {
    return withLatency(() => ({ status: "deleted", memory_id: memoryId }));
  },
};

export const mockAdminApi = {
  overview: (): Promise<AdminOverview> => withLatency(() => MOCK_ADMIN_OVERVIEW),
  users: (): Promise<AdminUser[]> => withLatency(() => MOCK_ADMIN_USERS),
};

export const mockDebateApi = {
  getDebate: (projectId: string): Promise<DebateCycleResponse> => withLatency(() => getMockDebateCycle(projectId)),
  runDebate: (projectId: string): Promise<DebateCycleResponse> => withLatency(() => getMockDebateCycle(projectId)),
};

export async function getMockApiHealth(): Promise<{ status: string; database: string }> {
  return withLatency(() => ({ status: "healthy", database: "mock-memory-store" }), 50, 100);
}

export {
  startMockEventStream,
  CONSTITUTIONAL_AGENTS,
  type MockStreamMessage,
  type ProgressEvent,
  type ConstitutionAgent,
  type ConstitutionStageSpec,
  mockStorage,
};
