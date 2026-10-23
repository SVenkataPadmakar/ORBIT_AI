/**
 * ORBIT v2 TypeScript Fetch Client — Type Definitions.
 * Generated from packages/shared/openapi.yaml.
 */

export interface ErrorEnvelope {
  code: string;
  message: string;
  details: Record<string, unknown>;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified?: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserResponse;
}

export interface OrgResponse {
  id: string;
  name: string;
  slug: string;
  billing_email: string;
  subscription_tier: string;
  created_at: string;
}

export interface CreateRunRequest {
  org_id: string;
  title: string;
  idea_raw: string;
}

export interface ClarificationAnswersRequest {
  answers: string[];
}

export interface RunSummaryResponse {
  run_id: string;
  title: string;
  status: 'intake' | 'awaiting_clarification' | 'scope_locked' | 'building' | 'verifying' | 'repaired' | 'completed' | 'failed';
  current_node: string;
  scope_locked: boolean;
  clarity_score?: number | null;
  created_at: string;
}

export interface RunDetailResponse {
  run_id: string;
  org_id: string;
  title: string;
  idea_raw: string;
  normalized_idea?: string | null;
  status: string;
  current_node: string;
  clarity_score?: number | null;
  scope_locked: boolean;
  repair_count: number;
  reproducibility_hash?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface SpecificationResponse {
  run_id: string;
  prd_markdown: string;
  scope_contract: {
    in_scope: string[];
    out_of_scope: string[];
    assumptions: string[];
  };
  architecture_spec?: Record<string, unknown> | null;
  version: number;
}

export interface ArtifactResponse {
  artifact_id: string;
  run_id: string;
  artifact_type: 'prd' | 'scope_contract' | 'openapi_spec' | 'db_schema' | 'ui_spec' | 'package_zip' | 'test_report' | 'threat_model';
  name: string;
  file_path: string;
  sha256: string;
  size_bytes: number;
  created_at: string;
}

export interface RepairResponse {
  repair_id: string;
  run_id: string;
  node: string;
  attempt_number: number;
  error_type: string;
  error_message?: string;
  diff_applied?: string | null;
  status: string;
  created_at: string;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}
