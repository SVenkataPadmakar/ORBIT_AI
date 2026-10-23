/**
 * ORBIT v2 TypeScript Fetch Client — API Client Implementation.
 * Provides typed methods for all OpenAPI 3.1 endpoints.
 */
import type {
  AuthResponse,
  CheckoutResponse,
  ClarificationAnswersRequest,
  CreateRunRequest,
  ErrorEnvelope,
  OrgResponse,
  RepairResponse,
  RunDetailResponse,
  RunSummaryResponse,
  SpecificationResponse,
  UserResponse,
} from './types';

export class OrbitApiError extends Error {
  public readonly code: string;
  public readonly details: Record<string, unknown>;
  public readonly status: number;

  constructor(status: number, envelope: ErrorEnvelope) {
    super(envelope.message);
    this.name = 'OrbitApiError';
    this.status = status;
    this.code = envelope.code;
    this.details = envelope.details;
  }
}

export interface OrbitClientConfig {
  baseUrl?: string;
  accessToken?: string | (() => Promise<string | null> | string | null);
}

export class OrbitApiClient {
  private readonly baseUrl: string;
  private readonly getAccessToken?: () => Promise<string | null> | string | null;

  constructor(config: OrbitClientConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:8000';
    if (typeof config.accessToken === 'function') {
      this.getAccessToken = config.accessToken;
    } else if (config.accessToken) {
      this.getAccessToken = () => config.accessToken as string;
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.getAccessToken && !headers.has('Authorization')) {
      const token = await this.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorEnvelope: ErrorEnvelope;
      try {
        errorEnvelope = await response.json();
      } catch {
        errorEnvelope = {
          code: 'HTTP_ERROR',
          message: response.statusText || `Request failed with status ${response.status}`,
          details: {},
        };
      }
      throw new OrbitApiError(response.status, errorEnvelope);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/zip')) {
      return (await response.blob()) as unknown as T;
    }

    return response.json();
  }

  // ─── AUTH METHODS ─────────────────────────────────────────────────────────
  public async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async refresh(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/v1/auth/refresh', {
      method: 'POST',
    });
  }

  public async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/v1/auth/logout', {
      method: 'POST',
    });
  }

  public async getCurrentUser(): Promise<UserResponse> {
    return this.request<UserResponse>('/api/v1/auth/me');
  }

  // ─── ORGS METHODS ─────────────────────────────────────────────────────────
  public async listOrgs(): Promise<OrgResponse[]> {
    return this.request<OrgResponse[]>('/api/v1/orgs');
  }

  public async getOrg(orgId: string): Promise<OrgResponse> {
    return this.request<OrgResponse>(`/api/v1/orgs/${orgId}`);
  }

  // ─── RUNS METHODS ─────────────────────────────────────────────────────────
  public async listRuns(orgId: string): Promise<RunSummaryResponse[]> {
    return this.request<RunSummaryResponse[]>(`/api/v1/runs?org_id=${encodeURIComponent(orgId)}`);
  }

  public async createRun(payload: CreateRunRequest): Promise<RunDetailResponse> {
    return this.request<RunDetailResponse>('/api/v1/runs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getRun(runId: string): Promise<RunDetailResponse> {
    return this.request<RunDetailResponse>(`/api/v1/runs/${runId}`);
  }

  public async submitClarification(runId: string, payload: ClarificationAnswersRequest): Promise<RunDetailResponse> {
    return this.request<RunDetailResponse>(`/api/v1/runs/${runId}/clarify`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getRunSpecification(runId: string): Promise<SpecificationResponse> {
    return this.request<SpecificationResponse>(`/api/v1/runs/${runId}/spec`);
  }

  public async listRepairs(runId: string): Promise<RepairResponse[]> {
    return this.request<RepairResponse[]>(`/api/v1/runs/${runId}/repairs`);
  }

  // ─── CHECKOUT & EXPORT METHODS ────────────────────────────────────────────
  public async createCheckout(runId: string): Promise<CheckoutResponse> {
    return this.request<CheckoutResponse>(`/api/v1/runs/${runId}/checkout`, {
      method: 'POST',
    });
  }

  public getExportUrl(runId: string, token: string): string {
    return `${this.baseUrl}/api/v1/runs/${runId}/export?token=${encodeURIComponent(token)}`;
  }

  public async downloadExport(runId: string, token: string): Promise<Blob> {
    return this.request<Blob>(`/api/v1/runs/${runId}/export?token=${encodeURIComponent(token)}`);
  }
}
