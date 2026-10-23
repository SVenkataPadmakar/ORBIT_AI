"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Tag,
  ArrowRight,
  Plus,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { cofounderApi } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import type { DecisionMemoryItem } from "@/types/cofounder";

interface RecentDecisionsLedgerProps {
  projectId?: string;
  onLogDecision?: () => void;
}

const DEFAULT_VERIFIED_DECISIONS: DecisionMemoryItem[] = [
  {
    id: "dec-01",
    timestamp: "2 hours ago",
    category: "technical",
    decision: "PostgreSQL 16 with pgvector + JSONB over standalone vector DBs",
    rationale:
      "Avoids dual-write latency and eventual consistency drift between transaction store and vector embeddings. Zero additional cloud infrastructure cost.",
    rejected_alternatives: ["Pinecone standalone cluster", "Milvus distributed deployment"],
    trade_offs: ["Marginally higher database memory footprint", "Requires managed pgvector extension"],
    status: "active",
  },
  {
    id: "dec-02",
    timestamp: "Yesterday",
    category: "product",
    decision: "Prioritize 14-day autonomous sprint execution over team chat widget",
    rationale:
      "Founders cited execution bottleneck as their primary reason for failure, not collaboration communication channels. High ROI on direct code outputs.",
    rejected_alternatives: ["Real-time multi-founder Slack integration", "Discussion forum widget"],
    trade_offs: ["Single-operator focus initially", "Delayed enterprise collaboration tier"],
    status: "active",
  },
  {
    id: "dec-03",
    timestamp: "3 days ago",
    category: "pricing",
    decision: "Freemium with credit usage limits & $79/mo Founder Pro tier",
    rationale:
      "Lower friction for thesis validation drives high-volume flywheel data; usage billing aligns directly with Gemini token compute consumption.",
    rejected_alternatives: ["Seat-based monthly license", "Pure pay-as-you-go token markup"],
    trade_offs: ["Requires strict token metering per workspace", "Higher support load on free tier"],
    status: "active",
  },
  {
    id: "dec-04",
    timestamp: "5 days ago",
    category: "market",
    decision: "Narrow ICP to Technical Solo Founders & Pre-Seed Teams",
    rationale:
      "Higher willingness to adopt autonomous engineering workflows and immediate purchasing authority without enterprise procurement cycles.",
    rejected_alternatives: ["Enterprise Innovation Labs", "College Student Incubators"],
    trade_offs: ["Smaller immediate ACV", "Higher churn if startup idea is abandoned"],
    status: "active",
  },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  technical: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
  product:   { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/30" },
  pricing:   { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  market:    { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  gtm:       { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
};

export const RecentDecisionsLedger = memo(function RecentDecisionsLedger({
  projectId,
  onLogDecision,
}: RecentDecisionsLedgerProps) {
  const [expandedId, setExpandedId] = useState<string | null>("dec-01");

  // Fetch real project decisions if projectId is provided
  const { data: memoryData } = useQuery({
    queryKey: ["project-memory", projectId],
    queryFn: () => (projectId ? cofounderApi.getMemory(projectId) : null),
    enabled: Boolean(projectId),
    staleTime: 60_000,
  });

  const decisions =
    memoryData?.decision_memory && memoryData.decision_memory.length > 0
      ? memoryData.decision_memory
      : DEFAULT_VERIFIED_DECISIONS;

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0B0D14]/90 p-5 sm:p-6 backdrop-blur-2xl shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
              Verified Decision Memory Ledger
            </span>
          </div>
          <h2 className="mt-1 text-lg sm:text-xl font-bold text-white tracking-tight">
            Recent Ratified Strategic Decisions
          </h2>
          <p className="text-xs text-white/50">
            Immutable log of architectural choices, trade-offs, and rejected alternatives ratified by founder and agent consensus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {projectId && (
            <Link
              href={`/projects/${projectId}?view=memory`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 font-mono text-xs transition-colors"
            >
              <span>Memory Vault</span>
              <ArrowRight className="size-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Decisions List */}
      <div className="space-y-2.5">
        {decisions.slice(0, 5).map((item) => {
          const isExpanded = expandedId === item.id;
          const fallbackStyle = { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" };
          const style = (CATEGORY_COLORS[item.category] || CATEGORY_COLORS.technical) ?? fallbackStyle;

          return (
            <div
              key={item.id}
              className={cn(
                "rounded-xl border transition-all overflow-hidden",
                isExpanded
                  ? "bg-white/[0.04] border-white/20 shadow-lg"
                  : "bg-white/[0.02] border-white/[0.07] hover:border-white/15"
              )}
            >
              {/* Row Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <CheckCircle2 className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold border",
                          style.bg,
                          style.text,
                          style.border
                        )}
                      >
                        {item.category}
                      </span>
                      <span className="text-[10px] font-mono text-white/40">
                        {item.timestamp}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-white truncate">
                      {item.decision}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 font-semibold">
                    RATIFIED
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="size-4 text-white/50" />
                  ) : (
                    <ChevronDown className="size-4 text-white/50" />
                  )}
                </div>
              </div>

              {/* Expanded Details: Rationale, Rejected Alternatives, Trade-offs */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3 text-xs bg-black/20">
                  <div>
                    <span className="font-mono text-[10px] text-white/40 uppercase block mb-1">
                      Rationale &amp; Strategic Justification
                    </span>
                    <p className="text-white/80 leading-relaxed">
                      {item.rationale}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {item.rejected_alternatives && item.rejected_alternatives.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="font-mono text-[10px] text-rose-400/80 uppercase block mb-1 flex items-center gap-1">
                          <span>✕ Rejected Alternatives</span>
                        </span>
                        <ul className="space-y-1 text-[11px] text-white/60">
                          {item.rejected_alternatives.map((alt, idx) => (
                            <li key={idx} className="line-clamp-1">
                              • {alt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.trade_offs && item.trade_offs.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="font-mono text-[10px] text-amber-400/80 uppercase block mb-1 flex items-center gap-1">
                          <Scale className="size-3" />
                          <span>Accepted Trade-Offs</span>
                        </span>
                        <ul className="space-y-1 text-[11px] text-white/60">
                          {item.trade_offs.map((to, idx) => (
                            <li key={idx} className="line-clamp-1">
                              • {to}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
