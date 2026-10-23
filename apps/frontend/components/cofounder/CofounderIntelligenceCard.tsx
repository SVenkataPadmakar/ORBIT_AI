"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  AlertTriangle,
  Flame,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  Brain,
  Zap,
  CheckCircle2,
} from "lucide-react";
import type { CofounderInsight } from "@/types/cofounder";
import { cn } from "@/lib/utils/cn";

interface CofounderIntelligenceCardProps {
  insight: CofounderInsight;
  onTriggerAction?: (actionType: string, actionLabel: string) => void;
  compact?: boolean;
}

const typeStyles = {
  opportunity: {
    border: "border-emerald-500/30 hover:border-emerald-500/60",
    bg: "bg-emerald-950/20 hover:bg-emerald-950/30",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    icon: Sparkles,
    glow: "rgba(16,185,129,0.15)",
    label: "Opportunity",
  },
  suggestion: {
    border: "border-cyan-500/30 hover:border-cyan-500/60",
    bg: "bg-cyan-950/20 hover:bg-cyan-950/30",
    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    icon: Zap,
    glow: "rgba(6,182,212,0.15)",
    label: "Suggestion",
  },
  warning: {
    border: "border-amber-500/30 hover:border-amber-500/60",
    bg: "bg-amber-950/20 hover:bg-amber-950/30",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    icon: AlertTriangle,
    glow: "rgba(245,158,11,0.15)",
    label: "Warning",
  },
  risk: {
    border: "border-rose-500/30 hover:border-rose-500/60",
    bg: "bg-rose-950/20 hover:bg-rose-950/30",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    icon: ShieldAlert,
    glow: "rgba(244,63,94,0.15)",
    label: "Risk Defense",
  },
};

export function CofounderIntelligenceCard({
  insight,
  onTriggerAction,
  compact = false,
}: CofounderIntelligenceCardProps) {
  const [showReasoning, setShowReasoning] = useState<boolean>(false);
  const [actionDone, setActionDone] = useState<boolean>(false);
  const style = typeStyles[insight.type] || typeStyles.suggestion;
  const Icon = style.icon;

  const handleAction = () => {
    setActionDone(true);
    if (onTriggerAction) {
      onTriggerAction(insight.action_type, insight.action_label);
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border backdrop-blur-md transition-all duration-200",
        style.border,
        style.bg,
        compact ? "p-3.5" : "p-4.5 sm:p-5"
      )}
      style={{
        boxShadow: `0 4px 20px -2px ${style.glow}`,
      }}
    >
      <div>
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
                style.badge
              )}
            >
              <Icon className="h-3 w-3" />
              {style.label}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground/80">
              Score: {insight.impact_score}/100
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowReasoning(!showReasoning)}
            className="flex items-center gap-1 font-mono text-[10px] text-cyan-400/90 transition-colors hover:text-cyan-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
            aria-expanded={showReasoning}
            aria-label="Toggle causal reasoning"
          >
            <Brain className="h-3 w-3" />
            <span>{showReasoning ? "Hide Why" : "Why"}</span>
            <ChevronDown
              className={cn("h-3 w-3 transition-transform duration-200", showReasoning && "rotate-180")}
            />
          </button>
        </div>

        {/* Title and Message */}
        <h4 className={cn("mt-2.5 font-semibold text-foreground tracking-tight", compact ? "text-xs" : "text-sm")}>
          {insight.title}
        </h4>
        <p className={cn("mt-1.5 text-muted-foreground leading-relaxed", compact ? "text-xs" : "text-xs sm:text-sm")}>
          {insight.message}
        </p>

        {/* Expandable Reasoning Explanation */}
        <AnimatePresence>
          {showReasoning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-950/30 p-3 text-xs leading-relaxed text-cyan-200">
                <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  <Brain className="h-3 w-3" />
                  Gemini Causal Reasoning & Memory Basis
                </div>
                {insight.reasoning}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <span className="font-mono text-[10px] text-muted-foreground/70">
          Target: {insight.context_workspace}
        </span>

        <button
          type="button"
          onClick={handleAction}
          disabled={actionDone}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg font-mono text-xs font-medium transition-all px-3 py-1.5",
            actionDone
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default"
              : "bg-white/10 hover:bg-white/20 text-foreground hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] active:scale-95"
          )}
        >
          {actionDone ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>Acknowledged</span>
            </>
          ) : (
            <>
              <span>{insight.action_label}</span>
              <ArrowRight className="h-3 w-3" />
            </>
          )}
        </button>
      </div>
    </motion.article>
  );
}
