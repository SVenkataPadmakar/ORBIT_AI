"use client";

import { memo, useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStartupStore } from "@/lib/stores/startup-store";
import {
  Lightbulb,
  Search,
  ShieldAlert,
  Target,
  Database,
  Code2,
  ShieldCheck,
  Check,
  X,
  Loader2,
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
  FileCode,
  Archive,
  Play,
  Lock,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PipelineOutputs, PipelineStatusResponse, PipelineStatus } from "@/types/api";

export type AgentStepStatus = "pending" | "running" | "done" | "failed";

export interface ConstitutionalStepDef {
  step: number;
  key: string;
  name: string;
  role: string;
  model: string;
  inputContract: string;
  deliverable: string;
  deliverableType: "markdown" | "json" | "code" | "zip";
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

export const CONSTITUTIONAL_7_STEPS: ConstitutionalStepDef[] = [
  {
    step: 1,
    key: "problem_discovery",
    name: "Problem Discovery",
    role: "Problem Formulation & Persona Pain Synthesis",
    model: "Gemini 2.0 Flash",
    inputContract: "Raw Founder Idea Input",
    deliverable: "problem.md",
    deliverableType: "markdown",
    description:
      "Validates acute user pain severity, defines ICP target personas, audits legacy alternatives, and analyzes the market window.",
    icon: Lightbulb,
    color: "#06B6D4",
  },
  {
    step: 2,
    key: "market_analysis",
    name: "Market Analysis",
    role: "Competitive Landscape & Market Sizing",
    model: "Gemini 2.0 Flash with Tavily",
    inputContract: "problem.md from Agent 1",
    deliverable: "market.md",
    deliverableType: "markdown",
    description:
      "Performs live web competitive scanning, estimates TAM/SAM/SOM market boundaries, and analyzes defensibility and moat vectors.",
    icon: Search,
    color: "#6366F1",
  },
  {
    step: 3,
    key: "feasibility",
    name: "Feasibility Assessment",
    role: "Constitutional Viability Gate (Score ≥ 80)",
    model: "Gemini 2.0 Flash Structured JSON",
    inputContract: "problem.md, market.md",
    deliverable: "feasibility.json",
    deliverableType: "json",
    description:
      "Constitutional Gatekeeper: Evaluates market size (30), differentiation (30), timing (20), and execution complexity (20). Score < 80 halts execution.",
    icon: ShieldAlert,
    color: "#F59E0B",
  },
  {
    step: 4,
    key: "prd_generator",
    name: "PRD Generator",
    role: "Product Requirements & MoSCoW Specification",
    model: "Gemini 2.0 Flash Pydantic",
    inputContract: "problem.md, market.md, feasibility.json (Score ≥ 80)",
    deliverable: "PRD.md",
    deliverableType: "markdown",
    description:
      "Authors complete 8-section product specification: MVP features (F-01 to F-06 tagged [Must-Have]), User Stories (US-01 to US-08), and Non-Goals.",
    icon: Target,
    color: "#EC4899",
  },
  {
    step: 5,
    key: "design",
    name: "System Design",
    role: "Architecture, Relational DDL & API Specs",
    model: "Gemini 2.0 Flash",
    inputContract: "PRD.md from Agent 4",
    deliverable: "architecture.md & schema.sql",
    deliverableType: "code",
    description:
      "Synthesizes C4 Mermaid system architecture, 3NF PostgreSQL DDL schema with foreign keys/indices, and OpenAPI 3.1 specification.",
    icon: Database,
    color: "#8B5CF6",
  },
  {
    step: 6,
    key: "developer",
    name: "Autonomous Developer",
    role: "Codebase Build, Test & Packaging",
    model: "DeepSeek Coder",
    inputContract: "All Design Artifacts + PRD.md",
    deliverable: "orbit.zip",
    deliverableType: "zip",
    description:
      "Autonomous full-stack scaffolding (FastAPI + Next.js). Executes builds & test suites in isolated sandbox, applies self-healing repair loops, and packages orbit.zip.",
    icon: Code2,
    color: "#10B981",
  },
  {
    step: 7,
    key: "risk_analysis",
    name: "Risk Analysis",
    role: "Multi-Vector Risk Audit & Watch List",
    model: "Gemini 2.0 Flash",
    inputContract: "Artifacts from Agents 1-6 + orbit.zip",
    deliverable: "risk.md",
    deliverableType: "markdown",
    description:
      "Conducts multi-vector risk audit across Technical, Market, Execution, and Regulatory vectors and establishes Top-3 Watch List with mitigations.",
    icon: ShieldCheck,
    color: "#EF4444",
  },
];

export interface AgentPipelineProps {
  projectId: string;
  projectName?: string;
  pipelineStatus?: PipelineStatus | string;
  statusData?: PipelineStatusResponse | null;
  outputs?: PipelineOutputs;
  isStarting?: boolean;
  onStartPipeline?: () => void;
  onDownloadZip?: () => void;
}

export const AgentPipeline = memo(function AgentPipeline({
  projectId,
  projectName = "Startup Venture",
  pipelineStatus = "idle",
  statusData,
  outputs = {},
  isStarting = false,
  onStartPipeline,
  onDownloadZip,
}: AgentPipelineProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>("problem_discovery");

  // Real-time SSE Zustand store subscription
  const agentProgress = useStartupStore((s) => s.agentProgress);
  const pipelineGate = useStartupStore((s) => s.pipelineGate);

  // Connect SSE stream on mount and clean up on unmount
  useEffect(() => {
    const streamTarget = statusData?.pipeline_run_id || projectId;
    if (!streamTarget) return;
    const cleanup = useStartupStore.getState().connectStream(streamTarget);
    return () => {
      cleanup();
    };
  }, [projectId, statusData?.pipeline_run_id]);

  const runs = useMemo(() => statusData?.runs || [], [statusData?.runs]);
  const isPipelineRunning =
    isStarting || pipelineStatus === "running" || pipelineStatus === "queued";
  const isPipelineCompleted =
    pipelineStatus === "completed" ||
    (!isPipelineRunning && runs.length > 0 && runs.every((r) => r.status === "success"));

  // Gate Logic: Listen for the SSE event { agent: "feasibility", status: "failed" }
  const feasibilityOutput = outputs?.feasibility;
  const feasibilityRun = runs.find((r) => r.stage === "feasibility");
  const isFeasibilityFailed = useMemo(() => {
    if (pipelineGate.isHalted || pipelineGate.failedAgent === "feasibility") {
      return true;
    }
    const liveFeasibility = agentProgress["feasibility"];
    if (liveFeasibility && (liveFeasibility.status === "failed" || liveFeasibility.status === "error")) {
      return true;
    }
    if (feasibilityRun && (feasibilityRun.status === "failed" || feasibilityRun.status === "error")) {
      return true;
    }
    if (feasibilityOutput) {
      if (feasibilityOutput.gate_passed === false) return true;
      if (typeof feasibilityOutput.score === "number" && feasibilityOutput.score < 80) return true;
      if (feasibilityOutput.status === "failed") return true;
    }
    if (pipelineStatus === "failed" && runs.length >= 3 && runs[2]?.status === "failed") {
      return true;
    }
    return false;
  }, [pipelineGate, agentProgress, feasibilityRun, feasibilityOutput, pipelineStatus, runs]);

  // When Feasibility fails, all animations stop
  const shouldAnimate = !isFeasibilityFailed;

  // Compute status for each agent step: "pending" | "running" | "done" | "failed"
  const getStepStatus = useCallback(
    (stepDef: ConstitutionalStepDef, index: number): AgentStepStatus => {
      // If feasibility failed, steps 4-7 are disabled / failed / pending
      if (isFeasibilityFailed && index >= 3) {
        return "pending";
      }

      // Check real-time SSE progress from Zustand
      const liveItem = agentProgress[stepDef.key];
      if (liveItem) {
        if (liveItem.status === "running" || liveItem.status === "in_progress") {
          return "running";
        }
        if (liveItem.status === "failed" || liveItem.status === "error") {
          return "failed";
        }
        if (liveItem.status === "done" || liveItem.status === "completed" || liveItem.percent >= 100) {
          return "done";
        }
      }

      // Optimistic instant feedback: if starting, step 1 is instantly marked running
      if (isStarting && index === 0) return "running";

      const matchedRun = runs.find((r) => r.stage === stepDef.key);
      if (matchedRun) {
        if (matchedRun.status === "running" || matchedRun.status === "in_progress") {
          return "running";
        }
        if (matchedRun.status === "failed" || matchedRun.status === "error") {
          return "failed";
        }
        if (matchedRun.status === "success" || matchedRun.status === "completed") {
          // Special validation for step 3 feasibility
          if (stepDef.key === "feasibility" && isFeasibilityFailed) {
            return "failed";
          }
          return "done";
        }
      }

      // Check outputs
      if (stepDef.key === "feasibility") {
        if (isFeasibilityFailed) return "failed";
        if (feasibilityOutput && (feasibilityOutput.gate_passed || (feasibilityOutput.score ?? 0) >= 80)) {
          return "done";
        }
      } else if (outputs[stepDef.key as keyof PipelineOutputs]) {
        return "done";
      }

      // Overall pipeline completion check
      if (isPipelineCompleted && !isFeasibilityFailed) {
        return "done";
      }

      return "pending";
    },
    [isFeasibilityFailed, agentProgress, isStarting, runs, feasibilityOutput, outputs, isPipelineCompleted]
  );

  // Compute progress percent for each step (0-100)
  const getStepPercent = useCallback(
    (stepDef: ConstitutionalStepDef, index: number): number => {
      if (isFeasibilityFailed && index >= 3) return 0;
      const liveItem = agentProgress[stepDef.key];
      if (liveItem && typeof liveItem.percent === "number") {
        return Math.min(100, Math.max(0, liveItem.percent));
      }
      const st = getStepStatus(stepDef, index);
      if (st === "done") return 100;
      if (st === "running") return 65;
      return 0;
    },
    [isFeasibilityFailed, agentProgress, getStepStatus]
  );

  // Status of all 7 steps
  const stepStatuses = useMemo(() => {
    return CONSTITUTIONAL_7_STEPS.map((step, idx) => ({
      key: step.key,
      status: getStepStatus(step, idx),
      percent: getStepPercent(step, idx),
    }));
  }, [getStepStatus, getStepPercent]);

  const step7IsDone = stepStatuses[6]?.status === "done";
  const completedCount = stepStatuses.filter((s) => s.status === "done").length;
  const progressPercent = Math.round((completedCount / 7) * 100);

  const handleDownload = () => {
    if (!step7IsDone) return;
    if (onDownloadZip) {
      onDownloadZip();
    } else {
      const runId = statusData?.pipeline_run_id || "run-latest";
      window.open(`http://localhost:8000/api/runs/${runId}/download/orbit.zip`, "_blank");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-4">
      {/* ── Top Header Card ── */}
      <div className="rounded-2xl border border-white/10 bg-[#0B0D14]/90 backdrop-blur-2xl p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-[11px] font-mono text-purple-300 mb-2">
              <span className="size-2 rounded-full bg-purple-400 animate-pulse" />
              <span>7-AGENT CONSTITUTIONAL PIPELINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {projectName}
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-xl">
              Strict linear execution: 7 specialized autonomous agents with independent model routing,
              immutable handoffs, and constitutional gate validation.
            </p>
          </div>

          {/* Pipeline Action Button */}
          {onStartPipeline && (
            <button
              onClick={onStartPipeline}
              disabled={isPipelineRunning}
              className={cn(
                "px-5 py-3 rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2.5 transition-all shadow-lg select-none",
                isPipelineRunning
                  ? "bg-purple-950/60 text-purple-200 border border-purple-500/40 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-[0_0_25px_rgba(168,85,247,0.35)] border border-purple-400/30 hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isPipelineRunning ? (
                <>
                  <Loader2 className="size-4 animate-spin text-purple-300" />
                  <span>Agents Executing...</span>
                </>
              ) : (
                <>
                  <Play className="size-4 fill-white" />
                  <span>{completedCount > 0 ? "Rerun 7-Agent Pipeline" : "Start 7-Agent Pipeline"}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Progress Bar & Counter */}
        <div className="mt-6 pt-5 border-t border-white/[0.08]">
          <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-2">
            <span className="flex items-center gap-2">
              <span className="text-purple-400 font-bold text-sm">{completedCount} / 7</span>
              <span>Agents Completed</span>
            </span>
            <span className="text-white/50">{progressPercent}% Completed</span>
          </div>

          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/10">
            <motion.div
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 shadow-[0_0_12px_rgba(168,85,247,0.5)]"
            />
          </div>
        </div>

        {/* Feasibility Gate Halt Alert Banner */}
        {isFeasibilityFailed && (
          <div className="mt-5 p-4 rounded-xl border border-red-500/50 bg-red-950/40 text-red-200 text-xs sm:text-sm font-mono flex items-start gap-3 shadow-[0_0_25px_rgba(239,68,68,0.25)]">
            <ShieldAlert className="size-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-300 text-sm">
                Pipeline halted: Idea did not pass Feasibility.
              </p>
              <p className="text-xs text-red-300/80 mt-1 leading-relaxed">
                {pipelineGate.reason ||
                  "Step 3 did not meet the mandatory 80-point viability threshold. Downstream agents (PRD, System Design, Developer, and Risk Analysis) have been safely halted and disabled."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Vertical Timeline Stepper ── */}
      <div className="relative pl-6 sm:pl-10">
        {/* Continuous Connecting Vertical Spine Line */}
        <div
          className="absolute left-[23px] sm:left-[35px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-purple-500 via-indigo-500 to-emerald-500 opacity-25 pointer-events-none"
          aria-hidden="true"
        />

        <div className="space-y-5">
          {CONSTITUTIONAL_7_STEPS.map((stepDef, index) => {
            const status = stepStatuses[index]?.status || "pending";
            const percent = stepStatuses[index]?.percent ?? 0;
            const liveItem = agentProgress[stepDef.key];
            const isExpanded = expandedStep === stepDef.key;
            const Icon = stepDef.icon;

            // Feasibility Gate rule: if Step 3 failed, Steps 4-7 are grayed out and disabled
            const isDisabledByGate = isFeasibilityFailed && index >= 3;

            return (
              <div key={stepDef.key} className="relative group">
                {/* ── Timeline Node Indicator (Left Spine) ── */}
                <div
                  className={cn(
                    "absolute -left-6 sm:-left-10 top-5 -translate-x-1/2 size-8 sm:size-9 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all z-10 select-none",
                    isDisabledByGate
                      ? "bg-zinc-950 text-zinc-600 border border-zinc-800"
                      : status === "done"
                      ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-300"
                      : status === "running"
                      ? cn("bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.7)] border border-purple-300", shouldAnimate && "animate-pulse")
                      : status === "failed"
                      ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)] border border-red-300"
                      : "bg-[#0A0A14] text-white/40 border border-white/20"
                  )}
                >
                  {isDisabledByGate ? (
                    <Lock className="size-3.5 text-zinc-600" />
                  ) : status === "done" ? (
                    <Check className="size-4 stroke-[3]" />
                  ) : status === "running" ? (
                    <Loader2 className={cn("size-4 text-white", shouldAnimate && "animate-spin")} />
                  ) : status === "failed" ? (
                    <X className="size-4 stroke-[3]" />
                  ) : (
                    <span>{stepDef.step}</span>
                  )}
                </div>

                {/* ── Step Card ── */}
                <div
                  className={cn(
                    "rounded-2xl border transition-all duration-200 overflow-hidden",
                    isDisabledByGate
                      ? "border-zinc-800/40 bg-zinc-950/40 opacity-40 grayscale select-none cursor-not-allowed"
                      : status === "running"
                      ? "border-purple-500/60 bg-purple-950/20 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                      : status === "done"
                      ? "border-emerald-500/30 bg-[#0A0D14]/90 hover:border-emerald-500/50"
                      : status === "failed"
                      ? "border-red-500/40 bg-red-950/20"
                      : "border-white/[0.08] bg-[#07070F]/80 hover:border-white/15"
                  )}
                >
                  {/* Step Header (Click to toggle expansion if not disabled) */}
                  <div
                    onClick={() => {
                      if (isDisabledByGate) return;
                      setExpandedStep(isExpanded ? null : stepDef.key);
                    }}
                    className={cn(
                      "p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 select-none",
                      isDisabledByGate ? "cursor-not-allowed" : "cursor-pointer"
                    )}
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div
                        className="size-10 sm:size-11 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${stepDef.color}15`,
                          borderColor: `${stepDef.color}40`,
                        }}
                      >
                        <Icon className="size-5" style={{ color: stepDef.color }} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
                            Step {stepDef.step}
                          </span>
                          <span className="text-white/20">·</span>
                          <span className="text-xs font-mono font-medium text-purple-300">
                            {stepDef.model}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5 truncate">
                          {stepDef.name}
                        </h3>

                        <p className="text-xs text-white/50 hidden sm:block mt-0.5 truncate">
                          {stepDef.role}
                        </p>
                      </div>
                    </div>

                    {/* Step State Badge & Indicators */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Deliverable Badge */}
                      <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 font-mono text-[11px] text-white/70">
                        {stepDef.deliverableType === "zip" ? (
                          <Archive className="size-3 text-emerald-400" />
                        ) : stepDef.deliverableType === "code" ? (
                          <FileCode className="size-3 text-purple-400" />
                        ) : (
                          <FileText className="size-3 text-cyan-400" />
                        )}
                        <span>{stepDef.deliverable.split(",")[0]}</span>
                      </span>

                      {/* State Pill: Pending (gray), Running (pulsing purple), Done (green check), Failed (red X) */}
                      {isDisabledByGate ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold bg-zinc-800 text-zinc-500 border border-zinc-700">
                          Disabled
                        </span>
                      ) : status === "done" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <Check className="size-3 stroke-[3]" />
                          <span>Done</span>
                        </span>
                      ) : status === "running" ? (
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40",
                          shouldAnimate && "animate-pulse"
                        )}>
                          <span className={cn("size-1.5 rounded-full bg-purple-400", shouldAnimate && "animate-ping")} />
                          <span>Running</span>
                        </span>
                      ) : status === "failed" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                          <X className="size-3 stroke-[3]" />
                          <span>Failed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
                          <Clock className="size-3" />
                          <span>Pending</span>
                        </span>
                      )}

                      {/* Chevron */}
                      {!isDisabledByGate && (
                        <div className="text-white/40 hover:text-white transition-colors">
                          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step Progress Bar with Framer Motion animate={{ width: percent + '%' }} */}
                  {!isDisabledByGate && (
                    <div className="px-4 sm:px-5 pb-3.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-white/50 mb-1.5">
                        <span className="truncate max-w-[80%] text-white/70">
                          {liveItem?.message ||
                            (status === "done"
                              ? "Agent task verified & delivered"
                              : status === "running"
                              ? "Processing step..."
                              : status === "failed"
                              ? "Step execution failed"
                              : "Queued")}
                        </span>
                        <span className="text-purple-300 font-semibold">{percent}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/10">
                        <motion.div
                          initial={false}
                          animate={{ width: isFeasibilityFailed && index >= 3 ? "0%" : `${percent}%` }}
                          transition={shouldAnimate ? { duration: 0.35, ease: "easeInOut" } : { duration: 0 }}
                          className={cn(
                            "h-full rounded-full transition-colors",
                            status === "failed"
                              ? "bg-red-500"
                              : status === "done"
                              ? "bg-emerald-400"
                              : "bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400"
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Expandable Step Content */}
                  <AnimatePresence>
                    {isExpanded && !isDisabledByGate && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="border-t border-white/[0.06] bg-black/30 p-4 sm:p-5 space-y-4"
                      >
                        <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                          {stepDef.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                          <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                            <span className="text-[10px] text-white/40 uppercase block mb-1">
                              Input Handoff Contract
                            </span>
                            <span className="text-white/80">{stepDef.inputContract}</span>
                          </div>

                          <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                            <span className="text-[10px] text-white/40 uppercase block mb-1">
                              Constitutional Deliverable
                            </span>
                            <span className="text-purple-300 font-semibold">{stepDef.deliverable}</span>
                          </div>
                        </div>

                        {/* Step 3: Feasibility Gate Breakdown */}
                        {stepDef.key === "feasibility" && (
                          <div
                            className={cn(
                              "p-3.5 rounded-xl border text-xs font-mono space-y-2",
                              isFeasibilityFailed
                                ? "border-red-500/40 bg-red-950/30 text-red-200"
                                : feasibilityOutput
                                ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-200"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold flex items-center gap-1.5">
                                <ShieldAlert className="size-4" />
                                Constitutional Feasibility Gate
                              </span>
                              {feasibilityOutput?.score !== undefined && (
                                <span className="px-2 py-0.5 rounded font-bold bg-white/10">
                                  Score: {feasibilityOutput.score} / 100 (Threshold: 80)
                                </span>
                              )}
                            </div>
                            <p className="text-xs leading-relaxed opacity-90">
                              Requires a minimum 80-point viability score across Market Size, Differentiation,
                              Timing, and Execution Complexity to proceed to Step 4 (PRD Generator).
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Massive Download Button at Bottom ── */}
      <div className="pt-4">
        <button
          onClick={handleDownload}
          disabled={!step7IsDone}
          className={cn(
            "w-full py-5 px-8 rounded-2xl text-base sm:text-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-3 transition-all select-none shadow-2xl",
            step7IsDone
              ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black shadow-[0_0_35px_rgba(16,185,129,0.45)] cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]"
              : "bg-zinc-900/80 border border-white/10 text-zinc-500 cursor-not-allowed opacity-50"
          )}
          aria-label={
            step7IsDone
              ? "Download complete project ZIP"
              : "Download project ZIP is disabled until Step 7 completes"
          }
        >
          <div className="flex items-center gap-3">
            <Download className="size-6 shrink-0" />
            <span className="tracking-wide">
              {step7IsDone ? "Download Project Zip" : "Download Project Zip (Awaiting Step 7)"}
            </span>
          </div>

          {step7IsDone && (
            <span className="text-xs font-mono font-medium text-black/70 bg-black/10 px-2.5 py-1 rounded-full">
              Full Stack Scaffolding + All 7 Agent Deliverables
            </span>
          )}
        </button>

        {!step7IsDone && (
          <p className="text-center text-xs font-mono text-zinc-500 mt-2">
            The complete project package (.zip) unlocks automatically once Step 7 (Risk Analysis) completes.
          </p>
        )}
      </div>
    </div>
  );
});
