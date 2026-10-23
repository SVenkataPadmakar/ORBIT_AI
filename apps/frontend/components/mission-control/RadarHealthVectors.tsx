"use client";

import { useState } from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    AlertCircle,
    TrendingUp,
    Sparkles,
    ArrowUpRight,
    Zap,
    CheckCircle2,
} from "lucide-react";
import type { HealthPillar } from "./types";

interface RadarHealthVectorsProps {
    pillars: HealthPillar[];
    onTriggerAction: (actionId: string, title: string) => void;
}

export function RadarHealthVectors({ pillars, onTriggerAction }: RadarHealthVectorsProps) {
    const [selectedKey, setSelectedKey] = useState<string>(pillars[0]?.key ?? "problem");

    const radarData = pillars.map((p) => ({
        subject: p.label,
        score: p.score,
        benchmark: 75,
        fullMark: 100,
        key: p.key,
    }));

    const activePillar = pillars.find((p) => p.key === selectedKey) || pillars[0];
    if (!activePillar) return null;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B0D14]/80 p-6 backdrop-blur-xl transition-all">
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

            {/* Header */}
            <div className="relative mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan-400">
                            Operational Vectors
                        </span>
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-white">
                        6-Axis Readiness &amp; Health Radar
                    </h3>
                    <p className="text-xs text-white/50">
                        Interactive vector analysis benchmarked against top 10% YC/Sequoia seed-stage velocity.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
                        <span className="h-2 w-2 rounded-full bg-cyan-400" />
                        <span>Current Startup</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40">
                        <span className="h-2 w-2 rounded-full bg-white/30" />
                        <span>YC Benchmark (75)</span>
                    </div>
                </div>
            </div>

            {/* Radar & Detail Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Radar Chart Display */}
                <div className="flex flex-col items-center justify-center lg:col-span-7">
                    <div className="relative h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    stroke="rgba(255, 255, 255, 0.6)"
                                    fontSize={11}
                                    tick={{ fill: "#94a3b8", cursor: "pointer" }}
                                    onClick={(data) => {
                                        const match = pillars.find((p) => p.label === data?.value);
                                        if (match) setSelectedKey(match.key);
                                    }}
                                />
                                <PolarRadiusAxis
                                    angle={30}
                                    domain={[0, 100]}
                                    stroke="rgba(255, 255, 255, 0.2)"
                                    fontSize={10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(10, 14, 26, 0.95)",
                                        border: "1px solid rgba(255, 255, 255, 0.15)",
                                        borderRadius: "8px",
                                        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
                                        color: "#fff",
                                        fontSize: "12px",
                                    }}
                                />
                                <Radar
                                    name="YC Benchmark"
                                    dataKey="benchmark"
                                    stroke="rgba(255, 255, 255, 0.2)"
                                    fill="rgba(255, 255, 255, 0.05)"
                                    fillOpacity={0.2}
                                />
                                <Radar
                                    name="Current Score"
                                    dataKey="score"
                                    stroke="#06b6d4"
                                    fill="url(#radarGradient)"
                                    fillOpacity={0.4}
                                />
                                <defs>
                                    <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.7} />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                    </linearGradient>
                                </defs>
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Quick Vector Switcher Pills */}
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                        {pillars.map((pillar) => {
                            const isSelected = pillar.key === selectedKey;
                            return (
                                <button
                                    key={pillar.key}
                                    onClick={() => setSelectedKey(pillar.key)}
                                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                                        isSelected
                                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                                            : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent"
                                    }`}
                                >
                                    {pillar.label} ({pillar.score})
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Vector Action Driver Panel */}
                <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-md lg:col-span-5">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activePillar.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400">
                                        Pillar Inspection
                                    </span>
                                    <h4 className="text-base font-bold text-white">
                                        {activePillar.label}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
                                    <span className="font-mono text-xs text-emerald-400">
                                        {activePillar.trend}
                                    </span>
                                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                                </div>
                            </div>

                            {/* Score Meter Bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/60">Calculated Vector Score</span>
                                    <span className="font-mono font-bold text-white">
                                        {activePillar.score} / 100
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${activePillar.score}%` }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className={`h-full rounded-full ${
                                            activePillar.score >= 80
                                                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                                : activePillar.score >= 60
                                                ? "bg-gradient-to-r from-cyan-500 to-indigo-500"
                                                : "bg-gradient-to-r from-amber-500 to-rose-500"
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* Detailed Telemetry Insight */}
                            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-xs leading-relaxed text-white/70">
                                <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-white">
                                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                                    <span>AI Telemetry Assessment</span>
                                </div>
                                {activePillar.details}
                            </div>

                            {/* Status Metric Badges */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                                    <span className="block text-[10px] text-white/40">Status</span>
                                    <span className="mt-0.5 flex items-center gap-1 font-semibold capitalize text-white">
                                        {activePillar.status === "optimal" ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                        ) : (
                                            <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                                        )}
                                        {activePillar.status}
                                    </span>
                                </div>
                                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                                    <span className="block text-[10px] text-white/40">Delta to YC Median</span>
                                    <span className={`mt-0.5 font-mono font-semibold ${
                                        activePillar.score >= 75 ? "text-emerald-400" : "text-amber-400"
                                    }`}>
                                        {activePillar.score >= 75 ? `+${activePillar.score - 75}%` : `-${75 - activePillar.score}%`}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Action Driver Button - Every Component Drives Action */}
                    <div className="mt-4 pt-3 border-t border-white/10">
                        <button
                            onClick={() => onTriggerAction(activePillar.actionId, activePillar.actionLabel)}
                            className="group flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] hover:shadow-cyan-500/40 active:scale-[0.98]"
                        >
                            <span className="flex items-center gap-2">
                                <Zap className="h-3.5 w-3.5 text-cyan-200 transition-transform group-hover:rotate-12" />
                                {activePillar.actionLabel}
                            </span>
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
