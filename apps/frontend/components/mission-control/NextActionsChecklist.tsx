"use client";

import { memo, useState } from "react";
import {
  CheckSquare,
  Square,
  Zap,
  Play,
  ArrowRight,
  Sparkles,
  Bot,
  User,
  Clock,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ExecutionPlan, ExecutionTaskStatus } from "@/types/api";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: "P0" | "P1";
  owner: "Founder" | "Agent: Turing" | "Agent: Socrates" | "Agent: Athena" | "Agent: Sentinel";
  status: "todo" | "in_progress" | "done";
  impact: string;
  category: "Architecture" | "Validation" | "GTM" | "Security" | "Finance";
}

interface NextActionsChecklistProps {
  plan?: ExecutionPlan;
  onExecuteAction?: (actionId: string, actionTitle: string) => void;
  onTaskStatusUpdate?: (taskId: string, status: ExecutionTaskStatus) => void;
}

const DEFAULT_NEXT_ACTIONS: ActionItem[] = [
  {
    id: "act-p0-1",
    title: "Verify PostgreSQL Row-Level Security Policies",
    description: "Audit multi-tenant partition triggers to guarantee zero tenant data leakage before Alpha cohort onboarding.",
    priority: "P0",
    owner: "Agent: Turing",
    status: "in_progress",
    impact: "+18% SecOps Gate",
    category: "Security",
  },
  {
    id: "act-p0-2",
    title: "Conduct 5 Customer Problem Interviews with Technical Founders",
    description: "Validate pricing willingness and pain intensity on 14-day autonomous sprint delivery.",
    priority: "P0",
    owner: "Founder",
    status: "todo",
    impact: "+14% Validation Confidence",
    category: "Validation",
  },
  {
    id: "act-p1-1",
    title: "Deploy Semantic Caching for Gemini 2.0 Inference Calls",
    description: "Reduce token compute latency and API overhead by 42% on repetitive agent council debates.",
    priority: "P1",
    owner: "Agent: Turing",
    status: "todo",
    impact: "-40% Token Compute Burn",
    category: "Architecture",
  },
  {
    id: "act-p1-2",
    title: "Launch Public Waitlist Smoke Test with Interactive Demo Embed",
    description: "Capture top-of-funnel inbound founder interest and benchmark organic conversion rates.",
    priority: "P1",
    owner: "Agent: Athena",
    status: "todo",
    impact: "+22% Launch Readiness",
    category: "GTM",
  },
  {
    id: "act-p1-3",
    title: "Calibrate Runway Sensitivity Model under 2x GPU Token Price Spike",
    description: "Run Monte Carlo simulation to verify 18-month cash reserves under peak user concurrency.",
    priority: "P1",
    owner: "Agent: Sentinel",
    status: "todo",
    impact: "+12% Financial Moat",
    category: "Finance",
  },
];

export const NextActionsChecklist = memo(function NextActionsChecklist({
  plan,
  onExecuteAction,
  onTaskStatusUpdate,
}: NextActionsChecklistProps) {
  // Use tasks from execution plan if available, or fallback to default high-impact actions
  const [filter, setFilter] = useState<"all" | "P0" | "P1">("all");
  const [localActions, setLocalActions] = useState<ActionItem[]>(DEFAULT_NEXT_ACTIONS);

  const toggleTask = (id: string) => {
    setLocalActions((prev) =>
      prev.map((action) => {
        if (action.id === id) {
          const nextStatus = action.status === "done" ? "todo" : "done";
          if (onTaskStatusUpdate) {
            onTaskStatusUpdate(id, nextStatus as ExecutionTaskStatus);
          }
          return { ...action, status: nextStatus };
        }
        return action;
      })
    );
  };

  const filtered = localActions.filter((a) => (filter === "all" ? true : a.priority === filter));

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0B0D14]/90 p-5 sm:p-6 backdrop-blur-2xl shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
              Founder Execution Engine
            </span>
          </div>
          <h2 className="mt-1 text-lg sm:text-xl font-bold text-white tracking-tight">
            Prioritized Next Actions
          </h2>
          <p className="text-xs text-white/50">
            Immediate P0 / P1 levers that directly unblock milestones and advance your startup readiness.
          </p>
        </div>

        {/* Priority Filter Toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10 text-xs font-mono">
          {(["all", "P0", "P1"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all",
                filter === p
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30"
                  : "text-white/50 hover:text-white"
              )}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-2.5">
        {filtered.map((action) => {
          const isDone = action.status === "done";
          const isP0 = action.priority === "P0";

          return (
            <div
              key={action.id}
              className={cn(
                "p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group",
                isDone
                  ? "bg-white/[0.01] border-white/[0.05] opacity-60"
                  : "bg-white/[0.02] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]"
              )}
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  onClick={() => toggleTask(action.id)}
                  aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                  className="mt-0.5 text-white/40 hover:text-cyan-400 transition-colors flex-shrink-0"
                >
                  {isDone ? (
                    <CheckSquare className="size-5 text-emerald-400" />
                  ) : (
                    <Square className="size-5" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border",
                        isP0
                          ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                          : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                      )}
                    >
                      {action.priority}
                    </span>

                    <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {action.impact}
                    </span>

                    <span className="text-[10px] font-mono text-white/40 flex items-center gap-1">
                      {action.owner.startsWith("Agent") ? (
                        <Bot className="size-3 text-indigo-400" />
                      ) : (
                        <User className="size-3 text-white/50" />
                      )}
                      <span>{action.owner}</span>
                    </span>
                  </div>

                  <h3
                    className={cn(
                      "text-xs sm:text-sm font-semibold tracking-tight transition-colors",
                      isDone ? "text-white/40 line-through" : "text-white group-hover:text-cyan-200"
                    )}
                  >
                    {action.title}
                  </h3>

                  <p className="text-[11px] text-white/55 leading-relaxed mt-0.5">
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center pl-8 sm:pl-0">
                {!isDone && onExecuteAction && (
                  <button
                    onClick={() => onExecuteAction(action.id, action.title)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                  >
                    <Zap className="size-3" />
                    <span>Execute</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
