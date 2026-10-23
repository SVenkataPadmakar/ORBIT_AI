"use client";

import { motion } from "framer-motion";
import {
    Activity,
    Award,
    CheckCircle2,
    Layers,
    Rocket,
    TrendingUp,
    ShieldCheck,
    ShieldAlert,
    Target,
    ArrowUpRight,
    Zap,
    AlertTriangle,
} from "lucide-react";
import type { CoreDimensionMetric } from "./types";

interface CoreDimensionStripProps {
    dimensions: CoreDimensionMetric[];
    onTriggerAction: (actionId: string, actionTitle: string) => void;
}

const iconMap = {
    health: Activity,
    readiness: Award,
    product: Layers,
    launch: Rocket,
    growth: TrendingUp,
    market: Target,
    risk: ShieldAlert,
};

interface ColorStyle {
    border: string;
    bg: string;
    text: string;
    glow: string;
    badge: string;
}

const DEFAULT_STYLE: ColorStyle = {
    border: "border-cyan-500/30 hover:border-cyan-400/60",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.25)]",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

const colorStyles: Record<string, ColorStyle> = {
    cyan: DEFAULT_STYLE,
    emerald: {
        border: "border-emerald-500/30 hover:border-emerald-400/60",
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        glow: "shadow-[0_0_20px_rgba(16,185,129,0.25)]",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    indigo: {
        border: "border-indigo-500/30 hover:border-indigo-400/60",
        bg: "bg-indigo-500/10",
        text: "text-indigo-400",
        glow: "shadow-[0_0_20px_rgba(99,102,241,0.25)]",
        badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    },
    violet: {
        border: "border-violet-500/30 hover:border-violet-400/60",
        bg: "bg-violet-500/10",
        text: "text-violet-400",
        glow: "shadow-[0_0_20px_rgba(139,92,246,0.25)]",
        badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    },
    amber: {
        border: "border-amber-500/30 hover:border-amber-400/60",
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        glow: "shadow-[0_0_20px_rgba(245,158,11,0.25)]",
        badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    rose: {
        border: "border-rose-500/30 hover:border-rose-400/60",
        bg: "bg-rose-500/10",
        text: "text-rose-400",
        glow: "shadow-[0_0_20px_rgba(244,63,94,0.25)]",
        badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    },
};

export function CoreDimensionStrip({ dimensions, onTriggerAction }: CoreDimensionStripProps) {
    return (
        <div className="relative">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-white/80">
                        7 Core Operational Dimensions · Actionable Mission HUD
                    </span>
                </div>
                <span className="hidden sm:inline-block text-[11px] font-mono text-white/40">
                    Click any action to execute live agent procedure
                </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                {dimensions.map((dim, idx) => {
                    const Icon = (iconMap as Record<string, typeof Activity>)[dim.id] || Activity;
                    const style: ColorStyle = colorStyles[dim.accentColor] ?? DEFAULT_STYLE;

                    return (
                        <motion.div
                            key={dim.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: idx * 0.04 }}
                            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border ${style.border} bg-[#0A0D18]/80 p-3.5 backdrop-blur-xl transition-all duration-300 hover:bg-[#0E1222]/90 hover:-translate-y-0.5 ${style.glow}`}
                        >
                            {/* Top row: Icon & Status */}
                            <div>
                                <div className="flex items-center justify-between gap-1.5">
                                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${style.bg} ${style.text}`}>
                                        <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold ${style.badge}`}>
                                        {dim.trend}
                                    </span>
                                </div>

                                <div className="mt-2.5">
                                    <h4 className="text-xs font-bold text-white tracking-tight line-clamp-1">
                                        {dim.title}
                                    </h4>
                                    <p className="text-[10px] text-white/50 line-clamp-1">
                                        {dim.subtitle}
                                    </p>
                                </div>

                                {/* Main Metric Score & Mini Bar */}
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="font-mono text-xl font-black text-white">
                                        {dim.score}%
                                    </span>
                                    <span className="font-mono text-[10px] text-white/40">
                                        {dim.score >= 80 ? "Optimal" : dim.score >= 60 ? "Stable" : "Attention"}
                                    </span>
                                </div>

                                {/* Mini Progress Track */}
                                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${dim.score}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className={`h-full rounded-full ${
                                            dim.accentColor === "emerald"
                                                ? "bg-emerald-400"
                                                : dim.accentColor === "amber"
                                                ? "bg-amber-400"
                                                : dim.accentColor === "rose"
                                                ? "bg-rose-400"
                                                : dim.accentColor === "indigo"
                                                ? "bg-indigo-400"
                                                : dim.accentColor === "violet"
                                                ? "bg-violet-400"
                                                : "bg-cyan-400"
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* Action Button: Drives Immediate Procedure */}
                            <button
                                onClick={() => onTriggerAction(dim.actionId, `${dim.title}: ${dim.actionLabel}`)}
                                className={`mt-3 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] font-semibold text-white/80 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white group-hover:border-cyan-500/40`}
                                data-cursor="hover"
                            >
                                <span className="truncate">{dim.actionLabel}</span>
                                <ArrowUpRight className="h-3 w-3 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 text-cyan-400" />
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
