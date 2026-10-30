/**
 * apps/frontend/lib/mocks/types.ts
 * Type definitions and shared interfaces for the ORBIT mock layer.
 */
import type {
  Project,
  User,
  ExecutionPlan,
  ReportArtifact,
  FinancialArtifact,
  PitchArtifact,
  CofounderMessage,
  PipelineStatusResponse,
} from "@/types/api";
import type {
  CofounderMemoryState,
  DecisionMemoryItem,
} from "@/types/cofounder";
import type { MemorySearchResultItem } from "@/types/memory";

export interface MockStoreState {
  user: User;
  projects: Project[];
  pipelineStatuses: Record<string, PipelineStatusResponse>;
  artifacts: {
    research: Record<string, ReportArtifact>;
    prd: Record<string, ReportArtifact>;
    roadmap: Record<string, ReportArtifact>;
    financials: Record<string, FinancialArtifact>;
    pitch: Record<string, PitchArtifact>;
    vc: Record<string, ReportArtifact>;
  };
  executionPlans: Record<string, ExecutionPlan>;
  cofounderHistory: Record<string, CofounderMessage[]>;
  memoryStates: Record<string, CofounderMemoryState>;
  memoryItems: Record<string, MemorySearchResultItem[]>;
  decisions: Record<string, DecisionMemoryItem[]>;
}
