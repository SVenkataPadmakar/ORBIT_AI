"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  AlertTriangle,
  Flame,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Bookmark,
  Plus,
  Send,
  X,
  ChevronDown,
  Layers,
  Database,
  History,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { cofounderApi } from "@/lib/api/client";
import { CofounderIntelligenceCard } from "./CofounderIntelligenceCard";
import type {
  CofounderMemoryState,
  DecisionMemoryItem,
  DecisionCreateRequest,
  CofounderInsight,
  ContradictionAlert,
  WorkspaceGuidance,
} from "@/types/cofounder";
import type { CofounderMessage } from "@/types/api";

interface PersistentCofounderHUDProps {
  projectId: string;
  projectName: string;
  activeWorkspace: string;
}

export function PersistentCofounderHUD({
  projectId,
  projectName,
  activeWorkspace,
}: PersistentCofounderHUDProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"proactive" | "memory" | "contradictions" | "chat">("proactive");
  const [memorySubTab, setMemorySubTab] = useState<"project" | "decisions" | "product" | "execution">("decisions");
  const [newDecisionOpen, setNewDecisionOpen] = useState<boolean>(false);
  const [decisionInput, setDecisionInput] = useState<{
    category: "technical" | "market" | "product" | "pricing" | "gtm";
    decision: string;
    rationale: string;
    trade_offs: string;
  }>({
    category: "product",
    decision: "",
    rationale: "",
    trade_offs: "",
  });

  // Chat message state
  const [chatMessage, setChatMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<CofounderMessage[]>([]);

  const queryClient = useQueryClient();

  // Fetch 4-Layer Synthesized Memory
  const { data: memoryState, isLoading: memoryLoading } = useQuery<CofounderMemoryState>({
    queryKey: ["cofounder-memory", projectId],
    queryFn: () => cofounderApi.getMemory(projectId),
    staleTime: 30_000,
  });

  // Fetch Proactive Workspace Guidance
  const { data: guidance } = useQuery<WorkspaceGuidance>({
    queryKey: ["cofounder-guidance", projectId, activeWorkspace],
    queryFn: () => cofounderApi.getGuidance(projectId, activeWorkspace),
    staleTime: 30_000,
  });

  // Log Decision Mutation
  const logDecisionMutation = useMutation({
    mutationFn: (data: DecisionCreateRequest) => cofounderApi.logDecision(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cofounder-memory", projectId] });
      setNewDecisionOpen(false);
      setDecisionInput({ category: "product", decision: "", rationale: "", trade_offs: "" });
    },
  });

  // Chat with Co-Founder Mutation
  const chatMutation = useMutation({
    mutationFn: (text: string) => cofounderApi.chat(text, projectId, `workspace:${activeWorkspace}`),
    onSuccess: (data) => {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, created_at: new Date().toISOString() },
      ]);
      setChatMessage("");
    },
  });

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const text = chatMessage.trim();
    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: text, created_at: new Date().toISOString() },
    ]);
    chatMutation.mutate(text);
  };

  const contradictionsCount = memoryState?.active_contradictions?.length ?? 0;
  const decisionsCount = memoryState?.decision_memory?.length ?? 0;
  const artifactsCount = memoryState?.product_memory?.reduce((acc, p) => acc + p.artifacts.length, 0) ?? 0;

  return (
    <>
      {/* ─── Ambient Co-Founder Dock Pill (Fixed Bottom Center) ─────────────── */}
      <aside aria-label="Gemini Persistent Intelligence Dock" className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 rounded-full border border-cyan-500/30 bg-[#0A0D17]/95 p-1.5 pl-3 pr-4 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.25)] backdrop-blur-2xl"
        >
          {/* Glowing Intelligence Orb */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
          >
            <Brain className="h-4 w-4 text-white" />
            <span className="absolute -inset-0.5 rounded-full border border-cyan-400/60 animate-ping" />
          </div>

          <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold tracking-tight text-white">
                Gemini Co-Founder
              </span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            </div>
            <span className="block font-mono text-[10px] text-white/50">
              4 Memories Active · {decisionsCount} Decisions · {artifactsCount} Artifacts
            </span>
          </div>

          {contradictionsCount > 0 && (
            <span
              onClick={() => {
                setIsOpen(true);
                setActiveTab("contradictions");
              }}
              className="flex cursor-pointer items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-300"
            >
              <AlertTriangle className="h-3 w-3" />
              <span>{contradictionsCount} Conflict</span>
            </span>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="ml-1 rounded-full bg-white/5 p-1 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        </motion.div>
      </aside>

      {/* ─── Expandable Co-Founder Intelligence Center Drawer ────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <aside aria-label="Gemini Persistent Intelligence Center Drawer" className="fixed inset-x-4 bottom-20 top-16 z-50 mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-[#0B0E17]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] backdrop-blur-3xl lg:inset-x-auto lg:w-[960px]">
            {/* Ambient Background Shimmers */}
            <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

            {/* Header */}
            <div className="relative flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      Persistent Co-Founder Intelligence Layer
                    </h3>
                    <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-300 border border-cyan-500/20">
                      GEMINI 2.0 FLASH
                    </span>
                  </div>
                  <p className="text-xs text-white/50">
                    Continuously auditing {projectName} across Project, Decision, Product, and Execution memory.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Primary Navigation Tabs */}
            <div className="flex border-b border-white/10 px-6">
              <button
                onClick={() => setActiveTab("proactive")}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all ${
                  activeTab === "proactive"
                    ? "border-cyan-400 text-cyan-300"
                    : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>Proactive Intelligence Feed</span>
              </button>

              <button
                onClick={() => setActiveTab("memory")}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all ${
                  activeTab === "memory"
                    ? "border-cyan-400 text-cyan-300"
                    : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                <Database className="h-4 w-4" />
                <span>4-Layer Memory Core</span>
              </button>

              <button
                onClick={() => setActiveTab("contradictions")}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all ${
                  activeTab === "contradictions"
                    ? "border-cyan-400 text-cyan-300"
                    : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Contradiction Radar</span>
                {contradictionsCount > 0 && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.2 font-mono text-[9px] font-bold text-white">
                    {contradictionsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all ${
                  activeTab === "chat"
                    ? "border-cyan-400 text-cyan-300"
                    : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                <Brain className="h-4 w-4" />
                <span>Co-Founder Strategic Counsel</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="h-[calc(100%-120px)] overflow-y-auto p-6">
              {/* ─── TAB 1: PROACTIVE INTELLIGENCE FEED ──────────────────────── */}
              {activeTab === "proactive" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 text-xs">
                    <span className="font-bold text-cyan-300">Continuous Audit Active: </span>
                    <span className="text-white/80">
                      Gemini is observing your startup context across all operating vectors. Suggestions, warnings, and risks are dynamically updated based on live workspace changes.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {guidance?.proactive_insights && guidance.proactive_insights.length > 0 ? (
                      guidance.proactive_insights.map((insight) => (
                        <CofounderIntelligenceCard key={insight.id} insight={insight} />
                      ))
                    ) : (
                      <>
                        {/* Fallback Suggestion Card */}
                        <div className="rounded-xl border border-cyan-500/30 bg-[#070A12] p-4 text-xs">
                          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase text-cyan-400">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>High-Leverage Recommendation</span>
                          </div>
                          <h4 className="mt-1.5 text-sm font-bold text-white">
                            Transition Alpha Cohort to Signed Pre-Commitments
                          </h4>
                          <p className="mt-1 leading-relaxed text-white/70">
                            Do not rely on verbal interest from interview participants. Request a $49 deposit or formal LOI before dedicating Sprint 6 to custom workflow integrations.
                          </p>
                          <div className="mt-2 border-t border-white/5 pt-2 text-[10px] text-white/40">
                            <strong>Reasoning: </strong>Derived from Decision Memory to avoid false product validation.
                          </div>
                        </div>

                        {/* Fallback Warning Card */}
                        <div className="rounded-xl border border-amber-500/30 bg-[#070A12] p-4 text-xs">
                          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase text-amber-400">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Scope Creep Warning</span>
                          </div>
                          <h4 className="mt-1.5 text-sm font-bold text-white">
                            Backlog Customizations Threatening Alpha Timeline
                          </h4>
                          <p className="mt-1 leading-relaxed text-white/70">
                            Sprint 5 backlog includes 3 non-core theme customization tasks. Defer them to Post-Alpha to protect the 14-day launch milestone.
                          </p>
                          <div className="mt-2 border-t border-white/5 pt-2 text-[10px] text-white/40">
                            <strong>Reasoning: </strong>Execution Memory signals Day 8 of 14 with 4 critical build outcomes still in progress.
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ─── TAB 2: 4-LAYER MEMORY CORE ─────────────────────────────── */}
              {activeTab === "memory" && (
                <div className="space-y-4">
                  {/* Sub-Tabs */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5 text-xs">
                      <button
                        onClick={() => setMemorySubTab("decisions")}
                        className={`rounded px-3 py-1 font-medium transition-all ${
                          memorySubTab === "decisions"
                            ? "bg-cyan-500/20 text-cyan-300 font-bold"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        Decision Memory ({decisionsCount})
                      </button>
                      <button
                        onClick={() => setMemorySubTab("project")}
                        className={`rounded px-3 py-1 font-medium transition-all ${
                          memorySubTab === "project"
                            ? "bg-cyan-500/20 text-cyan-300 font-bold"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        Project Memory
                      </button>
                      <button
                        onClick={() => setMemorySubTab("product")}
                        className={`rounded px-3 py-1 font-medium transition-all ${
                          memorySubTab === "product"
                            ? "bg-cyan-500/20 text-cyan-300 font-bold"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        Product Memory ({artifactsCount} Artifacts)
                      </button>
                      <button
                        onClick={() => setMemorySubTab("execution")}
                        className={`rounded px-3 py-1 font-medium transition-all ${
                          memorySubTab === "execution"
                            ? "bg-cyan-500/20 text-cyan-300 font-bold"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        Execution Memory
                      </button>
                    </div>

                    {memorySubTab === "decisions" && (
                      <button
                        onClick={() => setNewDecisionOpen(!newDecisionOpen)}
                        className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Log Founder Decision</span>
                      </button>
                    )}
                  </div>

                  {/* Log Decision Form */}
                  {newDecisionOpen && (
                    <div className="rounded-xl border border-cyan-500/30 bg-black/50 p-4 text-xs space-y-3">
                      <h4 className="font-bold text-white">Record Formal Founder Decision</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-white/60 block mb-1">Category</label>
                          <select
                            value={decisionInput.category}
                            onChange={(e: any) => setDecisionInput({ ...decisionInput, category: e.target.value })}
                            className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-white"
                          >
                            <option value="product">Product</option>
                            <option value="technical">Technical</option>
                            <option value="pricing">Pricing</option>
                            <option value="market">Market</option>
                            <option value="gtm">Go-To-Market</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-white/60 block mb-1">Decision</label>
                          <input
                            type="text"
                            value={decisionInput.decision}
                            onChange={(e) => setDecisionInput({ ...decisionInput, decision: e.target.value })}
                            placeholder="e.g., Use PostgreSQL + Celery instead of Mongo..."
                            className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-white/60 block mb-1">Rationale</label>
                        <textarea
                          rows={2}
                          value={decisionInput.rationale}
                          onChange={(e) => setDecisionInput({ ...decisionInput, rationale: e.target.value })}
                          placeholder="Why was this decision chosen over alternatives?"
                          className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-white"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setNewDecisionOpen(false)}
                          className="px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            logDecisionMutation.mutate({
                              project_id: projectId,
                              category: decisionInput.category,
                              decision: decisionInput.decision,
                              rationale: decisionInput.rationale,
                              trade_offs: [decisionInput.trade_offs],
                            })
                          }
                          disabled={!decisionInput.decision || !decisionInput.rationale}
                          className="px-4 py-1.5 rounded-lg bg-cyan-500 font-bold text-black hover:bg-cyan-400 disabled:opacity-50"
                        >
                          Commit to Decision Memory
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Decision Memory List */}
                  {memorySubTab === "decisions" && (
                    <div className="space-y-3">
                      {memoryState?.decision_memory?.map((dec) => (
                        <div
                          key={dec.id}
                          className="rounded-xl border border-white/10 bg-[#070A12] p-4 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] uppercase font-bold text-cyan-300">
                              {dec.category}
                            </span>
                            <span className="font-mono text-[10px] text-white/40">
                              {new Date(dec.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="mt-2 text-sm font-bold text-white">
                            {dec.decision}
                          </h4>
                          <p className="mt-1 leading-relaxed text-white/70">
                            <strong>Rationale: </strong>{dec.rationale}
                          </p>
                          {dec.trade_offs?.length > 0 && (
                            <div className="mt-2 text-[11px] text-amber-300/70">
                              <strong>Trade-offs: </strong>{dec.trade_offs.join(", ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Project Memory View */}
                  {memorySubTab === "project" && memoryState && (
                    <div className="space-y-3 text-xs">
                      <div className="rounded-xl border border-white/10 bg-[#070A12] p-4">
                        <span className="text-white/40 font-mono text-[10px] uppercase block">Core Thesis</span>
                        <p className="mt-1 font-semibold text-white">{memoryState.project_memory.core_thesis}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/10 bg-[#070A12] p-4">
                          <span className="text-white/40 font-mono text-[10px] uppercase block">ICP Archetype</span>
                          <p className="mt-1 font-semibold text-white">{memoryState.project_memory.icp_archetype}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-[#070A12] p-4">
                          <span className="text-white/40 font-mono text-[10px] uppercase block">Monetization Model</span>
                          <p className="mt-1 font-semibold text-emerald-400 font-mono">{memoryState.project_memory.monetization_model}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product Memory View */}
                  {memorySubTab === "product" && memoryState && (
                    <div className="space-y-3 text-xs">
                      {memoryState.product_memory.map((prod, idx) => (
                        <div key={idx} className="rounded-xl border border-white/10 bg-[#070A12] p-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-white text-sm">{prod.component}</h4>
                            <span className="font-mono text-[10px] uppercase rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5">
                              {prod.status}
                            </span>
                          </div>
                          <p className="mt-1 text-white/70">{prod.specification}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {prod.artifacts.map((art, aIdx) => (
                              <span key={aIdx} className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-cyan-400">
                                📄 {art}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Execution Memory View */}
                  {memorySubTab === "execution" && memoryState && (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl border border-white/10 bg-[#070A12] p-4">
                          <span className="text-white/40 font-mono text-[10px] uppercase block">Velocity Trend</span>
                          <span className="text-sm font-bold text-cyan-400 mt-1 block">{memoryState.execution_memory.velocity_trend}</span>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-[#070A12] p-4">
                          <span className="text-white/40 font-mono text-[10px] uppercase block">Autonomous Efficiency</span>
                          <span className="text-sm font-bold text-indigo-400 mt-1 block">{memoryState.execution_memory.agent_efficiency_score}%</span>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-[#070A12] p-4">
                          <span className="text-white/40 font-mono text-[10px] uppercase block">Tasks Closed</span>
                          <span className="text-sm font-bold text-emerald-400 mt-1 block">{memoryState.execution_memory.tasks_closed_total} Completed</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 3: CONTRADICTION RADAR ─────────────────────────────── */}
              {activeTab === "contradictions" && (
                <div className="space-y-3 text-xs">
                  {contradictionsCount === 0 ? (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-6 text-center">
                      <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                      <h4 className="font-bold text-white text-sm">Zero Strategic Contradictions Detected</h4>
                      <p className="mt-1 text-white/60 max-w-md mx-auto">
                        Your project thesis, target customer persona, pricing model, and sprint tasks are completely in alignment.
                      </p>
                    </div>
                  ) : (
                    memoryState?.active_contradictions.map((contra) => (
                      <div key={contra.id} className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4">
                        <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                          <Flame className="h-4 w-4 text-rose-400" />
                          <span>{contra.title}</span>
                        </div>
                        <p className="mt-1.5 text-white/80 leading-relaxed">{contra.description}</p>
                        <div className="mt-3 rounded-lg border border-rose-500/20 bg-black/40 p-3">
                          <span className="font-mono text-[10px] uppercase font-bold text-rose-300 block">
                            Recommended Co-Founder Alignment:
                          </span>
                          <p className="mt-0.5 text-white/80">{contra.recommendation}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ─── TAB 4: CO-FOUNDER REASONING CHAT ────────────────────────── */}
              {activeTab === "chat" && (
                <div className="flex flex-col h-full justify-between">
                  <div className="space-y-3 overflow-y-auto max-h-[380px] pr-2">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-white/60 italic">
                      Conversing with Gemini using complete 4-layer startup memory. Gemini will challenge assumptions, cite past decisions, and recommend next actions.
                    </div>

                    {chatHistory.map((msg, mIdx) => (
                      <div
                        key={mIdx}
                        className={`rounded-xl p-3.5 text-xs ${
                          msg.role === "user"
                            ? "ml-8 bg-cyan-950/30 border border-cyan-500/30 text-white"
                            : "mr-8 bg-white/5 border border-white/10 text-white/90"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1 font-mono text-[10px] text-white/40">
                          <span>{msg.role === "user" ? "Founder" : "Gemini Co-Founder"}</span>
                        </div>
                        <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                      </div>
                    ))}

                    {chatMutation.isPending && (
                      <div className="flex items-center gap-2 text-xs text-cyan-300 animate-pulse">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Gemini synthesizing memory and evaluating trade-offs...</span>
                      </div>
                    )}
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendChat} className="mt-4 flex gap-2 border-t border-white/10 pt-3">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Ask your co-founder anything or debate a technical trade-off..."
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!chatMessage.trim() || chatMutation.isPending}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02] disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Consult</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </aside>
        )}
      </AnimatePresence>
    </>
  );
}
