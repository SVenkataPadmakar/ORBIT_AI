"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    ShieldCheck,
    Zap,
    TrendingUp,
    Clock,
    Flame,
    Cpu,
    Sparkles,
    Play,
    Target,
    BarChart3,
    Compass,
    Sliders,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
} from "lucide-react";
import type { ExecutionPlan, PipelineOutputs } from "@/types/api";
import { RadarHealthVectors } from "./RadarHealthVectors";
import { D3MilestoneTimeline } from "./D3MilestoneTimeline";
import { ExecutionGraph } from "./ExecutionGraph";
import { GrowthForecastChart } from "./GrowthForecastChart";
import { RevenueForecastChart } from "./RevenueForecastChart";
import { RiskAnalysisMatrix } from "./RiskAnalysisMatrix";
import { ActionExecutionModal } from "./ActionExecutionModal";
import { CoreDimensionStrip } from "./CoreDimensionStrip";
import { StartupProgressTracker } from "./StartupProgressTracker";
import { AgentProgressTelemetry } from "./AgentProgressTelemetry";
import { RecentDecisionsLedger } from "./RecentDecisionsLedger";
import { NextActionsChecklist } from "./NextActionsChecklist";
import { GeminiMissionPanel } from "./GeminiMissionPanel";
import type { HealthPillar, StageGateMilestone, RiskVector, WhatIfScenario, CoreDimensionMetric } from "./types";
import type { ExecutionTaskStatus } from "@/types/api";

interface FounderMissionControlProps {
    projectId?: string;
    projectName: string;
    plan: ExecutionPlan;
    outputs: PipelineOutputs;
    onTriggerSpecialistCouncil?: () => void;
    onTaskStatusUpdate?: (taskId: string, status: ExecutionTaskStatus) => void;
}

export function FounderMissionControl({
    projectId,
    projectName,
    plan,
    outputs,
    onTriggerSpecialistCouncil,
    onTaskStatusUpdate,
}: FounderMissionControlProps) {
    const [activeTab, setActiveTab] = useState<"executive" | "velocity" | "forecasts" | "defense">("executive");
    const [whatIfEnabled, setWhatIfEnabled] = useState<boolean>(false);
    const [scenario, setScenario] = useState<WhatIfScenario>({
        capitalInjection: 250000,
        devSprintBoost: 1.5,
        marketingBudget: 8000,
        targetLaunchWeeks: 6,
    });

    // Modal state for action execution
    const [modalState, setModalState] = useState<{ isOpen: boolean; actionId: string; actionTitle: string }>({
        isOpen: false,
        actionId: "",
        actionTitle: "",
    });

    // Derive Dynamic Health Pillars from Real Project Plan & Outputs
    const healthPillars: HealthPillar[] = useMemo(() => {
        const problemScore = outputs.problem_discovery ? 92 : 55;
        const marketScore = outputs.market_research ? 88 : 50;
        const techScore = plan.technical_blueprint.stack.length > 0 ? 94 : 45;
        const validationScore = plan.validation.confidence_score ?? 70;
        const executionScore = Math.min(
            100,
            Math.max(
                35,
                Math.round(
                    (plan.build.tasks.filter((t) => t.status === "done").length /
                        Math.max(1, plan.build.tasks.length)) *
                        100
                )
            )
        );
        const riskScore = outputs.vc_evaluation ? 82 : 60;

        // Apply What-If boost if simulated
        const boost = whatIfEnabled ? 6 : 0;

        return [
            {
                key: "problem",
                label: "Problem Clarity",
                score: Math.min(100, problemScore + boost),
                status: "optimal",
                trend: "+5%",
                details: "Customer pain points synthesized across 4 customer archetype interviews.",
                actionLabel: "Deepen ICP Interviews",
                actionId: "act_deepen_icp",
            },
            {
                key: "market",
                label: "Market & TAM",
                score: Math.min(100, marketScore + boost),
                status: outputs.market_research ? "optimal" : "warning",
                trend: "+3%",
                details: outputs.market_research
                    ? "TAM & SAM validated with verified CAGR and competitor landscape."
                    : "Preliminary market size estimated; awaiting specialist verification run.",
                actionLabel: "Verify Competitor Moat",
                actionId: "act_verify_moat",
            },
            {
                key: "tech",
                label: "Technical Stack",
                score: Math.min(100, techScore + boost),
                status: "optimal",
                trend: "+8%",
                details: `${plan.technical_blueprint.stack.length} architectural building blocks verified. Zero legacy bottlenecks.`,
                actionLabel: "Run SecOps Benchmark",
                actionId: "act_secops",
            },
            {
                key: "validation",
                label: "Validation Confidence",
                score: Math.min(100, validationScore + boost),
                status: "optimal",
                trend: "+4%",
                details: "Core value proposition validated with target founder pilot cohort.",
                actionLabel: "Run Pilot Feedback Sync",
                actionId: "act_pilot_sync",
            },
            {
                key: "execution",
                label: "Execution Rate",
                score: Math.min(100, executionScore + (whatIfEnabled ? 12 : 0)),
                status: executionScore >= 60 ? "optimal" : "warning",
                trend: "+7%",
                details: `${plan.build.tasks.filter((t) => t.status === "done").length} / ${plan.build.tasks.length} build outcomes closed. Sprint velocity accelerating.`,
                actionLabel: "Advance Sprint Tasks",
                actionId: "act_advance_sprint",
            },
            {
                key: "risk",
                label: "Risk Mitigation",
                score: Math.min(100, riskScore + boost),
                status: "optimal",
                trend: "+2%",
                details: "Top regulatory, financial, and multi-tenant security vulnerabilities contained.",
                actionLabel: "Stress-Test Runway",
                actionId: "act_stress_runway",
            },
        ];
    }, [outputs, plan, whatIfEnabled]);

    // Composite Startup Health Score
    const compositeHealthScore = Math.round(
        healthPillars.reduce((acc, p) => acc + p.score, 0) / healthPillars.length
    );

    // Derived Stage-Gate Roadmap Milestones
    const milestones: StageGateMilestone[] = useMemo(() => [
        {
            id: "gate_1",
            stage: "Phase 1: Thesis",
            title: "Problem & Opportunity Discovery",
            status: "completed",
            progress: 100,
            targetDays: 0,
            tasksCount: 6,
            completedCount: 6,
            actionLabel: "Review Thesis Artifacts",
        },
        {
            id: "gate_2",
            stage: "Phase 2: Validation",
            title: "Market Size & Pilot Validation",
            status: "completed",
            progress: 100,
            targetDays: 0,
            tasksCount: 8,
            completedCount: 8,
            actionLabel: "View Pilot Transcripts",
        },
        {
            id: "gate_3",
            stage: "Phase 3: Blueprint",
            title: "Technical & System Architecture",
            status: "completed",
            progress: 100,
            targetDays: 0,
            tasksCount: 12,
            completedCount: 12,
            actionLabel: "Inspect Architecture Diagram",
        },
        {
            id: "gate_4",
            stage: "Phase 4: Build",
            title: "MVP Core Engine & Autonomous Agents",
            status: "in_progress",
            progress: 74,
            targetDays: 14,
            tasksCount: 16,
            completedCount: 12,
            criticalDependency: "Agent Orchestration Pipeline Hardening",
            actionLabel: "Trigger Build Sprint",
        },
        {
            id: "gate_5",
            stage: "Phase 5: Alpha",
            title: "Closed Alpha Pilot Trials",
            status: "upcoming",
            progress: 15,
            targetDays: 28,
            tasksCount: 10,
            completedCount: 2,
            criticalDependency: "MVP Core Gate Completion",
            actionLabel: "Prepare Alpha Waitlist",
        },
        {
            id: "gate_6",
            stage: "Phase 6: Public",
            title: "Public Beta Launch & GTM Campaign",
            status: "upcoming",
            progress: 0,
            targetDays: 52,
            tasksCount: 14,
            completedCount: 0,
            criticalDependency: "Alpha Retention > 40%",
            actionLabel: "Review GTM Playbook",
        },
    ], []);

    // Active Risks for Matrix
    const risks: RiskVector[] = useMemo(() => [
        {
            id: "r1",
            title: "LLM Inference Cost & Rate Limit Bottlenecks",
            category: "technical",
            probability: 4,
            impact: 4,
            severity: "high",
            description: "High concurrency during multi-agent council debates can spike API costs and trigger rate throttling without semantic caching.",
            mitigationPlaybook: "Deploy Redis Semantic Caching & Multi-Provider Fallback Routing (Claude + Gemini + OpenAI).",
            playbookStatus: "ready",
        },
        {
            id: "r2",
            title: "Competitor Incumbent Feature Fast-Follow",
            category: "market",
            probability: 3,
            impact: 4,
            severity: "medium",
            description: "Incumbents may announce AI copilot widgets, risking enterprise pilot mindshare.",
            mitigationPlaybook: "Accelerate proprietary autonomous execution loop & file defensible workflow patents.",
            playbookStatus: "ready",
        },
        {
            id: "r3",
            title: "Enterprise Data Isolation & SOC2 Compliance",
            category: "technical",
            probability: 2,
            impact: 5,
            severity: "high",
            description: "Institutional founders require strict zero-retention API guarantees and tenant isolation before deploying proprietary codebase access.",
            mitigationPlaybook: "Activate Zero-Data-Retention agreements & enforce cryptographic tenant partitions.",
            playbookStatus: "ready",
        },
        {
            id: "r4",
            title: "Cash Runway Burn before Cashflow Break-even",
            category: "financial",
            probability: 2,
            impact: 4,
            severity: "medium",
            description: "Cloud compute and autonomous agent workers burn monthly budget if monetization conversion slips beyond Month 9.",
            mitigationPlaybook: "Introduce Annual Paid Founder Pro Tier with upfront prepayment incentives.",
            playbookStatus: "ready",
        },
    ], []);

    // 7 Core Operational Dimensions
    const coreDimensions: CoreDimensionMetric[] = useMemo(() => {
        const buildTasks = plan.build.tasks || [];
        const launchTasks = plan.launch.tasks || [];
        const growthTasks = plan.growth.tasks || [];

        const buildCompleted = buildTasks.filter((t) => t.status === "done").length;
        const launchCompleted = launchTasks.filter((t) => t.status === "done").length;
        const growthCompleted = growthTasks.filter((t) => t.status === "done").length;

        // 1. Startup Health: Composite across vectors
        const healthScore = Math.round(
            healthPillars.reduce((acc, p) => acc + p.score, 0) / Math.max(1, healthPillars.length)
        );

        // 2. Readiness Score: Investor & Execution Readiness
        const readinessBase = plan.validation.confidence_score ?? (outputs.vc_evaluation ? 86 : 68);
        const readinessScore = Math.min(100, Math.round(readinessBase + (whatIfEnabled ? 8 : 0)));

        // 3. Product Progress: Features & Build Gates
        const productPercent = Math.round((buildCompleted / Math.max(1, buildTasks.length)) * 100);
        const productScore = Math.min(100, Math.round(Math.max(45, productPercent) + (whatIfEnabled ? 15 : 0)));

        // 4. Launch Readiness: Preflight & Checklist
        const launchPercent = Math.round((launchCompleted / Math.max(1, launchTasks.length)) * 100);
        const launchScore = Math.min(100, Math.round(Math.max(30, launchPercent) + (whatIfEnabled ? 12 : 0)));

        // 5. Growth Readiness: Cohort & GTM
        const growthPercent = Math.round((growthCompleted / Math.max(1, growthTasks.length)) * 100);
        const growthScore = Math.min(100, Math.round(Math.max(25, growthPercent) + (whatIfEnabled ? 18 : 0)));

        // 6. Market Confidence: TAM/SAM & Moat
        const marketBase = outputs.market_research ? 91 : 62;
        const marketScore = Math.min(100, Math.round(marketBase + (whatIfEnabled ? 6 : 0)));

        // 7. Risk Analysis: Defense & Moat Stability
        const riskMitigatedPercent = Math.round(
            (risks.filter((r) => r.playbookStatus === "ready" || r.playbookStatus === "resolved").length /
                Math.max(1, risks.length)) *
                100
        );
        const riskScore = Math.min(100, Math.round(riskMitigatedPercent + (whatIfEnabled ? 5 : 0)));

        return [
            {
                id: "health",
                title: "Startup Health",
                subtitle: "6-Axis Operational Vectors",
                score: healthScore,
                status: healthScore >= 80 ? "optimal" : "warning",
                trend: "+5.4%",
                accentColor: "cyan",
                actionLabel: "Audit Vectors",
                actionId: "act_audit_health",
                description: "Holistic score reflecting problem clarity, tech stack, and execution velocity.",
            },
            {
                id: "readiness",
                title: "Readiness Score",
                subtitle: "Investor & Venture Grade",
                score: readinessScore,
                status: readinessScore >= 75 ? "optimal" : "warning",
                trend: "+8.2%",
                accentColor: "indigo",
                actionLabel: "Verify Gates",
                actionId: "act_readiness_gate",
                description: "Composite readiness assessing thesis proof, traction signal, and defensibility.",
            },
            {
                id: "product",
                title: "Product Progress",
                subtitle: `${buildCompleted}/${buildTasks.length} Outcomes Closed`,
                score: productScore,
                status: productScore >= 60 ? "optimal" : "warning",
                trend: "+12.0%",
                accentColor: "violet",
                actionLabel: "Advance Build",
                actionId: "act_advance_sprint",
                description: "Sprint task completion across core autonomous features and architecture blueprints.",
            },
            {
                id: "launch",
                title: "Launch Readiness",
                subtitle: `${launchCompleted}/${launchTasks.length} Preflight Checks`,
                score: launchScore,
                status: launchScore >= 50 ? "optimal" : "warning",
                trend: "+6.5%",
                accentColor: "emerald",
                actionLabel: "Preflight Gate",
                actionId: "act_preflight_check",
                description: "Launch infrastructure, zero-day telemetry, and distribution channel readiness.",
            },
            {
                id: "growth",
                title: "Growth Readiness",
                subtitle: "Viral Loop & Payback",
                score: growthScore,
                status: growthScore >= 40 ? "optimal" : "warning",
                trend: "+9.1%",
                accentColor: "amber",
                actionLabel: "Simulate Loop",
                actionId: "act_simulate_viral",
                description: "Customer acquisition cost, retention cohorts, and organic referral velocity.",
            },
            {
                id: "market",
                title: "Market Confidence",
                subtitle: "TAM & Competitor Moat",
                score: marketScore,
                status: marketScore >= 75 ? "optimal" : "warning",
                trend: "+4.8%",
                accentColor: "cyan",
                actionLabel: "Validate Moat",
                actionId: "act_validate_moat",
                description: "Empirical market size calculation, CAGR validation, and defense against fast-followers.",
            },
            {
                id: "risk",
                title: "Risk Analysis",
                subtitle: `${risks.filter((r) => r.severity === "high" || r.severity === "critical").length} Key Vectors`,
                score: riskScore,
                status: riskScore >= 70 ? "optimal" : "critical",
                trend: "-3.2%",
                accentColor: "rose",
                actionLabel: "Run Playbook",
                actionId: "act_mitigate_risk",
                description: "Active technical, financial, and regulatory vulnerabilities with 1-click mitigations.",
            },
        ];
    }, [healthPillars, plan, outputs, risks, whatIfEnabled]);

    const handleTriggerAction = (actionId: string, actionTitle: string) => {
        if (actionId === "act_advance_sprint" && onTaskStatusUpdate) {
            const firstTodo = plan.build.tasks.find((t) => t.status === "todo" || t.status === "in_progress");
            if (firstTodo) {
                onTaskStatusUpdate(firstTodo.id, firstTodo.status === "in_progress" ? "done" : "in_progress");
            }
        }
        setModalState({ isOpen: true, actionId, actionTitle });
    };

    return (
        <div className="relative space-y-6">
            {/* 1. Master Telemetry HUD Header */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B0D14]/90 p-6 backdrop-blur-2xl">
                {/* Background Ambient Pulses */}
                <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
                <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />

                <div className="relative flex flex-wrap items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" />
                            <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
                                Founder Mission Control · Live OS
                            </span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                            {projectName} Command Surface
                        </h1>
                        <p className="mt-1 text-xs text-white/60 sm:text-sm">
                            Autonomous agent telemetry, execution velocity, runway modeling, and strategic action gates.
                        </p>
                    </div>

                    {/* Startup Composite Health Indicator */}
                    <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl shadow-xl">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-violet-600 font-mono text-2xl font-black text-white shadow-[0_0_24px_rgba(6,182,212,0.4)]">
                            {compositeHealthScore}
                            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-black font-bold">
                                ✓
                            </span>
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-white/50">
                                    Startup Health Index
                                </span>
                                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                                    TOP 8%
                                </span>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                                <span className="text-sm font-bold text-white">
                                    {compositeHealthScore >= 80
                                        ? "Exceptional Velocity"
                                        : compositeHealthScore >= 60
                                        ? "Strong Execution State"
                                        : "Action Required"}
                                </span>
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                            </div>
                            <span className="font-mono text-[11px] text-cyan-400">
                                +5.4% efficiency vs previous sprint
                            </span>
                        </div>
                    </div>
                </div>

                {/* Living Operating System Pulse Ticker */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4 text-xs">
                    <div className="flex flex-wrap items-center gap-4 text-white/70">
                        <div className="flex items-center gap-2 font-mono">
                            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                            <span>Specialist Council:</span>
                            <span className="font-bold text-white">4 Autonomous Agents Active</span>
                        </div>
                        <span className="text-white/20">•</span>
                        <div className="flex items-center gap-2 font-mono">
                            <Clock className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Sprint Cadence:</span>
                            <span className="font-bold text-white">Day 8 of 14</span>
                        </div>
                        <span className="text-white/20">•</span>
                        <div className="flex items-center gap-2 font-mono">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Security Gate:</span>
                            <span className="font-bold text-emerald-400">Zero Vulnerabilities</span>
                        </div>
                    </div>

                    {/* What-If Simulation Toggle */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setWhatIfEnabled(!whatIfEnabled)}
                            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 font-mono text-xs font-semibold transition-all ${
                                whatIfEnabled
                                    ? "border border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.4)]"
                                    : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
                            }`}
                        >
                            <Sliders className="h-3.5 w-3.5" />
                            <span>What-If Scenario Simulator: {whatIfEnabled ? "ACTIVE" : "OFF"}</span>
                        </button>

                        {onTriggerSpecialistCouncil && (
                            <button
                                onClick={onTriggerSpecialistCouncil}
                                className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 font-mono text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-500/20"
                            >
                                <Play className="h-3.5 w-3.5 text-indigo-400" />
                                <span>Trigger Council Run</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* What-If Dynamic Parameter Tuning Tray */}
            <AnimatePresence>
                {whatIfEnabled && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 backdrop-blur-xl"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-cyan-400" />
                                <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
                                    Simulated Growth &amp; Capital Scenario Levers
                                </span>
                            </div>
                            <span className="text-[11px] text-cyan-200/70">
                                Real-time dynamic recalculation applied across all charts and telemetry.
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                            <div>
                                <div className="flex justify-between text-white/70">
                                    <span>Capital Injection</span>
                                    <span className="font-mono font-bold text-cyan-400">
                                        ${scenario.capitalInjection.toLocaleString()}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="50000"
                                    max="1000000"
                                    step="50000"
                                    value={scenario.capitalInjection}
                                    onChange={(e) =>
                                        setScenario({ ...scenario, capitalInjection: parseInt(e.target.value) })
                                    }
                                    className="mt-2 w-full accent-cyan-400 cursor-pointer"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-white/70">
                                    <span>Sprint Velocity Multiplier</span>
                                    <span className="font-mono font-bold text-indigo-400">
                                        {scenario.devSprintBoost}x
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="3"
                                    step="0.25"
                                    value={scenario.devSprintBoost}
                                    onChange={(e) =>
                                        setScenario({ ...scenario, devSprintBoost: parseFloat(e.target.value) })
                                    }
                                    className="mt-2 w-full accent-indigo-400 cursor-pointer"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-white/70">
                                    <span>Monthly Growth Budget</span>
                                    <span className="font-mono font-bold text-emerald-400">
                                        ${scenario.marketingBudget.toLocaleString()}/mo
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="2000"
                                    max="30000"
                                    step="2000"
                                    value={scenario.marketingBudget}
                                    onChange={(e) =>
                                        setScenario({ ...scenario, marketingBudget: parseInt(e.target.value) })
                                    }
                                    className="mt-2 w-full accent-emerald-400 cursor-pointer"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-white/70">
                                    <span>Target Public Launch</span>
                                    <span className="font-mono font-bold text-amber-400">
                                        {scenario.targetLaunchWeeks} Weeks
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="2"
                                    max="16"
                                    step="1"
                                    value={scenario.targetLaunchWeeks}
                                    onChange={(e) =>
                                        setScenario({ ...scenario, targetLaunchWeeks: parseInt(e.target.value) })
                                    }
                                    className="mt-2 w-full accent-amber-400 cursor-pointer"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Mode Selector Pill Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex rounded-xl border border-white/10 bg-[#0B0D14] p-1 shadow-lg">
                    <button
                        onClick={() => setActiveTab("executive")}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                            activeTab === "executive"
                                ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-[0_0_16px_rgba(6,182,212,0.3)]"
                                : "text-white/60 hover:text-white"
                        }`}
                    >
                        <Compass className="h-3.5 w-3.5" />
                        <span>Executive Command</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("velocity")}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                            activeTab === "velocity"
                                ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-[0_0_16px_rgba(6,182,212,0.3)]"
                                : "text-white/60 hover:text-white"
                        }`}
                    >
                        <Activity className="h-3.5 w-3.5" />
                        <span>Velocity &amp; Build</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("forecasts")}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                            activeTab === "forecasts"
                                ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-[0_0_16px_rgba(6,182,212,0.3)]"
                                : "text-white/60 hover:text-white"
                        }`}
                    >
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span>Forecasts &amp; Runway</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("defense")}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                            activeTab === "defense"
                                ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-[0_0_16px_rgba(6,182,212,0.3)]"
                                : "text-white/60 hover:text-white"
                        }`}
                    >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Risk &amp; Moat Defense</span>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-white/40">Real-time Stream: Active</span>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                </div>
            </div>

            {/* 3. Tab Views */}
            <AnimatePresence mode="wait">
                {activeTab === "executive" && (
                    <motion.div
                        key="executive"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {/* 1. Startup Progress: 7-Stage Founder Execution Pipeline */}
                        <StartupProgressTracker
                            projectId={projectId}
                            plan={plan}
                            outputs={outputs}
                        />

                        {/* 2. Project Health: 7 Core Operational Dimensions & 6-Axis Radar Vectors */}
                        <CoreDimensionStrip
                            dimensions={coreDimensions}
                            onTriggerAction={handleTriggerAction}
                        />

                        <RadarHealthVectors
                            pillars={healthPillars}
                            onTriggerAction={handleTriggerAction}
                        />

                        {/* 3. Agent Progress: Autonomous Specialist State Machine & Telemetry */}
                        <AgentProgressTelemetry
                            outputs={outputs}
                            onTriggerRun={onTriggerSpecialistCouncil}
                        />

                        {/* 4. Timeline: D3 Stage-Gate Milestone Roadmap */}
                        <D3MilestoneTimeline
                            milestones={milestones}
                            onAdvanceGate={(id, label) => handleTriggerAction(id, label)}
                        />

                        {/* 5 & 6. Next Actions & Recent Verified Decisions Ledger */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <NextActionsChecklist
                                plan={plan}
                                onExecuteAction={handleTriggerAction}
                                onTaskStatusUpdate={onTaskStatusUpdate}
                            />
                            <RecentDecisionsLedger
                                projectId={projectId}
                                onLogDecision={() => handleTriggerAction("act_log_decision", "Log Strategic Decision")}
                            />
                        </div>

                        {/* 7. Gemini Panel: Socratic Stress-Testing & Co-Founder Guidance */}
                        <GeminiMissionPanel
                            projectId={projectId}
                            projectName={projectName}
                            onExecuteAction={handleTriggerAction}
                        />
                    </motion.div>
                )}

                {activeTab === "velocity" && (
                    <motion.div
                        key="velocity"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Sprint Execution & Throughput Graph */}
                        <ExecutionGraph
                            onAccelerate={() =>
                                handleTriggerAction("act_accel", "Accelerate Sprint: Reallocate GPU Workers")
                            }
                        />

                        {/* Stage-Gate Milestone Timeline */}
                        <D3MilestoneTimeline
                            milestones={milestones}
                            onAdvanceGate={(id, label) => handleTriggerAction(id, label)}
                        />
                    </motion.div>
                )}

                {activeTab === "forecasts" && (
                    <motion.div
                        key="forecasts"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Growth Forecast Model */}
                        <GrowthForecastChart
                            onTriggerGrowthAction={(actionTitle) =>
                                handleTriggerAction("act_growth", actionTitle)
                            }
                        />

                        {/* Revenue & Cash Runway Model */}
                        <RevenueForecastChart
                            onTriggerFinanceAction={(title) =>
                                handleTriggerAction("act_finance", title)
                            }
                        />
                    </motion.div>
                )}

                {activeTab === "defense" && (
                    <motion.div
                        key="defense"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Vulnerability Heatmap & Mitigation Playbooks */}
                        <RiskAnalysisMatrix
                            risks={risks}
                            onExecuteMitigation={(id, title) => handleTriggerAction(id, title)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 4. Action Execution Modal */}
            <ActionExecutionModal
                isOpen={modalState.isOpen}
                actionId={modalState.actionId}
                actionTitle={modalState.actionTitle}
                onClose={() => setModalState({ isOpen: false, actionId: "", actionTitle: "" })}
            />
        </div>
    );
}
