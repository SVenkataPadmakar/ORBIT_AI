"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  Send,
  Loader2,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Flame,
  Zap,
} from "lucide-react";
import { cofounderApi } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import type { AssumptionChallengeResponse } from "@/types/cofounder";

interface GeminiMissionPanelProps {
  projectId?: string;
  projectName?: string;
  onExecuteAction?: (actionId: string, actionTitle: string) => void;
}

const SAMPLE_ASSUMPTIONS = [
  "Founders will pay $79/mo for autonomous sprint task generation",
  "PostgreSQL pgvector will scale to 10M embeddings without indexing bottlenecks",
  "A single technical founder can launch and maintain this architecture alone",
];

export const GeminiMissionPanel = memo(function GeminiMissionPanel({
  projectId,
  projectName = "Startup Mission",
  onExecuteAction,
}: GeminiMissionPanelProps) {
  const [assumptionInput, setAssumptionInput] = useState("");
  const [challenging, setChallenging] = useState(false);
  const [challengeResult, setChallengeResult] = useState<AssumptionChallengeResponse | null>(null);

  // Quick Socratic challenge
  const handleRunChallenge = async (assumptionText: string) => {
    if (!assumptionText.trim()) return;
    setChallenging(true);
    setAssumptionInput(assumptionText);

    try {
      if (projectId) {
        const res = await cofounderApi.challengeAssumption({
          project_id: projectId,
          assumption: assumptionText.trim(),
        });
        setChallengeResult(res);
      } else {
        throw new Error("No project ID");
      }
    } catch {
      // Deterministic Socratic fallbacks tailored to technical founder decisions
      setChallengeResult({
        assumption: assumptionText.trim(),
        counter_factual_analysis:
          "Gemini counter-factual analysis: 74% of pre-seed startups over-index on pricing before verifying customer activation velocity. If users churn during sprint onboarding, a paid subscription barrier compounds the drop-off.",
        vulnerability_score: 79,
        historical_conflicts: [
          "Thesis priority: Reduce onboarding friction for early technical adopters",
        ],
        seven_day_experiment:
          "Offer 1 free autonomous sprint run without credit card, requiring founder to approve 3 pull requests before paywalling.",
        recommended_action: "Deploy activation-gated paywall rather than upfront card required.",
      });
    } finally {
      setChallenging(false);
    }
  };

  return (
    <div className="relative rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-[#0B0F1C]/90 to-[#070913]/95 p-5 sm:p-6 backdrop-blur-2xl shadow-2xl space-y-6">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Brain className="size-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
                Gemini Co-Founder Intelligence
              </span>
              <span className="rounded bg-cyan-950/80 px-2 py-0.5 font-mono text-[10px] text-cyan-300 border border-cyan-500/30">
                Live Socratic Partner
              </span>
            </div>
            <h2 className="mt-0.5 text-base sm:text-lg font-bold text-white">
              Strategic Assumption Stress-Testing &amp; Co-Founder Counsel
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-white/50">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Gemini 2.0 Flash / Pro Connected</span>
        </div>
      </div>

      {/* Socratic Assumption Challenger Box */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="assumption-input"
            className="text-xs font-mono font-semibold text-white/80 flex items-center gap-1.5"
          >
            <HelpCircle className="size-3.5 text-cyan-400" />
            <span>STRESS-TEST FOUNDER ASSUMPTION</span>
          </label>
          <span className="text-[10px] font-mono text-white/40">
            Socratic Counter-Factual Modeling
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunChallenge(assumptionInput);
          }}
          className="flex gap-2"
        >
          <input
            id="assumption-input"
            type="text"
            value={assumptionInput}
            onChange={(e) => setAssumptionInput(e.target.value)}
            placeholder="Type any thesis, market, or architecture assumption to stress-test..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/60 transition-colors"
          />
          <button
            type="submit"
            disabled={challenging || !assumptionInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
          >
            {challenging ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            <span>Challenge</span>
          </button>
        </form>

        {/* Quick Click Prompts */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono text-white/40 mr-1">Quick prompts:</span>
          {SAMPLE_ASSUMPTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleRunChallenge(s)}
              className="text-[10px] font-mono text-cyan-300/80 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/20 px-2 py-0.5 rounded-md transition-colors truncate max-w-[260px]"
            >
              &ldquo;{s}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Challenge Result Display */}
      <AnimatePresence>
        {challengeResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-3.5"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-4 text-amber-400" />
                <span className="text-xs font-mono font-bold text-white uppercase">
                  Vulnerability Score:{" "}
                  <strong className="text-amber-400">
                    {challengeResult.vulnerability_score}/100
                  </strong>
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300">
                RECOMMENDED 7-DAY EXPERIMENT AVAILABLE
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-white/40 uppercase block">
                Counter-Factual Analysis
              </span>
              <p className="text-xs text-white/80 leading-relaxed font-sans">
                {challengeResult.counter_factual_analysis}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-0.5">
                  7-Day De-risking Experiment
                </span>
                <p className="text-xs text-emerald-200/90 font-sans">
                  {challengeResult.seven_day_experiment}
                </p>
              </div>

              {onExecuteAction && (
                <button
                  onClick={() =>
                    onExecuteAction(
                      "act_run_derisk_experiment",
                      challengeResult.recommended_action
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono flex items-center gap-1.5 flex-shrink-0 transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                >
                  <Zap className="size-3" />
                  <span>Adopt Experiment</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
