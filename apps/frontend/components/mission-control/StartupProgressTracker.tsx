"use client";

import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Lightbulb,
  Search,
  Target,
  Cpu,
  Code2,
  Rocket,
  TrendingUp,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ExecutionPlan, PipelineOutputs } from "@/types/api";

interface StartupProgressTrackerProps {
  projectId?: string;
  plan?: ExecutionPlan;
  outputs?: PipelineOutputs;
  onNavigateStage?: (stageId: string) => void;
}

interface StageItem {
  id: string;
  step: string;
  name: string;
  role: string;
  icon: React.ComponentType<{ className?: string }>;
  view: string;
  status: "completed" | "in_progress" | "pending";
  completion: number;
  highlight: string;
}

export const StartupProgressTracker = memo(function StartupProgressTracker({
  projectId,
  plan,
  outputs = {},
  onNavigateStage,
}: StartupProgressTrackerProps) {
  // Derive stage status dynamically
  const buildTasks = plan?.build?.tasks || [];
  const buildDone = buildTasks.filter((t) => t.status === "done").length;
  const buildPercent = Math.min(100, Math.round((buildDone / Math.max(1, buildTasks.length)) * 100));

  const launchTasks = plan?.launch?.tasks || [];
  const launchDone = launchTasks.filter((t) => t.status === "done").length;
  const launchPercent = Math.min(100, Math.round((launchDone / Math.max(1, launchTasks.length)) * 100));

  const stages: StageItem[] = [
    {
      id: "stage-1",
      step: "01",
      name: "Problem Discovery",
      role: "Thesis & ICP",
      icon: Lightbulb,
      view: "evidence",
      status: outputs.problem_discovery ? "completed" : "in_progress",
      completion: outputs.problem_discovery ? 100 : 75,
      highlight: "Pain points & target founder archetype synthesized",
    },
    {
      id: "stage-2",
      step: "02",
      name: "Market Validation",
      role: "TAM / SAM & Moats",
      icon: Search,
      view: "evidence",
      status: outputs.market_research ? "completed" : "in_progress",
      completion: outputs.market_research ? 100 : 80,
      highlight: "Competitor landscape & defensible moats verified",
    },
    {
      id: "stage-3",
      step: "03",
      name: "Product Definition",
      role: "PRD & MVP Scope",
      icon: Target,
      view: "prd",
      status: outputs.product_strategy ? "completed" : "in_progress",
      completion: outputs.product_strategy ? 100 : 65,
      highlight: "MVP feature boundaries and core user journeys mapped",
    },
    {
      id: "stage-4",
      step: "04",
      name: "Architecture",
      role: "DDL & OpenAPI Specs",
      icon: Cpu,
      view: "architecture",
      status: plan?.technical_blueprint?.stack?.length ? "completed" : "in_progress",
      completion: plan?.technical_blueprint?.stack?.length ? 100 : 60,
      highlight: "PostgreSQL schemas, API contracts, and state topology",
    },
    {
      id: "stage-5",
      step: "05",
      name: "Sprint Execution",
      role: "14-Day Backlog",
      icon: Code2,
      view: "sprints",
      status: buildPercent >= 80 ? "completed" : "in_progress",
      completion: Math.max(45, buildPercent),
      highlight: `${buildDone}/${buildTasks.length || 12} sprint outcomes closed`,
    },
    {
      id: "stage-6",
      step: "06",
      name: "Launch Preflight",
      role: "Zero-Day Gates",
      icon: Rocket,
      view: "launch",
      status: launchPercent >= 70 ? "completed" : launchPercent > 0 ? "in_progress" : "pending",
      completion: Math.max(25, launchPercent),
      highlight: "Security verification, SSL, and distribution channels",
    },
    {
      id: "stage-7",
      step: "07",
      name: "Growth Scale",
      role: "Cohort Velocity",
      icon: TrendingUp,
      view: "growth",
      status: "pending",
      completion: 15,
      highlight: "Payback periods, referral loops, and retention modeling",
    },
  ];

  const overallProgress = Math.round(
    stages.reduce((acc, s) => acc + s.completion, 0) / stages.length
  );

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0B0D14]/90 p-5 sm:p-6 backdrop-blur-2xl shadow-xl space-y-5">
      {/* Header with Overall Progress */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
              Startup Execution Pipeline
            </span>
          </div>
          <h2 className="mt-1 text-lg sm:text-xl font-bold text-white tracking-tight">
            7-Stage Autonomous Founder Journey
          </h2>
          <p className="text-xs text-white/50">
            From raw intuitive spark to production deployment and measurable growth loops.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-white/40 block">
              Cumulative Velocity
            </span>
            <span className="font-mono text-base font-extrabold text-cyan-400">
              {overallProgress}% Complete
            </span>
          </div>
          <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 7 Interactive Stage Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = stage.status === "completed";
          const isInProgress = stage.status === "in_progress";
          const href = projectId ? `/projects/${projectId}?view=${stage.view}` : "#";

          return (
            <Link
              key={stage.id}
              href={href}
              onClick={() => onNavigateStage?.(stage.view)}
              className={cn(
                "group relative p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between hover:scale-[1.02]",
                isDone
                  ? "bg-emerald-500/[0.04] border-emerald-500/25 hover:border-emerald-500/50 hover:bg-emerald-500/[0.08]"
                  : isInProgress
                  ? "bg-cyan-500/[0.05] border-cyan-500/35 hover:border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.12)]"
                  : "bg-white/[0.02] border-white/[0.08] hover:border-white/20 opacity-70 hover:opacity-100"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-white/40">
                      {stage.step}
                    </span>
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        isDone ? "bg-emerald-400" : isInProgress ? "bg-cyan-400 animate-pulse" : "bg-white/20"
                      )}
                    />
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                  ) : isInProgress ? (
                    <Clock className="size-3.5 text-cyan-400" />
                  ) : (
                    <span className="text-[10px] font-mono text-white/30">QUEUED</span>
                  )}
                </div>

                <div className="size-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:text-cyan-300 transition-colors mb-2">
                  <Icon className="size-3.5" />
                </div>

                <h3 className="text-xs font-bold text-white tracking-tight line-clamp-1 group-hover:text-cyan-200 transition-colors">
                  {stage.name}
                </h3>
                <p className="text-[10px] font-mono text-white/45 mt-0.5 line-clamp-1">
                  {stage.role}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/60">
                  {stage.completion}%
                </span>
                <ArrowUpRight className="size-3 text-white/30 group-hover:text-white transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
});
