"use client";

import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Search,
  ShieldAlert,
  Target,
  Database,
  Code2,
  ShieldCheck,
  CheckCircle2,
  LoaderCircle,
  Clock,
  Play,
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
  FileCode,
  Archive,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PipelineOutputs, PipelineStatusResponse, PipelineStatus } from "@/types/api";

export interface ConstitutionalAgentStep {
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

export const CONSTITUTIONAL_7_AGENTS: ConstitutionalAgentStep[] = [
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
      "Validates acute user pain severity, defines ICP target personas, audits legacy alternatives, and analyzes the 'Why now?' market window.",
    icon: Lightbulb,
    color: "#06B6D4", // Cyan
  },
  {
    step: 2,
    key: "market_analysis",
    name: "Market Analysis",
    role: "Competitive Landscape & Market Sizing",
    model: "Gemini 2.0 Flash (Tavily API)",
    inputContract: "problem.md from Agent 1",
    deliverable: "market.md",
    deliverableType: "markdown",
    description:
      "Performs live web competitive scanning, estimates TAM/SAM/SOM market boundaries, and analyzes defensibility and moat vectors.",
    icon: Search,
    color: "#6366F1", // Indigo
  },
  {
    step: 3,
    key: "feasibility",
    name: "Feasibility Assessment",
    role: "Constitutional Viability Gate (100-pt Rubric)",
    model: "Gemini 2.0 Flash (Structured JSON)",
    inputContract: "problem.md, market.md",
    deliverable: "feasibility.json",
    deliverableType: "json",
    description:
      "Constitutional Gatekeeper: Evaluates market size (30), differentiation (30), timing (20), and execution complexity (20). Score < 80 immediately halts pipeline.",
    icon: ShieldAlert,
    color: "#F59E0B", // Amber
  },
  {
    step: 4,
    key: "prd_generator",
    name: "PRD Generator",
    role: "Product Requirements & MoSCoW Specification",
    model: "Gemini 2.0 Flash (Pydantic Schema)",
    inputContract: "problem.md, market.md, feasibility.json (Score ≥ 80)",
    deliverable: "PRD.md",
    deliverableType: "markdown",
    description:
      "Authors complete 8-section product specification: MVP features (F-01 to F-06 tagged [Must-Have]), User Stories (US-01 to US-08), and Non-Goals.",
    icon: Target,
    color: "#EC4899", // Pink
  },
  {
    step: 5,
    key: "design",
    name: "System Design",
    role: "Architecture, Relational DDL & API Specs",
    model: "Gemini 2.0 Flash (SQL & OpenAPI Validators)",
    inputContract: "PRD.md from Agent 4",
    deliverable: "architecture.md, schema.sql, openapi.yaml, wireframes.md",
    deliverableType: "code",
    description:
      "Synthesizes C4 Mermaid system architecture, 3NF PostgreSQL DDL schema with foreign keys/indices, OpenAPI 3.1 specification, and ASCII wireframes.",
    icon: Database,
    color: "#8B5CF6", // Purple
  },
  {
    step: 6,
    key: "developer",
    name: "Autonomous Developer",
    role: "Codebase Build, Test & Packaging",
    model: "DeepSeek Coder (OpenAI API Compat)",
    inputContract: "All Design Artifacts + PRD.md",
    deliverable: "orbit.zip",
    deliverableType: "zip",
    description:
      "Autonomous full-stack scaffolding (FastAPI + Next.js 15). Executes builds & test suites in isolated sandbox, applies self-healing repair loops, and packages orbit.zip.",
    icon: Code2,
    color: "#10B981", // Emerald
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
      "Conducts multi-vector risk audit (≥ 10 quantified risks across Technical, Market, Execution, Regulatory) and establishes Top-3 Watch List with mitigations.",
    icon: ShieldCheck,
    color: "#EF4444", // Red
  },
];

interface ConstitutionalAgentTimelineProps {
  projectId: string;
  projectName: string;
  pipelineStatus?: PipelineStatus | string;
  statusData?: PipelineStatusResponse | null;
  outputs?: PipelineOutputs;
  isStarting?: boolean;
  onStartPipeline: () => void;
  onDownloadZip?: () => void;
}

export const ConstitutionalAgentTimeline = memo(function ConstitutionalAgentTimeline({
  projectId,
  projectName,
  pipelineStatus = "idle",
  statusData,
  outputs = {},
  isStarting = false,
  onStartPipeline,
  onDownloadZip,
}: ConstitutionalAgentTimelineProps) {
  // Local state for expanded agent cards
  const [expandedAgent, setExpandedAgent] = useState<string | null>("problem_discovery");

  // Determine current active agent step and completion status
  const runs = statusData?.runs || [];
  const isPipelineRunning = isStarting || pipelineStatus === "running" || pipelineStatus === "queued";
  const isPipelineCompleted = pipelineStatus === "completed" || (!isPipelineRunning && runs.length > 0 && runs.every((r) => r.status === "success"));

  const getAgentStatus = useCallback(
    (agentKey: string, stepIndex: number): "completed" | "running" | "waiting" | "failed" => {
      // Optimistic instant feedback: if starting, step 1 is instantly marked running
      if (isStarting && stepIndex === 0) return "running";

      const matchedRun = runs.find((r) => r.stage === agentKey);
      if (matchedRun) {
        if (matchedRun.status === "success" || matchedRun.status === "completed") return "completed";
        if (matchedRun.status === "running" || matchedRun.status === "in_progress") return "running";
        if (matchedRun.status === "failed") return "failed";
      }

      // If pipeline completed, mark all previous as completed
      if (isPipelineCompleted) return "completed";

      // If pipeline is running and no specific run found, estimate based on outputs or previous
      if (outputs[agentKey as keyof PipelineOutputs]) return "completed";

      return "waiting";
    },
    [runs, isStarting, isPipelineCompleted, outputs]
  );

  const completedCount = CONSTITUTIONAL_7_AGENTS.filter(
    (agent, idx) => getAgentStatus(agent.key, idx) === "completed"
  ).length;

  const progressPercentage = Math.round((completedCount / 7) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* ── Top Pipeline Control Header ── */}
      <div className="rounded-2xl border border-white/10 bg-[#0B0D14]/90 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-[11px] font-mono text-cyan-300 mb-2">
              <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>ORBIT 7-AGENT CONSTITUTIONAL PIPELINE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {projectName}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Strict linear execution: 7 specialized autonomous agents with independent model routing and immutable handoff gates.
            </p>
          </div>

          {/* Action Island */}
          <div className="flex items-center gap-3">
            {outputs?.developer || isPipelineCompleted ? (
              <button
                onClick={onDownloadZip}
                className="px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-mono text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                <Download className="size-4" />
                <span>Download orbit.zip</span>
              </button>
            ) : null}

            <button
              onClick={onStartPipeline}
              disabled={isPipelineRunning}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-2 transition-all shadow-lg",
                isPipelineRunning
                  ? "bg-indigo-600/50 text-white/70 cursor-not-allowed border border-indigo-400/20"
                  : "bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-[0_0_25px_rgba(99,102,241,0.4)] border border-indigo-400/30 hover:scale-[1.02]"
              )}
            >
              {isPipelineRunning ? (
                <>
                  <LoaderCircle className="size-4 animate-spin text-cyan-300" />
                  <span>Agents Executing...</span>
                </>
              ) : (
                <>
                  <Play className="size-4 fill-white" />
                  <span>{completedCount > 0 ? "Rerun 7-Agent Pipeline" : "Start 7-Agent Pipeline"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Linear Progress Bar ── */}
        <div className="mt-6 pt-5 border-t border-white/[0.08]">
          <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-2">
            <span className="flex items-center gap-2">
              <span className="text-cyan-400 font-semibold">{completedCount} / 7</span> Agents Completed
            </span>
            <span className="text-white/40">{progressPercentage}% Pipeline Progress</span>
          </div>

          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/10">
            <motion.div
              initial={false}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* ── Strict Vertical Stepper / Timeline ── */}
      <div className="relative pl-6 sm:pl-8">
        {/* Continuous Connecting Guide Line */}
        <div className="absolute left-[23px] sm:left-[31px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-cyan-500 via-indigo-500 via-purple-500 to-emerald-500 opacity-30 pointer-events-none" />

        <div className="space-y-4">
          {CONSTITUTIONAL_7_AGENTS.map((agent, index) => {
            const status = getAgentStatus(agent.key, index);
            const isExpanded = expandedAgent === agent.key;
            const Icon = agent.icon;

            return (
              <div key={agent.key} className="relative group">
                {/* ── Left Step Node Circle ── */}
                <div
                  className={cn(
                    "absolute -left-6 sm:-left-8 top-5 -translate-x-1/2 size-7 sm:size-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all z-10",
                    status === "completed"
                      ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-300"
                      : status === "running"
                      ? "bg-cyan-500 text-white shadow-[0_0_18px_rgba(6,182,212,0.6)] border border-cyan-300 animate-pulse"
                      : status === "failed"
                      ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-300"
                      : "bg-[#0A0A14] text-white/40 border border-white/20"
                  )}
                >
                  {status === "completed" ? (
                    <CheckCircle2 className="size-4" />
                  ) : status === "running" ? (
                    <LoaderCircle className="size-4 animate-spin text-white" />
                  ) : (
                    <span>{agent.step}</span>
                  )}
                </div>

                {/* ── Agent Card Box ── */}
                <div
                  className={cn(
                    "rounded-2xl border transition-all duration-200 overflow-hidden",
                    status === "running"
                      ? "border-cyan-500/50 bg-[#0E121E]/95 shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                      : status === "completed"
                      ? "border-emerald-500/20 bg-[#0A0D14]/90 hover:border-emerald-500/40"
                      : "border-white/[0.08] bg-[#07070F]/80 hover:border-white/15"
                  )}
                >
                  {/* Card Header (Click to toggle accordion) */}
                  <div
                    onClick={() => setExpandedAgent(isExpanded ? null : agent.key)}
                    className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div
                        className="size-10 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${agent.color}15`,
                          borderColor: `${agent.color}40`,
                        }}
                      >
                        <Icon className="size-5" style={{ color: agent.color }} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
                            Phase {agent.step}
                          </span>
                          <span className="text-white/20">·</span>
                          <span className="text-xs font-mono font-medium text-cyan-400">
                            {agent.model}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                          {agent.name}
                        </h3>

                        <p className="text-xs text-white/50 hidden sm:block mt-0.5">
                          {agent.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Deliverable Badge */}
                      <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 font-mono text-[11px] text-white/70">
                        {agent.deliverableType === "zip" ? (
                          <Archive className="size-3 text-emerald-400" />
                        ) : agent.deliverableType === "code" ? (
                          <FileCode className="size-3 text-purple-400" />
                        ) : (
                          <FileText className="size-3 text-cyan-400" />
                        )}
                        <span>{agent.deliverable.split(",")[0]}</span>
                      </span>

                      {/* Status Pill */}
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold",
                          status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : status === "running"
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse"
                            : "bg-white/5 text-white/40 border border-white/10"
                        )}
                      >
                        {status}
                      </span>

                      {/* Accordion Chevron */}
                      <div className="text-white/40 hover:text-white transition-colors">
                        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Agent Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="border-t border-white/[0.06] bg-black/30 p-4 sm:p-5 space-y-4"
                      >
                        <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                          {agent.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                          <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                            <span className="text-[10px] text-white/40 uppercase block mb-1">
                              Input Handoff Contract
                            </span>
                            <span className="text-white/80">{agent.inputContract}</span>
                          </div>

                          <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                            <span className="text-[10px] text-white/40 uppercase block mb-1">
                              Constitutional Deliverable
                            </span>
                            <span className="text-cyan-300 font-semibold">{agent.deliverable}</span>
                          </div>
                        </div>

                        {/* Special Feasibility Gate Callout */}
                        {agent.key === "feasibility" && (
                          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs font-mono flex items-center gap-2.5">
                            <ShieldAlert className="size-4 text-amber-400 shrink-0" />
                            <span>
                              <strong>Constitutional Gate Rule:</strong> Score &lt; 80 triggers pipeline halt with <code>stopped_low_feasibility</code>. Upstream agents are locked.
                            </span>
                          </div>
                        )}

                        {/* Developer orbit.zip download prompt */}
                        {agent.key === "developer" && (outputs?.developer || isPipelineCompleted) && (
                          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
                              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                              <span>Codebase generated, tested, and bundled into orbit.zip</span>
                            </div>

                            <button
                              onClick={onDownloadZip}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <Download className="size-3.5" />
                              <span>Download Code</span>
                            </button>
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
    </div>
  );
});

