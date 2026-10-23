"use client";

import { useState, useMemo } from "react";
import {
    BarChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    ComposedChart,
} from "recharts";
import {
    DollarSign,
    TrendingUp,
    ShieldCheck,
    AlertTriangle,
    CreditCard,
    ArrowUpRight,
    Zap,
} from "lucide-react";

interface RevenueForecastChartProps {
    onTriggerFinanceAction: (title: string) => void;
}

export function RevenueForecastChart({ onTriggerFinanceAction }: RevenueForecastChartProps) {
    const [monthlyBurn, setMonthlyBurn] = useState<number>(24000);
    const [arpu, setArpu] = useState<number>(149); // Average Revenue Per User/Startup ($149/mo)

    // Compute 12-month revenue trajectory, cumulative runway, and break-even month
    const financialData = useMemo(() => {
        const months = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11", "M12"];
        let subscribers = 18;
        let cumulativeRunwayCash = 350000; // Starting with $350k cash

        return months.map((month, index) => {
            subscribers = Math.round(subscribers * (1 + (0.28 - index * 0.01)));
            const mrr = subscribers * arpu;
            const arr = mrr * 12;
            const burn = monthlyBurn * (1 + index * 0.03); // Slight team expansion burn
            const netCashFlow = mrr - burn;
            cumulativeRunwayCash += netCashFlow;

            return {
                month,
                subscribers,
                mrr,
                arr,
                burn,
                netCashFlow,
                cumulativeCash: Math.max(0, Math.round(cumulativeRunwayCash)),
                isProfitable: mrr >= burn,
            };
        });
    }, [monthlyBurn, arpu]);

    const breakEvenMonth = financialData.find((d) => d.isProfitable)?.month || "M10";
    const m12Arr = (financialData[financialData.length - 1]?.arr ?? 0).toLocaleString();
    const runwayMonthsRemaining = Math.max(
        1,
        Math.round(350000 / Math.max(1, monthlyBurn - (financialData[0]?.mrr || 0)))
    );

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B0D14]/80 p-6 backdrop-blur-xl transition-all">
            {/* Header */}
            <div className="relative mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-400">
                            Capital &amp; Economics
                        </span>
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-white">
                        MRR Trajectory &amp; Cash Runway Model
                    </h3>
                    <p className="text-xs text-white/50">
                        Monthly recurring revenue curve against operational burn and break-even horizon.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
                        <span className="text-white/40 font-mono">Runway:</span>
                        <span className="font-mono font-bold text-emerald-400">{runwayMonthsRemaining} Months</span>
                    </div>

                    <button
                        onClick={() => onTriggerFinanceAction("Simulate Seed Round Capital Allocation")}
                        className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20"
                    >
                        <Zap className="h-3.5 w-3.5" />
                        <span>Simulate Capital Injection</span>
                    </button>
                </div>
            </div>

            {/* Financial Telemetry Banner */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="block text-[10px] uppercase font-mono text-white/40">M12 Projected ARR</span>
                    <span className="mt-0.5 text-base font-bold font-mono text-emerald-400">
                        ${m12Arr}
                    </span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">High Margin SaaS</span>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="block text-[10px] uppercase font-mono text-white/40">Break-Even Milestone</span>
                    <span className="mt-0.5 text-base font-bold font-mono text-cyan-400">
                        Target {breakEvenMonth}
                    </span>
                    <span className="text-[10px] text-white/40 block mt-0.5">Cashflow Neutral</span>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="block text-[10px] uppercase font-mono text-white/40">Monthly Burn Baseline</span>
                    <span className="mt-0.5 text-base font-bold font-mono text-white">
                        ${monthlyBurn.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-white/40 block mt-0.5">Lean autonomous infra</span>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="block text-[10px] uppercase font-mono text-white/40">Blended ARPU</span>
                    <span className="mt-0.5 text-base font-bold font-mono text-indigo-400">
                        ${arpu} / mo
                    </span>
                    <span className="text-[10px] text-white/40 block mt-0.5">Founder Pro Tier</span>
                </div>
            </div>

            {/* Chart Container */}
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={financialData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(10, 14, 26, 0.95)",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                borderRadius: "8px",
                                color: "#fff",
                                fontSize: "12px",
                            }}
                            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, ""]}
                        />
                        <Bar dataKey="mrr" name="Monthly Recurring Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Line
                            type="monotone"
                            dataKey="burn"
                            name="Operational Burn"
                            stroke="#f43f5e"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="netCashFlow"
                            name="Net Monthly Cash Flow"
                            stroke="#38bdf8"
                            strokeWidth={2}
                            dot={{ r: 3, fill: "#38bdf8" }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
