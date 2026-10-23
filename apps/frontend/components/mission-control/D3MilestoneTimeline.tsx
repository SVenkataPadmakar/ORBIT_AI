"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    Clock,
    Flame,
    Lock,
    ChevronRight,
    Zap,
    Play,
    ShieldAlert,
    Target,
    ArrowRight,
} from "lucide-react";
import type { StageGateMilestone } from "./types";

interface D3MilestoneTimelineProps {
    milestones: StageGateMilestone[];
    onAdvanceGate: (milestoneId: string, actionLabel: string) => void;
}

export function D3MilestoneTimeline({ milestones, onAdvanceGate }: D3MilestoneTimelineProps) {
    const [activeStageId, setActiveStageId] = useState<string>(
        milestones.find((m) => m.status === "in_progress")?.id || milestones[0]?.id || ""
    );

    const activeMilestone = milestones.find((m) => m.id === activeStageId) || milestones[0];

    // Compute overall roadmap progress
    const totalProgress = Math.round(
        milestones.reduce((acc, m) => acc + (m.status === "completed" ? 100 : m.progress), 0) /
            milestones.length
    );

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B0D14]/80 p-6 backdrop-blur-xl transition-all">
            {/* Header */}
            <div className="relative mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-400">
                            Milestone Velocity
                        </span>
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-white">
                        Stage-Gate Execution Timeline
                    </h3>
                    <p className="text-xs text-white/50">
                        Autonomous milestone gates moving your startup from thesis to production scale.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                        <Target className="h-4 w-4 text-cyan-400" />
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-white/40">Launch Readiness</div>
                            <div className="font-mono text-xs font-bold text-cyan-400">{totalProgress}%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* D3-Style Interactive Timeline Track */}
            <div className="relative my-6 px-2">
                {/* Connecting SVG Track Line */}
                <div className="relative flex items-center justify-between">
                    {/* Background Progress Rail */}
                    <div className="absolute left-0 top-1/2 -z-0 h-1 w-full -translate-y-1/2 bg-white/10 rounded-full" />
                    
                    {/* Active Gradient Fill Line */}
                    <motion.div
                        className="absolute left-0 top-1/2 -z-0 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${totalProgress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />

                    {/* Milestone Nodes */}
                    {milestones.map((milestone, index) => {
                        const isSelected = milestone.id === activeStageId;
                        const isCompleted = milestone.status === "completed";
                        const isInProgress = milestone.status === "in_progress";
                        const isBlocked = milestone.status === "blocked";

                        return (
                            <div
                                key={milestone.id}
                                className="relative flex flex-col items-center cursor-pointer group"
                                onClick={() => setActiveStageId(milestone.id)}
                            >
                                {/* Stage Node Circle */}
                                <motion.div
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                                        isCompleted
                                            ? "border-emerald-400 bg-emerald-500/20 text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.4)]"
                                            : isInProgress
                                            ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse"
                                            : isBlocked
                                            ? "border-rose-400 bg-rose-500/20 text-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.4)]"
                                            : "border-white/20 bg-white/5 text-white/40 group-hover:border-white/40"
                                    } ${isSelected ? "ring-4 ring-cyan-500/30 ring-offset-2 ring-offset-black" : ""}`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : isInProgress ? (
                                        <Flame className="h-5 w-5 text-cyan-400" />
                                    ) : isBlocked ? (
                                        <ShieldAlert className="h-5 w-5 text-rose-400" />
                                    ) : (
                                        <span className="font-mono text-xs font-bold">{index + 1}</span>
                                    )}

                                    {/* Pulse Ring for in-progress node */}
                                    {isInProgress && (
                                        <span className="absolute -inset-1 rounded-full border border-cyan-400/50 animate-ping" />
                                    )}
                                </motion.div>

                                {/* Node Label */}
                                <div className="mt-3 text-center">
                                    <span
                                        className={`block font-mono text-[11px] font-bold tracking-tight transition-colors ${
                                            isSelected
                                                ? "text-cyan-300"
                                                : isCompleted
                                                ? "text-emerald-400/80"
                                                : isInProgress
                                                ? "text-white"
                                                : "text-white/40 group-hover:text-white/70"
                                        }`}
                                    >
                                        {milestone.stage}
                                    </span>
                                    <span className="block text-[10px] text-white/40 font-mono mt-0.5">
                                        {isCompleted ? "Passed" : isInProgress ? `${milestone.progress}%` : `T-${milestone.targetDays}d`}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected Milestone Active Inspection Card */}
            {activeMilestone && (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeMilestone.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mt-6 rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-md"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase font-bold ${
                                            activeMilestone.status === "completed"
                                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                : activeMilestone.status === "in_progress"
                                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                                : "bg-white/10 text-white/60 border border-white/15"
                                        }`}
                                    >
                                        {activeMilestone.status.replace("_", " ")}
                                    </span>
                                    <span className="text-xs text-white/50 font-mono">
                                        {activeMilestone.completedCount} / {activeMilestone.tasksCount} Tasks Closed
                                    </span>
                                </div>
                                <h4 className="mt-1.5 text-base font-bold text-white">
                                    {activeMilestone.title}
                                </h4>
                            </div>

                            <button
                                onClick={() => onAdvanceGate(activeMilestone.id, activeMilestone.actionLabel)}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:shadow-cyan-500/40 active:scale-[0.98]"
                            >
                                <Zap className="h-3.5 w-3.5 text-cyan-200" />
                                {activeMilestone.actionLabel}
                            </button>
                        </div>

                        {/* Progress Bar & Critical Dependency */}
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-white/60">Gate Completion Velocity</span>
                                    <span className="font-mono font-bold text-cyan-400">{activeMilestone.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                                        style={{ width: `${activeMilestone.progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                                <span className="block text-[10px] uppercase font-mono tracking-wider text-white/40">
                                    Critical Path Dependency
                                </span>
                                <span className="mt-0.5 text-xs text-white/80 font-medium">
                                    {activeMilestone.criticalDependency || "Zero blocker dependencies active"}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}
