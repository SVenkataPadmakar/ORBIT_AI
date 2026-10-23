export type MemoryVaultType = "all" | "decision" | "product" | "technical" | "user" | "artifact";

export interface MemorySearchResultItem {
  id: string;
  text: string;
  similarity_score: number;
  vault_type: "decision" | "product" | "technical" | "user" | "artifact";
  title: string;
  category: string;
  tags: string[];
  metadata: Record<string, any>;
}

export interface MemorySearchRequest {
  query: string;
  vault_type?: MemoryVaultType;
  top_k?: number;
  min_similarity?: number;
}

export interface MemorySearchResponse {
  query: string;
  vault_type: string;
  results: MemorySearchResultItem[];
  total_found: number;
  retrieval_latency_ms: number;
}

export interface MemoryRecordRequest {
  vault_type: "decision" | "product" | "technical" | "user" | "artifact";
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface MemoryRecordResponse {
  id: string;
  project_id: string;
  vault_type: string;
  title: string;
  status: string;
  indexed_at: string;
}

export interface MemoryStatsResponse {
  project_id: string;
  total_chunks: number;
  vault_distribution: Record<string, number>;
  vector_dimensions: number;
  embedding_provider: string;
  storage_engine: string;
  health_status: string;
}

export interface MemoryReindexResponse {
  project_id: string;
  chunks_indexed: number;
  status: string;
  duration_ms: number;
  indexed_at: string;
}
