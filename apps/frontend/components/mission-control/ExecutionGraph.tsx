"use client";

import { useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Bar,
    BarChart,
} from "recharts";
import {
    Activity,
    Zap,
    TrendingUp,
    Layers,
    Cpu,
    ArrowUpRight,
    Play,
} from "lucide-react";

interface ExecutionGraphProps {
    onAccelerate: () => void;
}

const executionHistoryData = [
    { sprint: "Sprint 1", tasksDone: 8, agentRuns: 14, velocity: 22, burndown: 92 },
    { sprint: "Sprint 2", tasksDone: 14, agentRuns: 28, velocity: 42, burndown: 78 },
    { sprint: "Sprint 3", tasksDone: 19, agentRuns: 45, velocity: 64, burndown: 59 },
    { sprint: "Sprint 4", tasksDone: 27, agentRuns: 62, velocity: 89, burndown: 38 },
    { sprint: "Sprint 5 (Current)", tasksDone: 34, agentRuns: 88, velocity: 122, burndown: 18 },
    { sprint: "Sprint 6 (Target)", tasksDone: 42, agentRuns: 110, velocity: 152, burndown: 4 },
];

export function ExecutionGraph({ onAccelerate }: ExecutionGraphProps) {
    const [activeMetric, setActiveMetric] = useState<"velocity" | "burndown" | "agentRuns">("velocity");

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B0D14]/80 p-6 backdrop-blur-xl transition-all">
            {/* Header */}
            <div className="relative mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-400">
                            Execution Telemetry
                        </span>
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-white">
                        Sprint Velocity &amp; Agent Throughput
                    </h3>
                    <p className="text-xs text-white/50">
                        Autonomous agent pipeline work units closed per build cycle.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
                        <button
                            onClick={() => setActiveMetric("velocity")}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                activeMetric === "velocity"
                                    ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                                    : "text-white/60 hover:text-white"
                            }`}
                        >
                            Velocity Score
                        </button>
                        <button
                            onClick={() => setActiveMetric("agentRuns")}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                activeMetric === "agentRuns"
                                    ? "bg-indigo-500/20 text-indigo-300 shadow-sm"
                                    : "text-white/60 hover:text-white"
                            }`}
                        >
                            Agent Cycles
                        </button>
                        <button
                            onClick={() => setActiveMetric("burndown")}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                activeMetric === "burndown"
                                    ? "bg-rose-500/20 text-rose-300 shadow-sm"
                                    : "text-white/60 hover:text-white"
                            }`}
                        >
                            Backlog Burndown
                        </button>
                    </div>

                    <button
                        onClick={onAccelerate}
                        className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20"
                    >
                        <Zap className="h-3.5 w-3.5" />
                        <span>Accelerate Sprint</span>
                    </button>
                </div>
            </div>

            {/* Main Recharts Area */}
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={executionHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="agentGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="burndownGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="sprint"
                            stroke="#64748b"
                            fontSize={11}
                            tickLine={false}
                        />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(10, 14, 26, 0.95)",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                borderRadius: "8px",
                                color: "#fff",
                                fontSize: "12px",
                            }}
                        />
                        {activeMetric === "velocity" && (
                            <Area
                                type="monotone"
                                dataKey="velocity"
                                stroke="#06b6d4"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#velocityGrad)"
                                name="Velocity Units"
                            />
                        )}
                        {activeMetric === "agentRuns" && (
                            <Area
                                type="monotone"
                                dataKey="agentRuns"
                                stroke="#8b5cf6"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#agentGrad)"
                                name="Agent Invocations"
                            />
                        )}
                        {activeMetric === "burndown" && (
                            <Area
                                type="monotone"
                                dataKey="burndown"
                                stroke="#f43f5e"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#burndownGrad)"
                                name="Remaining Scope (%)"
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom Key Metrics Band */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-white/5 pt-4">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="block text-[10px] uppercase font-mono text-white/40">Current Velocity</span>
                    <span className="mt-0.5 text-base font-bold font-mono text-cyan-400">122 pts/sprint</span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                        <TrendingUp className="h-3 w-3" /> +37% vs last sprint
                    </span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="block text-[10px] uppercase font-mono text-white/40">Tasks Shipped</span>
                    <span className="mt-0.5 text-base font-bold font-mono text-white">34 Completed</span>
                    <span className="text-[10px] text-white/40 block mt-0.5">8 In-Flight</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="block text-[10px] uppercase font-mono text-white/40">Autonomous Efficiency</span>
                    <span className="mt-0.5 text-base font-bold font-mono text-indigo-400">94.2%</span>
                    <span className="text-[10px] text-white/40 block mt-0.5">Zero manual intervention</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="block text-[10px] uppercase font-mono text-white/40">Target Alpha Release</span>
                    <span className="mt-0.5 text-base font-bold font-mono text-emerald-400">14 Days</span>
                    <span className="text-[10px] text-cyan-400 block mt-0.5">On Schedule</span>
                </div>
            </div>
        </div>
    );
}
