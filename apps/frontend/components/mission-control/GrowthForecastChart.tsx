"use client";

import { useState, useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Line,
} from "recharts";
import {
    TrendingUp,
    Users,
    Rocket,
    Sliders,
    Sparkles,
    Zap,
    Share2,
    ArrowUpRight,
} from "lucide-react";

interface GrowthForecastChartProps {
    onTriggerGrowthAction: (actionTitle: string) => void;
}

export function GrowthForecastChart({ onTriggerGrowthAction }: GrowthForecastChartProps) {
    const [scenario, setScenario] = useState<"conservative" | "expected" | "moonshot">("expected");
    const [viralKFactor, setViralKFactor] = useState<number>(1.2);
    const [conversionRate, setConversionRate] = useState<number>(4.5);

    // Generate 12-month dynamic forecast based on scenario and slider parameters
    const forecastData = useMemo(() => {
        const multiplier =
            scenario === "conservative" ? 0.7 : scenario === "moonshot" ? 1.6 : 1.0;
        const kMultiplier = viralKFactor / 1.0;
        const convMultiplier = conversionRate / 3.0;

        const months = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11", "M12"];
        let baseUsers = 450;

        return months.map((month, index) => {
            const growthRate = 1 + (0.18 * multiplier * kMultiplier * (1 + index * 0.04));
            baseUsers = Math.round(baseUsers * growthRate);
            const waitlist = Math.round(baseUsers * (2.8 * convMultiplier));
            const activePaid = Math.round(baseUsers * (conversionRate / 100));

            return {
                month,
                activeUsers: baseUsers,
                waitlistMembers: waitlist,
                paidFounders: activePaid,
                upperBand: Math.round(baseUsers * 1.25),
                lowerBand: Math.round(baseUsers * 0.8),
            };
        });
    }, [scenario, viralKFactor, conversionRate]);

    const finalMonthUsers = forecastData[forecastData.length - 1]?.activeUsers.toLocaleString() ?? "0";
    const finalPaidFounders = forecastData[forecastData.length - 1]?.paidFounders.toLocaleString() ?? "0";

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B0D14]/80 p-6 backdrop-blur-xl transition-all">
            {/* Header */}
            <div className="relative mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan-400">
                            Growth Intelligence
                        </span>
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-white">
                        12-Month User &amp; Founder Trajectory
                    </h3>
                    <p className="text-xs text-white/50">
                        Multi-scenario organic flywheel modeling with variable viral coefficient (K-Factor).
                    </p>
                </div>

                {/* Scenario Toggle */}
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
                        <button
                            onClick={() => setScenario("conservative")}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                scenario === "conservative"
                                    ? "bg-white/20 text-white shadow-sm"
                                    : "text-white/50 hover:text-white"
                            }`}
                        >
                            Conservative
                        </button>
                        <button
                            onClick={() => setScenario("expected")}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                scenario === "expected"
                                    ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                                    : "text-white/50 hover:text-white"
                            }`}
                        >
                            Base (Target)
                        </button>
                        <button
                            onClick={() => setScenario("moonshot")}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                scenario === "moonshot"
                                    ? "bg-indigo-500/20 text-indigo-300 shadow-sm"
                                    : "text-white/50 hover:text-white"
                            }`}
                        >
                            Moonshot
                        </button>
                    </div>

                    <button
                        onClick={() => onTriggerGrowthAction("Deploy Referral Loop Mechanism")}
                        className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition-all hover:bg-cyan-500/20"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Launch Viral Loop</span>
                    </button>
                </div>
            </div>

            {/* Parameter Tuning Bar */}
            <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <div className="flex justify-between text-xs">
                        <span className="text-white/60">Viral K-Factor</span>
                        <span className="font-mono font-bold text-cyan-400">{viralKFactor}x</span>
                    </div>
                    <input
                        type="range"
                        min="0.6"
                        max="2.0"
                        step="0.1"
                        value={viralKFactor}
                        onChange={(e) => setViralKFactor(parseFloat(e.target.value))}
                        className="mt-2 w-full accent-cyan-400 cursor-pointer"
                    />
                </div>

                <div>
                    <div className="flex justify-between text-xs">
                        <span className="text-white/60">Paid Conversion Rate</span>
                        <span className="font-mono font-bold text-indigo-400">{conversionRate}%</span>
                    </div>
                    <input
                        type="range"
                        min="1.0"
                        max="8.0"
                        step="0.5"
                        value={conversionRate}
                        onChange={(e) => setConversionRate(parseFloat(e.target.value))}
                        className="mt-2 w-full accent-indigo-400 cursor-pointer"
                    />
                </div>

                <div className="rounded-lg border border-white/5 bg-black/20 p-2.5">
                    <span className="block text-[10px] uppercase font-mono text-white/40">M12 Total Users</span>
                    <span className="mt-0.5 text-base font-bold font-mono text-cyan-300">
                        {finalMonthUsers}
                    </span>
                </div>

                <div className="rounded-lg border border-white/5 bg-black/20 p-2.5">
                    <span className="block text-[10px] uppercase font-mono text-white/40">M12 Paid Subscribers</span>
                    <span className="mt-0.5 text-base font-bold font-mono text-emerald-400">
                        {finalPaidFounders}
                    </span>
                </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="waitlistGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
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
                        <Area
                            type="monotone"
                            dataKey="waitlistMembers"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#waitlistGrad)"
                            name="Waitlist Cohort"
                        />
                        <Area
                            type="monotone"
                            dataKey="activeUsers"
                            stroke="#06b6d4"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#usersGrad)"
                            name="Active Core Users"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
