"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import {
  Lightbulb,
  Brain,
  Network,
  Code2,
  Rocket,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const TRAJECTORY_STAGES = [
  {
    phase: "PHASE 01",
    label: "Hypothesis Spark",
    icon: Lightbulb,
    color: "#6366F1",
    headline: "Unfiltered Founder Intuition",
    detail: "Define the acute pain and who bleeds from it. Zero buzzwords, zero pitch decks.",
  },
  {
    phase: "PHASE 02",
    label: "Parallel Interrogation",
    icon: Brain,
    color: "#8B5CF6",
    headline: "10 Agents Stress-Test Reality",
    detail: "Market, Risk, Product, and Finance agents debate in parallel to surface contradictions.",
  },
  {
    phase: "PHASE 03",
    label: "System Architecture",
    icon: Network,
    color: "#A855F7",
    headline: "Synthesis of Schema & State",
    detail: "Postgres schema, API contract, and autonomous loop topology fully mapped.",
  },
  {
    phase: "PHASE 04",
    label: "Sprint Acceleration",
    icon: Code2,
    color: "#EC4899",
    headline: "14-Day Production Backlog",
    detail: "Prioritized sprint tasks, verified acceptance criteria, and tool integrations.",
  },
  {
    phase: "PHASE 05",
    label: "Orbital Injection",
    icon: Rocket,
    color: "#10B981",
    headline: "Verified Real-World Launch",
    detail: "First cohort acquisition, telemetry tracking, and self-learning feedback loops.",
  },
];

export const SectorTrajectory = memo(function SectorTrajectory() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-14 py-28 select-none pointer-events-auto">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-pink-500/10 border border-pink-500/20 text-xs font-mono text-pink-300">
            <span className="size-1.5 rounded-full bg-pink-400" />
            <span>SECTOR 04 · WARP TRAJECTORY</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            From raw spark to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-purple-300 to-emerald-300">
              orbital velocity
            </span>
            .
          </h2>

          <p className="text-base text-indigo-100/70 leading-relaxed">
            The closed learning loop: replace conjecture with current proof, make high-conviction
            decisions, and accelerate execution.
          </p>
        </div>

        {/* 5-Stage Trajectory Stepper Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {TRAJECTORY_STAGES.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={stage.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col justify-between group hover:scale-[1.02] shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="size-9 rounded-xl flex items-center justify-center text-white"
                      style={{ background: `${stage.color}25`, border: `1px solid ${stage.color}50` }}
                    >
                      <Icon className="size-4.5" style={{ color: stage.color }} />
                    </span>
                    <span className="text-[10px] font-mono text-white/40">
                      {stage.phase}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-tight mb-2">
                    {stage.label}
                  </h3>

                  <p className="text-xs text-indigo-100/70 leading-relaxed font-sans">
                    {stage.detail}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  <span>CALIBRATED</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
});
