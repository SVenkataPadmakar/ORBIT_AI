"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { AgentDebateStream } from "../hud/AgentDebateStream";
import { ShieldCheck, Network, Cpu, Terminal } from "lucide-react";

interface SectorCouncilProps {
  activeAgentIndex: number;
  onSelectAgent: (index: number) => void;
}

export const SectorCouncil = memo(function SectorCouncil({
  activeAgentIndex,
  onSelectAgent,
}: SectorCouncilProps) {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center px-6 py-28 select-none pointer-events-auto">
      <div className="max-w-4xl mx-auto w-full text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300">
          <span className="size-1.5 rounded-full bg-indigo-400" />
          <span>SECTOR 03 · AUTONOMOUS COUNCIL</span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
          10 Autonomous Specialists.{" "}
          <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
            One calibrated judgment.
          </span>
        </h2>

        <p className="text-base text-indigo-100/70 max-w-2xl mx-auto leading-relaxed">
          Your agents don&apos;t just spit out reports. They debate, stress-test assumptions,
          and reconcile conflict in parallel. Disagreements expose the hidden risks before
          you write a line of code.
        </p>
      </div>

      {/* ── Live Deliberation Telemetry Console ── */}
      <AgentDebateStream
        activeAgentIndex={activeAgentIndex}
        onSelectAgent={onSelectAgent}
      />
    </section>
  );
});
