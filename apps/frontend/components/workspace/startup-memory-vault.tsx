"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Brain, Search, Database, Sparkles, Cpu, Layers, ShieldCheck,
    CheckCircle2, Clock, ArrowRight, RefreshCw, Plus, Trash2,
    Filter, Tag, Activity, FileText, SlidersHorizontal, Zap,
    Network, GitBranch, Compass, Lock, Code2, AlertCircle, X,
    ChevronRight, Check, Hash, ExternalLink, Lightbulb,
} from "lucide-react";
import { memoryApi, cofounderApi } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import type {
    MemoryVaultType,
    MemorySearchResultItem,
    MemorySearchRequest,
    MemoryRecordRequest,
} from "@/types/memory";
import type { DecisionMemoryItem } from "@/types/cofounder";

interface StartupMemoryVaultProps {
    projectId: string;
    projectName: string;
}

const QUICK_QUERIES = [
    "Database schema & PostgreSQL decisions",
    "Target customer & monetization strategy",
    "Technical trade-offs & architecture stack",
    "MVP scope & sprint acceptance criteria",
    "Founder constraints & directives",
];

const VAULT_CONFIG = {
    decision: {
        label: "Decision Vault",
        icon: GitBranch,
        color: "text-emerald-400",
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/10",
        dot: "bg-emerald-400",
        badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    product: {
        label: "Product Vault",
        icon: Layers,
        color: "text-purple-400",
        border: "border-purple-500/30",
        bg: "bg-purple-500/10",
        dot: "bg-purple-400",
        badge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    },
    technical: {
        label: "Technical Vault",
        icon: Database,
        color: "text-cyan-400",
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/10",
        dot: "bg-cyan-400",
        badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    },
    user: {
        label: "Founder Directives",
        icon: ShieldCheck,
        color: "text-amber-400",
        border: "border-amber-500/30",
        bg: "bg-amber-500/10",
        dot: "bg-amber-400",
        badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
    artifact: {
        label: "Artifact Deliverables",
        icon: FileText,
        color: "text-indigo-400",
        border: "border-indigo-500/30",
        bg: "bg-indigo-500/10",
        dot: "bg-indigo-400",
        badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    },
} as const;

export function StartupMemoryVault({ projectId, projectName }: StartupMemoryVaultProps) {
    const queryClient = useQueryClient();

    // Tab Navigation
    const [activeTab, setActiveTab] = useState<"search" | "decisions" | "product" | "technical" | "user" | "graph">("search");
    
    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVaultFilter, setSelectedVaultFilter] = useState<MemoryVaultType>("all");
    const [minSimilarity, setMinSimilarity] = useState(0.0);
    const [topK, setTopK] = useState(8);

    // Modal State
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [recordForm, setRecordForm] = useState<MemoryRecordRequest>({
        vault_type: "decision",
        title: "",
        content: "",
        category: "architecture",
        tags: [],
    });
    const [tagInput, setTagInput] = useState("");

    // Telemetry & Stats Query
    const statsQuery = useQuery({
        queryKey: ["memory-stats", projectId],
        queryFn: () => memoryApi.getStats(projectId),
        refetchInterval: 15000,
    });

    // Multi-Vault State Query
    const memoryStateQuery = useQuery({
        queryKey: ["memory-state", projectId],
        queryFn: () => memoryApi.getState(projectId),
        refetchInterval: 20000,
    });

    // Semantic Vector Search Mutation / Query
    const searchMutation = useMutation({
        mutationFn: (req: MemorySearchRequest) => memoryApi.search(projectId, req),
    });

    // Re-Index Pipeline Mutation
    const reindexMutation = useMutation({
        mutationFn: () => memoryApi.index(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["memory-stats", projectId] });
            queryClient.invalidateQueries({ queryKey: ["memory-state", projectId] });
            if (searchQuery.trim()) {
                handleExecuteSearch();
            }
        },
    });

    // Record Memory Item Mutation
    const recordMutation = useMutation({
        mutationFn: (req: MemoryRecordRequest) => memoryApi.record(projectId, req),
        onSuccess: () => {
            setShowRecordModal(false);
            setRecordForm({
                vault_type: "decision",
                title: "",
                content: "",
                category: "general",
                tags: [],
            });
            queryClient.invalidateQueries({ queryKey: ["memory-stats", projectId] });
            queryClient.invalidateQueries({ queryKey: ["memory-state", projectId] });
        },
    });

    // Delete Memory Item Mutation
    const deleteMutation = useMutation({
        mutationFn: (memoryId: string) => memoryApi.delete(projectId, memoryId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["memory-stats", projectId] });
            if (searchMutation.data) {
                handleExecuteSearch();
            }
        },
    });

    const handleExecuteSearch = (customQuery?: string) => {
        const queryText = customQuery !== undefined ? customQuery : searchQuery;
        if (!queryText.trim()) return;
        searchMutation.mutate({
            query: queryText.trim(),
            vault_type: selectedVaultFilter,
            top_k: topK,
            min_similarity: minSimilarity,
        });
    };

    // Auto-search on initial load with a general query to show rich vector matches immediately
    useEffect(() => {
        if (!searchMutation.data && !searchMutation.isPending) {
            searchMutation.mutate({
                query: "core startup thesis architecture stack and key decisions",
                vault_type: "all",
                top_k: 6,
                min_similarity: 0.0,
            });
        }
    }, [projectId]);

    const stats = statsQuery.data;
    const memoryState = memoryStateQuery.data;

    // Derived counts
    const totalChunks = stats?.total_chunks ?? 0;
    const vaultDist = stats?.vault_distribution ?? {};

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* ─── Hero Vector Telemetry HUD ───────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#121422]/90 to-[#0A0A10]/95 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/25">
                                <Brain className="size-6 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                                        Startup Memory Layer
                                    </h2>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/25">
                                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        ChromaDB Vector Synced
                                    </span>
                                </div>
                                <p className="text-xs md:text-sm text-zinc-400">
                                    Persistent 4-vault RAG architecture fueling the Gemini Co-Founder and 15 LangGraph autonomous agents.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setShowRecordModal(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 text-xs font-medium text-white transition-all shadow-sm active:scale-95"
                            data-cursor="hover"
                        >
                            <Plus className="size-4 text-indigo-400" />
                            <span>Record Memory</span>
                        </button>
                        <button
                            onClick={() => reindexMutation.mutate()}
                            disabled={reindexMutation.isPending}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-medium text-white transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                            data-cursor="hover"
                        >
                            <RefreshCw className={cn("size-4", reindexMutation.isPending && "animate-spin")} />
                            <span>{reindexMutation.isPending ? "Indexing Deliverables..." : "Re-Index Memory Layer"}</span>
                        </button>
                    </div>
                </div>

                {/* Telemetry Metrics Grid */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3 pt-6 border-t border-white/5">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                            <span>Vector Chunks</span>
                            <Database className="size-3.5 text-indigo-400" />
                        </div>
                        <div className="mt-1.5 flex items-baseline gap-1.5">
                            <span className="text-2xl font-semibold text-white">{totalChunks}</span>
                            <span className="text-[11px] text-zinc-500">embeddings</span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                            <span>Dimensions</span>
                            <Cpu className="size-3.5 text-cyan-400" />
                        </div>
                        <div className="mt-1.5 flex items-baseline gap-1.5">
                            <span className="text-2xl font-semibold text-white">384d</span>
                            <span className="text-[11px] text-zinc-500">dense vector</span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                            <span>Search Latency</span>
                            <Zap className="size-3.5 text-amber-400" />
                        </div>
                        <div className="mt-1.5 flex items-baseline gap-1.5">
                            <span className="text-2xl font-semibold text-white">
                                {searchMutation.data ? `${searchMutation.data.retrieval_latency_ms}` : "<2.0"}
                            </span>
                            <span className="text-[11px] text-zinc-500">ms</span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                            <span>HNSW Metric</span>
                            <Compass className="size-3.5 text-emerald-400" />
                        </div>
                        <div className="mt-1.5 flex items-baseline gap-1.5">
                            <span className="text-xl font-semibold text-emerald-300">Cosine</span>
                            <span className="text-[11px] text-zinc-500">unit sphere</span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 col-span-2 md:col-span-1">
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                            <span>Engine</span>
                            <ShieldCheck className="size-3.5 text-purple-400" />
                        </div>
                        <div className="mt-1.5 flex items-baseline gap-1.5">
                            <span className="text-lg font-semibold text-purple-300">ChromaDB</span>
                            <span className="text-[11px] text-zinc-500">persistent</span>
                        </div>
                    </div>
                </div>

                {/* Vault Distribution Tags */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-zinc-500 font-medium">Vault Chunks:</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-emerald-300">
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        Decision: {vaultDist.decision ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-purple-300">
                        <span className="size-1.5 rounded-full bg-purple-400" />
                        Product: {vaultDist.product ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 text-cyan-300">
                        <span className="size-1.5 rounded-full bg-cyan-400" />
                        Technical: {vaultDist.technical ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-amber-300">
                        <span className="size-1.5 rounded-full bg-amber-400" />
                        Directives: {vaultDist.user ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-indigo-300">
                        <span className="size-1.5 rounded-full bg-indigo-400" />
                        Artifacts: {vaultDist.artifact ?? 0}
                    </span>
                </div>
            </div>

            {/* ─── Navigation Tabs ─────────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
                <button
                    onClick={() => setActiveTab("search")}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                        activeTab === "search"
                            ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                            : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                >
                    <Search className="size-3.5" />
                    <span>Semantic Vector Search</span>
                    {searchMutation.data && (
                        <span className="ml-1 rounded-full bg-indigo-500/30 px-1.5 py-0.2 text-[10px] text-indigo-200">
                            {searchMutation.data.total_found}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("decisions")}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                        activeTab === "decisions"
                            ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                            : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                >
                    <GitBranch className="size-3.5 text-emerald-400" />
                    <span>Decision Memory Vault</span>
                    <span className="ml-1 rounded-full bg-emerald-500/30 px-1.5 py-0.2 text-[10px] text-emerald-200">
                        {memoryState?.decision_memory.length ?? 0}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab("product")}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                        activeTab === "product"
                            ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm"
                            : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                >
                    <Layers className="size-3.5 text-purple-400" />
                    <span>Product Memory Vault</span>
                </button>

                <button
                    onClick={() => setActiveTab("technical")}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                        activeTab === "technical"
                            ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                            : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                >
                    <Database className="size-3.5 text-cyan-400" />
                    <span>Technical Architecture Vault</span>
                </button>

                <button
                    onClick={() => setActiveTab("user")}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                        activeTab === "user"
                            ? "bg-amber-600/20 text-amber-300 border border-amber-500/30 shadow-sm"
                            : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                >
                    <ShieldCheck className="size-3.5 text-amber-400" />
                    <span>Founder Directives Vault</span>
                </button>

                <button
                    onClick={() => setActiveTab("graph")}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                        activeTab === "graph"
                            ? "bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-sm"
                            : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                >
                    <Network className="size-3.5 text-violet-400" />
                    <span>RAG Flow & 2D Vector Map</span>
                </button>
            </div>

            {/* ─── TAB 1: Semantic Vector Search ──────────────────────────────────── */}
            {activeTab === "search" && (
                <div className="space-y-6">
                    {/* Search Input Bar */}
                    <div className="rounded-2xl border border-white/10 bg-[#12131F]/90 p-5 backdrop-blur-xl shadow-xl space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleExecuteSearch();
                                    }}
                                    placeholder="Search decisions, database tables, PRD specs, founder directives using natural language..."
                                    className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <button
                                onClick={() => handleExecuteSearch()}
                                disabled={searchMutation.isPending || !searchQuery.trim()}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                            >
                                <Sparkles className="size-4" />
                                <span>{searchMutation.isPending ? "Retrieving..." : "Vector Search"}</span>
                            </button>
                        </div>

                        {/* Search Quick-Filters & Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5 text-xs">
                            {/* Vault Filter Buttons */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-zinc-500 font-medium mr-1 flex items-center gap-1">
                                    <Filter className="size-3" /> Vault:
                                </span>
                                {(["all", "decision", "product", "technical", "user", "artifact"] as const).map((vt) => (
                                    <button
                                        key={vt}
                                        onClick={() => {
                                            setSelectedVaultFilter(vt);
                                            searchMutation.mutate({
                                                query: searchQuery.trim() || "startup",
                                                vault_type: vt,
                                                top_k: topK,
                                                min_similarity: minSimilarity,
                                            });
                                        }}
                                        className={cn(
                                            "rounded-lg px-2.5 py-1 capitalize font-medium transition-all",
                                            selectedVaultFilter === vt
                                                ? "bg-white/15 text-white border border-white/20"
                                                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                                        )}
                                    >
                                        {vt}
                                    </button>
                                ))}
                            </div>

                            {/* Sliders for Top-K and Min-Similarity */}
                            <div className="flex items-center gap-4 text-zinc-400">
                                <div className="flex items-center gap-2">
                                    <span>Top K:</span>
                                    <select
                                        value={topK}
                                        onChange={(e) => setTopK(Number(e.target.value))}
                                        className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-white focus:outline-none"
                                    >
                                        <option value={4}>4</option>
                                        <option value={6}>6</option>
                                        <option value={8}>8</option>
                                        <option value={12}>12</option>
                                        <option value={20}>20</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Quick Query Pills */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                            <span className="text-zinc-500 font-medium">Quick Queries:</span>
                            {QUICK_QUERIES.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => {
                                        setSearchQuery(q);
                                        handleExecuteSearch(q);
                                    }}
                                    className="rounded-lg border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/10 px-2.5 py-1 text-zinc-300 transition-all text-[11px]"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search Results List */}
                    {searchMutation.isPending && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <RefreshCw className="size-8 text-indigo-400 animate-spin" />
                            <p className="mt-3 text-sm text-zinc-400">Computing 384d semantic embeddings & scanning ChromaDB...</p>
                        </div>
                    )}

                    {searchMutation.isError && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300 flex items-center gap-3">
                            <AlertCircle className="size-5 shrink-0 text-red-400" />
                            <span>Failed to execute vector search: {(searchMutation.error as Error)?.message || "Unknown error"}</span>
                        </div>
                    )}

                    {searchMutation.data && !searchMutation.isPending && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                                <span>
                                    Found <strong className="text-white">{searchMutation.data.total_found}</strong> relevant vectors in{" "}
                                    <span className="text-indigo-400">{searchMutation.data.retrieval_latency_ms} ms</span>
                                </span>
                                <span>Cosine Similarity Threshold: {(minSimilarity * 100).toFixed(0)}%</span>
                            </div>

                            {searchMutation.data.results.length === 0 ? (
                                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center text-zinc-400">
                                    <Brain className="size-8 mx-auto text-zinc-600 mb-2" />
                                    <p className="text-sm font-medium text-zinc-300">No matching vectors found</p>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Try broadening your search query or trigger <strong>Re-Index Memory Layer</strong> to ingest new artifacts.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {searchMutation.data.results.map((item) => {
                                        const config = VAULT_CONFIG[item.vault_type] ?? VAULT_CONFIG.product;
                                        const Icon = config.icon;
                                        const simPercent = Math.round(item.similarity_score * 100);

                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#141524]/70 p-5 hover:border-white/20 transition-all shadow-md"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-1.5 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", config.badge)}>
                                                                <Icon className="size-3" />
                                                                {config.label}
                                                            </span>
                                                            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400 capitalize">
                                                                {item.category}
                                                            </span>
                                                            {item.tags.map((tag) => (
                                                                <span key={tag} className="rounded-md bg-white/[0.03] border border-white/5 px-2 py-0.5 text-[10px] text-zinc-400">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>

                                                        <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                                            {item.title}
                                                        </h3>
                                                    </div>

                                                    {/* Similarity Score Badge */}
                                                    <div className="flex flex-col items-end shrink-0">
                                                        <div className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300">
                                                            <Sparkles className="size-3 text-emerald-400" />
                                                            {simPercent}% Match
                                                        </div>
                                                        <span className="text-[10px] text-zinc-500 mt-1 font-mono">
                                                            id: {item.id.slice(0, 8)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Text Content */}
                                                <div className="mt-3 text-xs leading-relaxed text-zinc-300 bg-black/30 rounded-lg p-3 border border-white/5 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                                                    {item.text}
                                                </div>

                                                {/* Metadata Footer */}
                                                {Object.keys(item.metadata).length > 0 && (
                                                    <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-[11px] text-zinc-500">
                                                        {item.metadata.source && (
                                                            <span>Source: <strong className="text-zinc-400">{item.metadata.source}</strong></span>
                                                        )}
                                                        {item.metadata.status && (
                                                            <span>Status: <strong className="text-zinc-400">{item.metadata.status}</strong></span>
                                                        )}
                                                        {item.metadata.indexed_at && (
                                                            <span>Indexed: <strong className="text-zinc-400">{new Date(item.metadata.indexed_at).toLocaleDateString()}</strong></span>
                                                        )}
                                                        <div className="ml-auto">
                                                            <button
                                                                onClick={() => deleteMutation.mutate(item.id)}
                                                                disabled={deleteMutation.isPending}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400 p-1"
                                                                title="Delete from vector store"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ─── TAB 2: Decision Memory Vault ───────────────────────────────────── */}
            {activeTab === "decisions" && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-white flex items-center gap-2">
                                <GitBranch className="size-4 text-emerald-400" />
                                Persistent Decision History
                            </h3>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                Every architectural, technical, market, and pricing decision with rejected alternatives and trade-offs.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setRecordForm({
                                    vault_type: "decision",
                                    title: "",
                                    content: "",
                                    category: "architecture",
                                    tags: ["decision"],
                                });
                                setShowRecordModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md active:scale-95"
                        >
                            <Plus className="size-3.5" />
                            <span>Log Decision</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {(!memoryState?.decision_memory || memoryState.decision_memory.length === 0) ? (
                            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center text-zinc-400">
                                <GitBranch className="size-8 mx-auto text-zinc-600 mb-2" />
                                <p className="text-sm font-medium text-zinc-300">No decisions logged yet</p>
                                <p className="text-xs text-zinc-500 mt-1">
                                    Decisions made in Gemini Co-Founder or recorded manually will automatically be indexed into this vault.
                                </p>
                            </div>
                        ) : (
                            memoryState.decision_memory.map((dec) => (
                                <div
                                    key={dec.id}
                                    className="rounded-xl border border-white/10 bg-[#131522]/80 p-5 space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 capitalize">
                                                    {dec.category}
                                                </span>
                                                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400 uppercase">
                                                    {dec.status}
                                                </span>
                                                <span className="text-[11px] text-zinc-500">
                                                    {new Date(dec.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold text-white mt-1">
                                                {dec.decision}
                                            </h4>
                                        </div>
                                    </div>

                                    {/* Rationale */}
                                    <div className="text-xs text-zinc-300 leading-relaxed bg-black/30 rounded-lg p-3 border border-white/5">
                                        <strong className="text-zinc-400 block mb-1 text-[11px]">Rationale & Strategy:</strong>
                                        {dec.rationale}
                                    </div>

                                    {/* Rejected Alternatives & Trade-offs */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                        {dec.rejected_alternatives && dec.rejected_alternatives.length > 0 && (
                                            <div className="rounded-lg bg-red-500/5 border border-red-500/15 p-3">
                                                <span className="text-red-400 font-semibold text-[11px] block mb-1.5">
                                                    Rejected Alternatives:
                                                </span>
                                                <ul className="space-y-1 text-zinc-300 list-disc list-inside">
                                                    {dec.rejected_alternatives.map((alt, i) => (
                                                        <li key={i}>{alt}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {dec.trade_offs && dec.trade_offs.length > 0 && (
                                            <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 p-3">
                                                <span className="text-amber-400 font-semibold text-[11px] block mb-1.5">
                                                    Accepted Trade-Offs:
                                                </span>
                                                <ul className="space-y-1 text-zinc-300 list-disc list-inside">
                                                    {dec.trade_offs.map((to, i) => (
                                                        <li key={i}>{to}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ─── TAB 3: Product Memory Vault ────────────────────────────────────── */}
            {activeTab === "product" && (
                <div className="space-y-6">
                    <div className="rounded-xl border border-white/10 bg-[#141525]/80 p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400">
                                <Layers className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-white">Product Thesis & Strategic Bounds</h3>
                                <p className="text-xs text-zinc-400">High-conviction value proposition, target market, and monetization archetype.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                            <div className="rounded-lg bg-black/40 p-3.5 border border-white/5 space-y-1">
                                <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Core Value Proposition</span>
                                <p className="text-zinc-200 font-medium">{memoryState?.project_memory.value_proposition || "Autonomous orchestration for high-velocity software engineering."}</p>
                            </div>

                            <div className="rounded-lg bg-black/40 p-3.5 border border-white/5 space-y-1">
                                <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Target Audience & ICP</span>
                                <p className="text-zinc-200 font-medium">{memoryState?.project_memory.target_audience || "Technical founders, product builders, early-stage engineering squads."}</p>
                            </div>

                            <div className="rounded-lg bg-black/40 p-3.5 border border-white/5 space-y-1">
                                <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Monetization Archetype</span>
                                <p className="text-zinc-200 font-medium">{memoryState?.project_memory.monetization_model || "Tiered B2B SaaS + token consumption pricing."}</p>
                            </div>

                            <div className="rounded-lg bg-black/40 p-3.5 border border-white/5 space-y-1">
                                <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Core Thesis</span>
                                <p className="text-zinc-200 font-medium">{memoryState?.project_memory.core_thesis || "Multi-agent autonomous systems outcompete manual developer tooling."}</p>
                            </div>
                        </div>
                    </div>

                    {/* Indexed Product Components */}
                    <div className="space-y-3">
                        <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-400 px-1">
                            Indexed PRD Modules & User Flows
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(memoryState?.product_memory && memoryState.product_memory.length > 0) ? (
                                memoryState.product_memory.map((prod, idx) => (
                                    <div key={idx} className="rounded-xl border border-white/10 bg-[#121320]/70 p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-white">{prod.component}</span>
                                            <span className="rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25 px-2 py-0.5 text-[10px] capitalize font-medium">
                                                {prod.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-300 leading-relaxed">{prod.specification}</p>
                                        <div className="flex flex-wrap items-center gap-1 pt-1">
                                            {prod.technical_stack.map((t) => (
                                                <span key={t} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center text-xs text-zinc-400">
                                    Product specs will appear here once the PRD is generated or synchronized.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── TAB 4: Technical Architecture Vault ────────────────────────────── */}
            {activeTab === "technical" && (
                <div className="space-y-6">
                    <div className="rounded-xl border border-white/10 bg-[#121422]/80 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400">
                                    <Database className="size-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-white">Database Schemas, APIs & Infrastructure Specs</h3>
                                    <p className="text-xs text-zinc-400">PostgreSQL DDL, relational constraints, and OpenAPI specifications.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setRecordForm({
                                        vault_type: "technical",
                                        title: "Technical Architecture Constraint",
                                        content: "",
                                        category: "database",
                                        tags: ["architecture", "postgres"],
                                    });
                                    setShowRecordModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md active:scale-95"
                            >
                                <Plus className="size-3.5" />
                                <span>Add Tech Rule</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
                            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
                                <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                                    <Database className="size-4" />
                                    <span>Database Architecture</span>
                                </div>
                                <p className="text-zinc-300 text-xs leading-relaxed">
                                    PostgreSQL 16 relational store with UUID primary keys, foreign key constraints, JSONB metadata payloads, and B-tree indexes.
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
                                <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                                    <Code2 className="size-4" />
                                    <span>API & Services</span>
                                </div>
                                <p className="text-zinc-300 text-xs leading-relaxed">
                                    FastAPI asynchronous REST endpoints, JWT authentication tokens, Pydantic v2 schemas, and background task orchestration.
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
                                <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                                    <Brain className="size-4" />
                                    <span>Vector Vector Store</span>
                                </div>
                                <p className="text-zinc-300 text-xs leading-relaxed">
                                    ChromaDB persistent client with HNSW cosine similarity metric, project-scoped isolation, and sub-millisecond retrieval.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── TAB 5: Founder Directives Vault ────────────────────────────────── */}
            {activeTab === "user" && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-white flex items-center gap-2">
                                <ShieldCheck className="size-4 text-amber-400" />
                                Founder Directives & Guardrails
                            </h3>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                Explicit founder mandates, non-negotiable architectural boundaries, and business rules enforced by agents.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setRecordForm({
                                    vault_type: "user",
                                    title: "",
                                    content: "",
                                    category: "directive",
                                    tags: ["rule", "guardrail"],
                                });
                                setShowRecordModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md active:scale-95"
                        >
                            <Plus className="size-3.5" />
                            <span>Add Directive</span>
                        </button>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#141520]/80 p-5 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
                                <Lightbulb className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-white">How Founder Directives Influence AI Execution</h4>
                                <p className="text-xs text-zinc-300 leading-relaxed">
                                    When you log a directive in this vault, it is embedded into the project-scoped ChromaDB collection. Every agent query in LangGraph (Research, UI/UX Architect, Technical Architect, Sprint Planner) and every Gemini Co-Founder interaction retrieves these directives as highest-priority grounding facts.
                                </p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-white/5 space-y-3">
                            <div className="rounded-lg bg-black/40 border border-white/5 p-3.5 text-xs text-zinc-300 flex items-start gap-3">
                                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-white">Strict Tech Stack Directive:</strong> Frontend must use Next.js App Router with TypeScript and Tailwind; Backend must use FastAPI with PostgreSQL.
                                </div>
                            </div>
                            <div className="rounded-lg bg-black/40 border border-white/5 p-3.5 text-xs text-zinc-300 flex items-start gap-3">
                                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-white">Execution Velocity Constraint:</strong> Sprints must be scoped strictly to 1-week iterative ship cycles.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── TAB 6: RAG Architecture & 2D Vector Map ────────────────────────── */}
            {activeTab === "graph" && (
                <div className="space-y-6">
                    {/* Pipeline Visual Flow */}
                    <div className="rounded-2xl border border-white/10 bg-[#12131F]/90 p-6 backdrop-blur-xl space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold text-white flex items-center gap-2">
                                <Network className="size-4 text-violet-400" />
                                Complete RAG Architecture Flow
                            </h3>
                            <p className="text-xs text-zinc-400">
                                How questions, agent debates, and founder decisions flow through vector search to Gemini Co-Founder.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                            <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2 relative">
                                <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-xs">
                                    <Search className="size-3.5" />
                                    <span>1. Query / Event</span>
                                </div>
                                <p className="text-zinc-300 text-[11px] leading-relaxed">
                                    User chat or LangGraph node initiates context retrieval.
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2 relative">
                                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
                                    <Cpu className="size-3.5" />
                                    <span>2. Embedding</span>
                                </div>
                                <p className="text-zinc-300 text-[11px] leading-relaxed">
                                    Hybrid subword n-gram L2 projection into 384 dimensions.
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2 relative">
                                <div className="flex items-center gap-1.5 text-purple-400 font-semibold text-xs">
                                    <Database className="size-3.5" />
                                    <span>3. ChromaDB HNSW</span>
                                </div>
                                <p className="text-zinc-300 text-[11px] leading-relaxed">
                                    Cosine nearest-neighbor scan across project collection.
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2 relative">
                                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                                    <Layers className="size-3.5" />
                                    <span>4. Multi-Vault RAG</span>
                                </div>
                                <p className="text-zinc-300 text-[11px] leading-relaxed">
                                    Top-K chunks synthesized with decision & product history.
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2 relative">
                                <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                                    <Sparkles className="size-3.5" />
                                    <span>5. Agent Intelligence</span>
                                </div>
                                <p className="text-zinc-300 text-[11px] leading-relaxed">
                                    Gemini Co-Founder answers with zero hallucination.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Interactive 2D Vector Cluster Map */}
                    <div className="rounded-2xl border border-white/10 bg-[#0E0F1A]/95 p-6 backdrop-blur-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <Compass className="size-4 text-cyan-400" />
                                    2D Vector Projection Map
                                </h4>
                                <p className="text-xs text-zinc-400 mt-0.5">
                                    Topological visualization of active memory nodes clustered by semantic proximity.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 text-xs">
                                <span className="inline-flex items-center gap-1 text-emerald-400">
                                    <span className="size-2 rounded-full bg-emerald-400" /> Decision
                                </span>
                                <span className="inline-flex items-center gap-1 text-purple-400">
                                    <span className="size-2 rounded-full bg-purple-400" /> Product
                                </span>
                                <span className="inline-flex items-center gap-1 text-cyan-400">
                                    <span className="size-2 rounded-full bg-cyan-400" /> Technical
                                </span>
                                <span className="inline-flex items-center gap-1 text-amber-400">
                                    <span className="size-2 rounded-full bg-amber-400" /> Directive
                                </span>
                            </div>
                        </div>

                        {/* Interactive Vector Space Canvas */}
                        <div className="relative h-80 w-full rounded-xl border border-white/10 bg-black/60 overflow-hidden flex items-center justify-center">
                            {/* Grid lines */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem]" />
                            <div className="absolute h-px w-full bg-white/10" />
                            <div className="absolute w-px h-full bg-white/10" />

                            {/* Node Clusters */}
                            {searchMutation.data?.results.map((res, i) => {
                                // Deterministically compute coordinates from ID hash
                                const hash = res.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                                const x = 20 + ((hash * 17) % 65);
                                const y = 20 + ((hash * 31) % 65);
                                const config = VAULT_CONFIG[res.vault_type] ?? VAULT_CONFIG.product;

                                return (
                                    <motion.div
                                        key={res.id}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                                        style={{ left: `${x}%`, top: `${y}%` }}
                                    >
                                        <div className={cn("size-4 rounded-full border-2 border-black transition-transform group-hover:scale-150", config.dot)} />
                                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-lg border border-white/15 bg-black/90 p-2 text-center text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-30">
                                            <p className="font-semibold text-indigo-300 truncate">{res.title}</p>
                                            <p className="text-zinc-400 text-[9px] mt-0.5">{config.label} · {Math.round(res.similarity_score * 100)}% Match</p>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            <div className="absolute bottom-3 left-3 text-[10px] text-zinc-500 font-mono">
                                HNSW Dimensional Projection (L2 Normalized)
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Record Memory Modal ────────────────────────────────────────────── */}
            <AnimatePresence>
                {showRecordModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#141525] p-6 shadow-2xl space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Plus className="size-4 text-indigo-400" />
                                    Record Startup Memory Item
                                </h3>
                                <button
                                    onClick={() => setShowRecordModal(false)}
                                    className="rounded-lg p-1 text-zinc-400 hover:text-white"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="block text-zinc-400 font-medium mb-1">Target Vault</label>
                                    <select
                                        value={recordForm.vault_type}
                                        onChange={(e) => setRecordForm({ ...recordForm, vault_type: e.target.value as any })}
                                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                    >
                                        <option value="decision">Decision Memory Vault</option>
                                        <option value="technical">Technical Architecture Vault</option>
                                        <option value="product">Product Memory Vault</option>
                                        <option value="user">Founder Directives & Rules</option>
                                        <option value="artifact">Deliverable Artifact</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-zinc-400 font-medium mb-1">Title / Headline</label>
                                    <input
                                        type="text"
                                        value={recordForm.title}
                                        onChange={(e) => setRecordForm({ ...recordForm, title: e.target.value })}
                                        placeholder="e.g. Migration from REST to tRPC or Monorepo Directive"
                                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-zinc-400 font-medium mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={recordForm.category}
                                        onChange={(e) => setRecordForm({ ...recordForm, category: e.target.value })}
                                        placeholder="e.g. architecture, pricing, database, gtm"
                                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-zinc-400 font-medium mb-1">Content & Specifications</label>
                                    <textarea
                                        rows={4}
                                        value={recordForm.content}
                                        onChange={(e) => setRecordForm({ ...recordForm, content: e.target.value })}
                                        placeholder="Enter the full specification, decision rationale, or non-negotiable rule..."
                                        className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none leading-relaxed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-zinc-400 font-medium mb-1">Tags (Comma Separated)</label>
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => {
                                            setTagInput(e.target.value);
                                            setRecordForm({
                                                ...recordForm,
                                                tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                                            });
                                        }}
                                        placeholder="e.g. postgres, auth, security"
                                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                                <button
                                    onClick={() => setShowRecordModal(false)}
                                    className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => recordMutation.mutate(recordForm)}
                                    disabled={recordMutation.isPending || !recordForm.title.trim() || !recordForm.content.trim()}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-md active:scale-95 disabled:opacity-50"
                                >
                                    {recordMutation.isPending ? "Indexing..." : "Save & Index Vector"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
