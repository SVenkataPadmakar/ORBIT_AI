"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    CheckCircle2,
    Loader2,
    Zap,
    Cpu,
    Sparkles,
    Terminal,
    ArrowRight,
} from "lucide-react";

interface ActionExecutionModalProps {
    isOpen: boolean;
    actionId: string;
    actionTitle: string;
    onClose: () => void;
}

export function ActionExecutionModal({
    isOpen,
    actionId,
    actionTitle,
    onClose,
}: ActionExecutionModalProps) {
    const [step, setStep] = useState<number>(0);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);

    useEffect(() => {
        if (!isOpen) {
            setStep(0);
            setIsCompleted(false);
            return;
        }

        const t1 = setTimeout(() => setStep(1), 500);
        const t2 = setTimeout(() => setStep(2), 1200);
        const t3 = setTimeout(() => setStep(3), 1900);
        const t4 = setTimeout(() => {
            setStep(4);
            setIsCompleted(true);
        }, 2600);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, [isOpen, actionId]);

    if (!isOpen) return null;

    const executionSteps = [
        "Connecting to Autonomous AI Specialist Council...",
        "Evaluating telemetry vectors & historical sprint throughput...",
        `Executing procedure: "${actionTitle}"...`,
        "Updating live operating workspace & recalculating readiness score...",
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#0B0D14] p-6 shadow-2xl"
                >
                    {/* Ambient Glow */}
                    <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-white/10 pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400">
                                    Operating Command Execution
                                </span>
                                <h3 className="text-base font-bold text-white">
                                    {actionTitle}
                                </h3>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Live Execution Terminal */}
                    <div className="my-5 rounded-xl border border-white/10 bg-[#06080F] p-4 font-mono text-xs">
                        <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2 text-[11px] text-white/50">
                            <div className="flex items-center gap-1.5">
                                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                                <span>autonomous_agent_orchestrator.ts</span>
                            </div>
                            <span className="flex items-center gap-1 text-cyan-400">
                                {!isCompleted ? (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        <span>RUNNING</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                        <span className="text-emerald-400">OPTIMIZED</span>
                                    </>
                                )}
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            {executionSteps.map((s, idx) => {
                                const isCurrent = step === idx;
                                const isPast = step > idx;

                                if (step < idx) return null;

                                return (
                                    <div
                                        key={idx}
                                        className={`flex items-start gap-2 ${
                                            isPast
                                                ? "text-emerald-400/90"
                                                : isCurrent
                                                ? "text-cyan-300 font-bold animate-pulse"
                                                : "text-white/40"
                                        }`}
                                    >
                                        <span className="text-white/30">&gt;</span>
                                        <span>{s}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Completion Notice & Dismiss */}
                    {isCompleted && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300"
                        >
                            <div className="flex items-center gap-2 font-semibold">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                <span>Action Successfully Applied to Operating State</span>
                            </div>
                            <p className="mt-1 text-[11px] text-emerald-200/70">
                                Vector telemetry recalculated. Readiness index increased by <strong>+4.5%</strong>.
                            </p>
                        </motion.div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className={`w-full rounded-xl py-2.5 text-xs font-semibold transition-all ${
                                isCompleted
                                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.01]"
                                    : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                            }`}
                        >
                            {isCompleted ? "Dismiss & Return to Mission Control" : "Run in Background"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
