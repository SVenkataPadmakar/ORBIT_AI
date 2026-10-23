"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, CartesianGrid, Legend,
} from "recharts";
import {
    Calculator, TrendingUp, AlertTriangle, ShieldCheck, DollarSign,
    Users, ArrowUpRight, Zap, RefreshCw, Layers, CheckCircle2,
} from "lucide-react";

export function SimulationLab({ projectName }: { projectName: string }) {
    // Interactive Input Parameters
    const [capital, setCapital]       = useState(50000);  // Starting capital ($)
    const [arpu, setArpu]             = useState(149);    // Monthly ARPU per customer ($)
    const [initialUsers, setUsers]    = useState(25);     // Month 1 customers
    const [growthRate, setGrowth]     = useState(18);     // Monthly customer growth rate (%)
    const [churnRate, setChurn]       = useState(4);      // Monthly churn rate (%)
    const [cac, setCac]               = useState(280);    // Customer Acquisition Cost ($)
    const [teamCost, setTeamCost]     = useState(12000);  // Monthly team fixed burn ($)
    const [months, setMonths]         = useState(12);     // Projection horizon (months)

    // Calculate monthly projections
    const projection = useMemo(() => {
        const data = [];
        let currentCash = capital;
        let currentCustomers = initialUsers;

        for (let m = 1; m <= months; m++) {
            const newCustomers = Math.round(currentCustomers * (growthRate / 100));
            const churnedCustomers = Math.round(currentCustomers * (churnRate / 100));
            currentCustomers = Math.max(0, currentCustomers + newCustomers - churnedCustomers);

            const mrr = currentCustomers * arpu;
            const acquisitionSpend = newCustomers * cac;
            const totalBurn = teamCost + acquisitionSpend;
            const netCashflow = mrr - totalBurn;
            currentCash += netCashflow;

            data.push({
                month: `M${m}`,
                mrr,
                cash: Math.max(0, Math.round(currentCash)),
                customers: currentCustomers,
                burn: totalBurn,
                netCashflow,
            });
        }
        return data;
    }, [capital, arpu, initialUsers, growthRate, churnRate, cac, teamCost, months]);

    // Key metrics calculations
    const endMrr = projection[months - 1]?.mrr ?? 0;
    const endCash = projection[months - 1]?.cash ?? 0;
    const endCustomers = projection[months - 1]?.customers ?? 0;
    const ltv = churnRate > 0 ? Math.round(arpu / (churnRate / 100)) : arpu * 36;
    const ltvCacRatio = cac > 0 ? (ltv / cac).toFixed(1) : "N/A";

    // Find cash depletion month if runway runs out
    const DepletedMonth = projection.find((d) => d.cash <= 0);
    const runwayMonths = DepletedMonth ? parseInt(DepletedMonth.month.slice(1)) : months;

    return (
        <div className="work-surface" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                <div>
                    <p className="section-kicker" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Calculator className="size-4" style={{ color: "var(--indigo)" }} />
                        Startup Simulation Lab
                    </p>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, marginTop: "8px", color: "var(--text-primary)" }}>
                        Unit Economics &amp; Growth Simulator
                    </h1>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", maxWidth: "600px" }}>
                        Simulate how pricing, churn, team burn, and CAC impact runway and MRR for <strong>{projectName}</strong>.
                    </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            setCapital(50000); setArpu(149); setUsers(25);
                            setGrowth(18); setChurn(4); setCac(280); setTeamCost(12000);
                        }}
                    >
                        <RefreshCw className="size-3.5" />
                        Reset Defaults
                    </button>
                </div>
            </div>

            {/* Top KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                <KpiCard
                    label="Projected End MRR"
                    value={`$${endMrr.toLocaleString()}`}
                    sub={`${endCustomers.toLocaleString()} active users`}
                    tone={endMrr > 20000 ? "emerald" : "indigo"}
                />
                <KpiCard
                    label="Cash Runway"
                    value={DepletedMonth ? `${runwayMonths} Months` : `${months}+ Months`}
                    sub={DepletedMonth ? `Depletes in ${DepletedMonth.month}` : `Ending cash: $${endCash.toLocaleString()}`}
                    tone={DepletedMonth ? "amber" : "emerald"}
                />
                <KpiCard
                    label="LTV : CAC Ratio"
                    value={`${ltvCacRatio}x`}
                    sub={`LTV: $${ltv.toLocaleString()} | CAC: $${cac}`}
                    tone={Number(ltvCacRatio) >= 3 ? "emerald" : "amber"}
                />
                <KpiCard
                    label="Monthly Burn Rate"
                    value={`$${(teamCost + (initialUsers * (growthRate/100) * cac)).toLocaleString()}`}
                    sub={`Fixed: $${teamCost.toLocaleString()}/mo`}
                    tone="purple"
                />
            </div>

            {/* Main Interactive Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 360px) 1fr", gap: "32px" }}>
                {/* Sliders Panel */}
                <div style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-lg)",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Layers className="size-4" style={{ color: "var(--indigo)" }} />
                        Growth &amp; Financial Inputs
                    </h3>

                    <SliderGroup
                        label="Starting Capital"
                        value={`$${capital.toLocaleString()}`}
                        min={5000} max={500000} step={5000}
                        current={capital} onChange={setCapital}
                    />

                    <SliderGroup
                        label="Monthly Price / ARPU"
                        value={`$${arpu}`}
                        min={10} max={2000} step={10}
                        current={arpu} onChange={setArpu}
                    />

                    <SliderGroup
                        label="Monthly Growth Rate"
                        value={`${growthRate}%`}
                        min={1} max={50} step={1}
                        current={growthRate} onChange={setGrowth}
                    />

                    <SliderGroup
                        label="Monthly Churn Rate"
                        value={`${churnRate}%`}
                        min={0.5} max={20} step={0.5}
                        current={churnRate} onChange={setChurn}
                    />

                    <SliderGroup
                        label="Customer Acquisition Cost (CAC)"
                        value={`$${cac}`}
                        min={10} max={1500} step={10}
                        current={cac} onChange={setCac}
                    />

                    <SliderGroup
                        label="Team &amp; Fixed Burn / mo"
                        value={`$${teamCost.toLocaleString()}`}
                        min={1000} max={50000} step={1000}
                        current={teamCost} onChange={setTeamCost}
                    />
                </div>

                {/* Recharts Visualizers */}
                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                    {/* Revenue & Cash Trajectory Chart */}
                    <div style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--r-lg)",
                        padding: "24px",
                    }}>
                        <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>
                            MRR vs. Cash Balance Over Time
                        </h4>
                        <div style={{ width: "100%", height: "260px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={projection} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="month" stroke="#52526E" fontSize={11} />
                                    <YAxis stroke="#52526E" fontSize={11} />
                                    <Tooltip
                                        contentStyle={{ background: "#16161F", border: "1px solid #2A2A3E", borderRadius: "8px", fontSize: "12px" }}
                                    />
                                    <Area type="monotone" dataKey="mrr" stroke="#6366F1" fillOpacity={1} fill="url(#colorMrr)" name="MRR ($)" />
                                    <Area type="monotone" dataKey="cash" stroke="#10B981" fillOpacity={1} fill="url(#colorCash)" name="Cash Balance ($)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Customer Growth Bar Chart */}
                    <div style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--r-lg)",
                        padding: "24px",
                    }}>
                        <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>
                            Customer Count Progression
                        </h4>
                        <div style={{ width: "100%", height: "200px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={projection} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="month" stroke="#52526E" fontSize={11} />
                                    <YAxis stroke="#52526E" fontSize={11} />
                                    <Tooltip
                                        contentStyle={{ background: "#16161F", border: "1px solid #2A2A3E", borderRadius: "8px", fontSize: "12px" }}
                                    />
                                    <Bar dataKey="customers" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Active Customers" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Co-Founder Financial Insights */}
            <div style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))",
                border: "1px solid var(--border-accent)",
                borderRadius: "var(--r-lg)",
                padding: "24px",
                display: "flex",
                gap: "20px",
                alignItems: "flex-start",
            }}>
                <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: "var(--indigo)", display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                }}>
                    <Zap className="size-5 text-white" />
                </div>
                <div>
                    <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                        AI Co-Founder Strategic Feedback
                    </h4>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginTop: "6px" }}>
                        {Number(ltvCacRatio) < 3 ? (
                            `⚠️ Your LTV:CAC ratio is currently ${ltvCacRatio}x (below the 3.0x VC benchmark). Consider testing higher price points or improving onboarding retention before increasing paid acquisition spend.`
                        ) : DepletedMonth ? (
                            `⚠️ Warning: At current burn rate ($${teamCost.toLocaleString()}/mo), cash depletes in ${DepletedMonth.month}. To reach profitability before running out of capital, reduce fixed costs by 15% or accelerate monthly growth rate to ${growthRate + 6}%.`
                        ) : (
                            `✅ Healthy growth trajectory! With an LTV:CAC of ${ltvCacRatio}x and ${months}+ months of runway, your unit economics are strong enough to support expanding outbound acquisition.`
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "indigo" | "emerald" | "amber" | "purple" }) {
    const toneColors = {
        indigo: "#6366F1",
        emerald: "#10B981",
        amber: "#F59E0B",
        purple: "#A855F7",
    };
    const c = toneColors[tone];

    return (
        <div style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
        }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: "24px", fontWeight: 700, color: c }}>{value}</span>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{sub}</span>
        </div>
    );
}

function SliderGroup({ label, value, min, max, step, current, onChange }: {
    label: string; value: string; min: number; max: number; step: number; current: number; onChange: (v: number) => void;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{value}</span>
            </div>
            <input
                type="range"
                min={min} max={max} step={step}
                value={current}
                onChange={(e) => onChange(Number(e.target.value))}
                style={{
                    width: "100%",
                    accentColor: "var(--indigo)",
                    cursor: "pointer",
                }}
            />
        </div>
    );
}
