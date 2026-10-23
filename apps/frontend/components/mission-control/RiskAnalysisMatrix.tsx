"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertTriangle,
    ShieldCheck,
    Flame,
    Zap,
    ArrowUpRight,
    CheckCircle2,
    ShieldAlert,
    ExternalLink,
    Terminal,
} from "lucide-react";
import type { RiskVector } from "./types";

interface RiskAnalysisMatrixProps {
    risks: RiskVector[];
    onExecuteMitigation: (riskId: string, playbookTitle: string) => void;
}

export function RiskAnalysisMatrix({ risks, onExecuteMitigation }: RiskAnalysisMatrixProps) {
    const [selectedRiskId, setSelectedRiskId] = useState<string>(risks[0]?.id ?? "");

    const activeRisk = risks.find((r) => r.id === selectedRiskId) || risks[0];

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B0D14]/80 p-6 backdrop-blur-xl transition-all">
            {/* Header */}
            <div className="relative mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-rose-400">
                            Defense &amp; Moat Stability
                        </span>
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-white">
                        Vulnerability Heatmap &amp; Mitigation Playbooks
                    </h3>
                    <p className="text-xs text-white/50">
                        Active operational, technical, and market vulnerabilities with 1-click mitigation procedures.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1 font-mono text-xs font-bold text-rose-400">
                        {risks.filter((r) => r.severity === "high" || r.severity === "critical").length} High Priority Vulnerabilities
                    </span>
                </div>
            </div>

            {/* Grid Layout: Risk Matrix Heatmap & Selected Playbook Runner */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Risk List / Interactive Cards */}
                <div className="space-y-3 lg:col-span-6">
                    {risks.map((risk) => {
                        const isSelected = risk.id === selectedRiskId;
                        const isCritical = risk.severity === "critical";
                        const isHigh = risk.severity === "high";

                        return (
                            <motion.div
                                key={risk.id}
                                onClick={() => setSelectedRiskId(risk.id)}
                                whileHover={{ scale: 1.01 }}
                                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                                    isSelected
                                        ? "border-cyan-500/50 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30"
                                        : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                                                isCritical
                                                    ? "border-rose-500/30 bg-rose-500/20 text-rose-400"
                                                    : isHigh
                                                    ? "border-amber-500/30 bg-amber-500/20 text-amber-400"
                                                    : "border-cyan-500/30 bg-cyan-500/20 text-cyan-400"
                                            }`}
                                        >
                                            {isCritical ? (
                                                <Flame className="h-4 w-4" />
                                            ) : (
                                                <AlertTriangle className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">
                                                {risk.title}
                                            </h4>
                                            <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                                                {risk.category} · Score: {risk.probability * risk.impact} / 25
                                            </span>
                                        </div>
                                    </div>

                                    <span
                                        className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase font-bold ${
                                            isCritical
                                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                                : isHigh
                                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                        }`}
                                    >
                                        {risk.severity}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Mitigation Playbook Runner Panel */}
                <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-md lg:col-span-6">
                    {activeRisk ? (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeRisk.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-rose-400">
                                            <ShieldAlert className="h-3.5 w-3.5" />
                                            Active Threat Vector
                                        </div>
                                        <h4 className="mt-1 text-base font-bold text-white">
                                            {activeRisk.title}
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs">
                                        <span className="text-white/40">Impact:</span>
                                        <span className="font-mono font-bold text-rose-400">
                                            {activeRisk.impact}/5
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs leading-relaxed text-white/70">
                                    {activeRisk.description}
                                </p>

                                {/* Playbook Execution Terminal Preview */}
                                <div className="rounded-xl border border-white/10 bg-[#06080F] p-4 font-mono text-xs">
                                    <div className="mb-2 flex items-center justify-between border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                                            <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                                            <span>autonomous_mitigation_engine.sh</span>
                                        </div>
                                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                                            VERIFIED SCRIPT
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-cyan-300/80">
                                        <div className="text-white/40"># Automated defense protocol:</div>
                                        <div className="font-bold text-white">&gt; {activeRisk.mitigationPlaybook}</div>
                                        <div className="text-[11px] text-white/40 mt-2">
                                            * Validates telemetry triggers &amp; executes containment without downtime.
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    ) : null}

                    {/* Action Execution Button */}
                    {activeRisk && (
                        <div className="mt-4 pt-3 border-t border-white/10">
                            <button
                                onClick={() =>
                                    onExecuteMitigation(
                                        activeRisk.id,
                                        `Execute Mitigation: ${activeRisk.mitigationPlaybook}`
                                    )
                                }
                                className="group flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] hover:shadow-rose-500/40 active:scale-[0.98]"
                            >
                                <span className="flex items-center gap-2">
                                    <Zap className="h-3.5 w-3.5 text-amber-200" />
                                    <span>Execute Mitigation Playbook</span>
                                </span>
                                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
