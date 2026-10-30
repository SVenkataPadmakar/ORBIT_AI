/**
 * apps/frontend/lib/mocks/data/memory.mock.ts
 * Vector memory items, semantic search simulator, and stats.
 */
import type {
  MemorySearchResultItem,
  MemorySearchRequest,
  MemorySearchResponse,
  MemoryRecordRequest,
  MemoryRecordResponse,
  MemoryStatsResponse,
  MemoryReindexResponse,
} from "@/types/memory";

export const INITIAL_MOCK_MEMORY_ITEMS: Record<string, MemorySearchResultItem[]> = {
  "startup-1": [
    {
      id: "mem-1",
      title: "Clinic Coordinator Triage Friction",
      text: "Outpatient coordinators report losing 4+ hours weekly reconciling uncoordinated patient handoffs between front-desk chat and clinical charts.",
      similarity_score: 0.94,
      vault_type: "product",
      category: "user_pain",
      tags: ["coordination", "friction", "intake"],
      metadata: { source: "coordinator_interviews", date: "2026-10-15" },
    },
    {
      id: "mem-2",
      title: "Architecture Choice: Next.js Mock Layer",
      text: "Decided to adopt Next.js 15 App Router with a client-side mock layer for instant UI performance and offline reliability.",
      similarity_score: 0.89,
      vault_type: "technical",
      category: "architecture",
      tags: ["frontend", "nextjs", "mocks"],
      metadata: { author: "Alex Vance", status: "implemented" },
    },
    {
      id: "mem-3",
      title: "Pricing Model: $499/mo Clinic Pro Tier",
      text: "Targeting outpatient group practices with 3-10 providers. 5.2x LTV:CAC with 18-month projected runway.",
      similarity_score: 0.86,
      vault_type: "decision",
      category: "finance",
      tags: ["pricing", "ltv_cac", "runway"],
      metadata: { approved_by: "Founder & Investor Council" },
    },
  ],
};

export function getMockMemorySearch(projectId: string, req: MemorySearchRequest): MemorySearchResponse {
  const items = INITIAL_MOCK_MEMORY_ITEMS[projectId] || INITIAL_MOCK_MEMORY_ITEMS["startup-1"] || [];
  const query = req.query.toLowerCase();
  
  const filtered = items.filter((item) => {
    if (req.vault_type && req.vault_type !== "all" && item.vault_type !== req.vault_type) {
      return false;
    }
    return (
      item.title.toLowerCase().includes(query) ||
      item.text.toLowerCase().includes(query) ||
      item.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  const results = filtered.length > 0 ? filtered : items.slice(0, 3);

  return {
    query: req.query,
    vault_type: req.vault_type || "all",
    results: results.slice(0, req.top_k || 5),
    total_found: results.length,
    retrieval_latency_ms: 12,
  };
}

export function getMockMemoryStats(projectId: string): MemoryStatsResponse {
  return {
    project_id: projectId,
    total_chunks: 142,
    vault_distribution: {
      decision: 34,
      product: 48,
      technical: 26,
      user: 22,
      artifact: 12,
    },
    vector_dimensions: 1536,
    embedding_provider: "client-side-embeddings",
    storage_engine: "indexed-db-hybrid",
    health_status: "optimal",
  };
}

export function getMockMemoryReindex(projectId: string): MemoryReindexResponse {
  return {
    project_id: projectId,
    chunks_indexed: 142,
    status: "success",
    duration_ms: 48,
    indexed_at: new Date().toISOString(),
  };
}

export function createMockMemoryRecord(projectId: string, data: MemoryRecordRequest): MemoryRecordResponse {
  return {
    id: `mem-${Date.now()}`,
    project_id: projectId,
    vault_type: data.vault_type,
    title: data.title,
    status: "indexed",
    indexed_at: new Date().toISOString(),
  };
}
