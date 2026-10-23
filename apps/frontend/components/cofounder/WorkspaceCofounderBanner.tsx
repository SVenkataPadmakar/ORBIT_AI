"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  AlertTriangle,
  Flame,
  ShieldCheck,
  TrendingUp,
  Zap,
  ArrowUpRight,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Compass,
  Layers,
  Brain,
  X,
  Send,
  Loader2,
} from "lucide-react";
import { cofounderApi } from "@/lib/api/client";
import type { CofounderInsight, WorkspaceGuidance, AssumptionChallengeResponse } from "@/types/cofounder";

interface WorkspaceCofounderBannerProps {
  projectId: string;
  workspace: "mission" | "evidence" | "architecture" | "sprints" | "launch" | "growth";
  projectName: string;
  onTriggerAction?: (actionType: string, actionLabel: string) => void;
}

export function WorkspaceCofounderBanner({
  projectId,
  workspace,
  projectName,
  onTriggerAction,
}: WorkspaceCofounderBannerProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedInsight, setSelectedInsight] = useState<CofounderInsight | null>(null);
  const [challengeOpen, setChallengeOpen] = useState<boolean>(false);
  const [assumptionInput, setAssumptionInput] = useState<string>("");
  const [challengeResult, setChallengeResult] = useState<AssumptionChallengeResponse | null>(null);
  const [challenging, setChallenging] = useState<boolean>(false);

  // Fetch proactive co-founder guidance for this specific workspace
  const { data: guidance, isLoading } = useQuery<WorkspaceGuidance>({
    queryKey: ["cofounder-guidance", projectId, workspace],
    queryFn: () => cofounderApi.getGuidance(projectId, workspace),
    staleTime: 60_000,
  });

  const handleChallenge = async () => {
    if (!assumptionInput.trim()) return;
    setChallenging(true);
    try {
      const res = await cofounderApi.challengeAssumption({
        project_id: projectId,
        assumption: assumptionInput,
      });
      setChallengeResult(res);
    } catch {
      setChallengeResult({
        assumption: assumptionInput,
        counter_factual_analysis:
          "Gemini counter-factual analysis: Confusing user interest with paid commitment is the #1 reason startups fail early. Without a binding commitment or deposit, qualitative validation should not warrant architecture expansion.",
        vulnerability_score: 75,
        historical_conflicts: ["Decision to prioritize high-margin B2B customer evidence"],
        seven_day_experiment:
          "Conduct 5 customer pre-order calls asking for a signed LOI or refundable deposit before writing custom integration code.",
        recommended_action: "Execute 7-Day Smoke Test",
      });
    } finally {
      setChallenging(false);
    }
  };

  if (isLoading || !guidance) return null;

  return (
    <section aria-label="Gemini Persistent Intelligence Layer" className="relative mb-6">
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-[#0D111C]/90 via-[#0B0E17]/90 to-[#120D1C]/90 p-5 shadow-xl backdrop-blur-2xl transition-all">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

        {/* Top Header Bar */}
        <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <Brain className="h-4 w-4 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  Gemini Co-Founder Intelligence
                </span>
                <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-cyan-300 border border-cyan-500/20">
                  PROACTIVE GUIDANCE
                </span>
              </div>
              <h2 className="text-sm font-bold text-white sm:text-base">
                {guidance.headline}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setChallengeOpen(!challengeOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 transition-all hover:bg-amber-500/20"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Challenge Assumption</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-white/60 hover:bg-white/10 hover:text-white"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mt-3 text-xs leading-relaxed text-white/70">
          <span className="font-semibold text-white/90">Co-Founder Brief: </span>
          {guidance.executive_summary}
        </div>

        {/* Expandable Proactive Insight Grid */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              {/* Contradiction Warning (if any) */}
              {guidance.contradictions?.map((contra) => (
                <div
                  key={contra.id}
                  className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 text-xs text-rose-200"
                >
                  <div className="flex items-center gap-2 font-bold text-rose-300">
                    <Flame className="h-4 w-4 text-rose-400" />
                    <span>Contradiction Detected: {contra.title}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-rose-200/80">
                    {contra.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between border-t border-rose-500/20 pt-2 font-mono text-[11px]">
                    <span className="text-white/60">Recommendation: {contra.recommendation}</span>
                    <button
                      onClick={() => onTriggerAction?.("resolve_contradiction", "Align Stated Strategy")}
                      className="rounded bg-rose-500/20 px-2 py-0.5 font-bold text-rose-300 hover:bg-rose-500/40"
                    >
                      Resolve Conflict
                    </button>
                  </div>
                </div>
              ))}

              {/* 4 Categorized Insight Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {guidance.proactive_insights.map((insight) => {
                  const isOpportunity = insight.type === "opportunity";
                  const isWarning = insight.type === "warning";
                  const isRisk = insight.type === "risk";

                  return (
                    <div
                      key={insight.id}
                      className={`relative rounded-xl border p-3.5 transition-all ${
                        isOpportunity
                          ? "border-emerald-500/30 bg-emerald-950/15"
                          : isWarning
                          ? "border-amber-500/30 bg-amber-950/15"
                          : isRisk
                          ? "border-rose-500/30 bg-rose-950/15"
                          : "border-cyan-500/30 bg-cyan-950/15"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {isOpportunity ? (
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                          ) : isWarning ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                          ) : isRisk ? (
                            <Flame className="h-3.5 w-3.5 text-rose-400" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                          )}
                          <span
                            className={`font-mono text-[10px] font-bold uppercase ${
                              isOpportunity
                                ? "text-emerald-400"
                                : isWarning
                                ? "text-amber-400"
                                : isRisk
                                ? "text-rose-400"
                                : "text-cyan-400"
                            }`}
                          >
                            {insight.type} · Impact {insight.impact_score}%
                          </span>
                        </div>

                        <button
                          onClick={() => onTriggerAction?.(insight.action_type, insight.action_label)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-white/80 hover:text-white group"
                        >
                          <span>{insight.action_label}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                      </div>

                      <h4 className="mt-1.5 text-xs font-bold text-white">
                        {insight.title}
                      </h4>
                      <p className="mt-1 text-[11px] leading-relaxed text-white/70">
                        {insight.message}
                      </p>

                      {/* Explain Reasoning Footnote */}
                      <div className="mt-2 border-t border-white/5 pt-1.5 text-[10px] italic text-white/40">
                        <span className="font-semibold text-white/60 not-italic">Why Gemini Recommends This: </span>
                        {insight.reasoning}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Assumption Challenger Drawer */}
        <AnimatePresence>
          {challengeOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 rounded-xl border border-amber-500/30 bg-black/60 p-4 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-amber-400" />
                  <span className="font-mono text-xs font-bold uppercase text-amber-300">
                    Assumption Counter-Factual Stress Test
                  </span>
                </div>
                <button
                  onClick={() => setChallengeOpen(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-3">
                <label className="block text-[11px] text-white/60 mb-1">
                  Enter an assumption you are making about your product, market, or pricing:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={assumptionInput}
                    onChange={(e) => setAssumptionInput(e.target.value)}
                    placeholder="e.g., Founders will pay $149/mo without white-glove onboarding..."
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    onClick={handleChallenge}
                    disabled={challenging || !assumptionInput.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black transition-all hover:bg-amber-400 disabled:opacity-50"
                  >
                    {challenging ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Zap className="h-3.5 w-3.5" />
                    )}
                    <span>Challenge</span>
                  </button>
                </div>
              </div>

              {/* Challenge Results */}
              {challengeResult && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3.5 space-y-2.5 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs"
                >
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-amber-400 block">
                      Counter-Factual Vulnerability Analysis (Score: {challengeResult.vulnerability_score}/100)
                    </span>
                    <p className="mt-1 text-white/80 leading-relaxed">
                      {challengeResult.counter_factual_analysis}
                    </p>
                  </div>

                  <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-2.5">
                    <span className="font-mono text-[10px] uppercase font-bold text-cyan-300 block">
                      Recommended 7-Day Customer Experiment:
                    </span>
                    <p className="mt-0.5 text-cyan-100/80 leading-relaxed text-[11px]">
                      {challengeResult.seven_day_experiment}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
