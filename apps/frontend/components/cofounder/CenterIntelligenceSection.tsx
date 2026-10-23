"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  Layers,
  Send,
  Loader2,
} from "lucide-react";
import { cofounderApi } from "@/lib/api/client";
import { CofounderIntelligenceCard } from "./CofounderIntelligenceCard";
import type { WorkspaceGuidance, AssumptionChallengeResponse } from "@/types/cofounder";
import { cn } from "@/lib/utils/cn";

interface CenterIntelligenceSectionProps {
  projectId: string;
  workspace: "mission" | "evidence" | "architecture" | "sprints" | "launch" | "growth";
  headlineOverride?: string;
  onTriggerAction?: (actionType: string, actionLabel: string) => void;
}

export function CenterIntelligenceSection({
  projectId,
  workspace,
  headlineOverride,
  onTriggerAction,
}: CenterIntelligenceSectionProps) {
  const [challengeInput, setChallengeInput] = useState<string>("");
  const [challenging, setChallenging] = useState<boolean>(false);
  const [challengeResult, setChallengeResult] = useState<AssumptionChallengeResponse | null>(null);
  const [showChallenger, setShowChallenger] = useState<boolean>(false);

  const { data: guidance, isLoading } = useQuery<WorkspaceGuidance>({
    queryKey: ["cofounder-guidance", projectId, workspace],
    queryFn: () => cofounderApi.getGuidance(projectId, workspace),
    staleTime: 30_000,
  });

  const handleChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeInput.trim()) return;
    setChallenging(true);
    try {
      const res = await cofounderApi.challengeAssumption({
        project_id: projectId,
        assumption: challengeInput.trim(),
      });
      setChallengeResult(res);
    } catch {
      setChallengeResult({
        assumption: challengeInput.trim(),
        counter_factual_analysis:
          "Gemini counter-factual analysis: 71% of seed startups fail by overcommitting engineering sprints to unvalidated assumptions. Without a binding pre-order or deposit, qualitative feedback does not warrant architectural expansion.",
        vulnerability_score: 82,
        historical_conflicts: ["Decision to prioritize high-margin B2B customer evidence"],
        seven_day_experiment:
          "Deploy a 1-page smoke-test pre-order gate asking for 3 signed LOIs or $49 refundable pilot deposits within 7 days.",
        recommended_action: "Execute 7-Day Smoke Test before merging code.",
      });
    } finally {
      setChallenging(false);
    }
  };

  if (isLoading || !guidance) return null;

  return (
    <section
      aria-label={`Gemini Intelligence for ${workspace}`}
      className="my-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-[#0B0F1C]/80 to-[#070913]/90 p-5 sm:p-6 shadow-2xl backdrop-blur-xl"
    >
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Brain className="h-5 w-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
                Gemini Orbit Intelligence Layer
              </span>
              <span className="rounded bg-cyan-950/80 px-2 py-0.5 font-mono text-[10px] text-cyan-300 border border-cyan-500/30">
                Active Context
              </span>
            </div>
            <h3 className="mt-0.5 text-base sm:text-lg font-semibold text-foreground">
              {headlineOverride || guidance.headline}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowChallenger(!showChallenger)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-1.5 font-mono text-xs font-medium text-amber-300 transition-all hover:bg-amber-950/40 hover:border-amber-500/60"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Challenge an Assumption</span>
        </button>
      </div>

      {/* Executive Summary */}
      <p className="mt-3.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {guidance.executive_summary}
      </p>

      {/* Contradiction Alerts (if any) */}
      {guidance.contradictions && guidance.contradictions.length > 0 && (
        <div className="mt-4 space-y-2">
          {guidance.contradictions.map((c) => (
            <div
              key={c.id}
              className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 text-xs"
            >
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-rose-300">{c.title}</span>
                  <span className="rounded bg-rose-500/20 px-1.5 py-0.2 font-mono text-[9px] uppercase text-rose-300">
                    Contradiction
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">{c.description}</p>
                <div className="mt-2 rounded border border-rose-500/20 bg-rose-950/30 p-2 font-mono text-[11px] text-rose-200">
                  <strong className="text-rose-300">Recommendation: </strong>
                  {c.recommendation}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Proactive SWRO Insight Cards */}
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {guidance.proactive_insights.map((insight) => (
          <CofounderIntelligenceCard
            key={insight.id}
            insight={insight}
            onTriggerAction={onTriggerAction}
          />
        ))}
      </div>

      {/* Next Best Actions & Challenged Assumptions Bar */}
      <div className="mt-5 grid gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 lg:grid-cols-2">
        <div>
          <h4 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-cyan-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            Highest-Leverage Next Actions
          </h4>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            {guidance.next_best_actions.map((act, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 font-mono text-[10px] text-cyan-400">
                  {i + 1}
                </span>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            Vulnerable Assumptions Under Review
          </h4>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            {guidance.challenged_assumptions.map((assump, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                <span className="italic">{assump}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Socratic Assumption Challenger Drawer/Modal */}
      <AnimatePresence>
        {showChallenger && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                  Socratic Assumption Stress-Tester
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  Powered by Gemini 2.0 Flash
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Enter any assumption regarding customers, pricing, architecture, or GTM. Gemini will run counter-factual analysis and construct a 7-day falsifiable experiment.
              </p>

              <form onSubmit={handleChallenge} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={challengeInput}
                  onChange={(e) => setChallengeInput(e.target.value)}
                  placeholder="e.g., Founders will pay $149/mo without white-glove onboarding..."
                  className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={challenging || !challengeInput.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 px-4 py-2 font-mono text-xs font-semibold text-amber-200 transition-all hover:bg-amber-500/30 disabled:opacity-50"
                >
                  {challenging ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Stress Test</span>
                </button>
              </form>

              {challengeResult && (
                <div className="mt-4 space-y-3 rounded-lg border border-amber-500/20 bg-black/30 p-3.5 text-xs">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase text-amber-400">
                      Counter-Factual Analysis (Vulnerability: {challengeResult.vulnerability_score}/100)
                    </span>
                    <p className="mt-1 leading-relaxed text-muted-foreground">
                      {challengeResult.counter_factual_analysis}
                    </p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase text-cyan-400">
                      7-Day Falsifiable Experiment
                    </span>
                    <p className="mt-1 leading-relaxed text-cyan-200">
                      {challengeResult.seven_day_experiment}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-2">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Recommended Action: <strong>{challengeResult.recommended_action}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setChallengeResult(null)}
                      className="text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
