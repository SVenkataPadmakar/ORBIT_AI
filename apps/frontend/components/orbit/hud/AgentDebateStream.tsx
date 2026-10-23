"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Radio, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";
import { AGENT_ENTITIES, AgentEntity } from "../canvas/AgentConstellation";

interface AgentDebateStreamProps {
  activeAgentIndex: number;
  onSelectAgent: (index: number) => void;
}

export function AgentDebateStream({
  activeAgentIndex,
  onSelectAgent,
}: AgentDebateStreamProps) {
  const currentAgent = AGENT_ENTITIES[activeAgentIndex] ?? AGENT_ENTITIES[0]!;

  return (
    <div className="w-full max-w-4xl mx-auto backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <span className="flex size-2 rounded-full bg-indigo-500 animate-ping" />
          <span className="text-white font-medium tracking-wide">
            SYNCHRONIZED AGENT COUNCIL TELEMETRY
          </span>
          <span className="text-white/30">|</span>
          <span className="text-emerald-400">10 SPECIALISTS ONLINE</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-indigo-300/70">
          <Radio className="size-3 text-cyan-400" />
          <span>FREQUENCY: 1420.4 MHz (H-LINE)</span>
        </div>
      </div>

      {/* Main Deliberation Transmission Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 items-center">
        {/* Left: Agent Badge & Status */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${currentAgent.color}, #000000)`,
                border: `1px solid ${currentAgent.color}`,
              }}
            >
              <Sparkles className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                {currentAgent.name}
              </h3>
              <p className="text-xs text-indigo-300/80">{currentAgent.role}</p>
            </div>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed mt-2 font-mono">
            MISSION: {currentAgent.mission}
          </p>
        </div>

        {/* Center & Right: Live Debate Transmission */}
        <div className="md:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-4 min-h-[105px] flex flex-col justify-center">
          <span className="text-[10px] font-mono text-indigo-400 tracking-wider uppercase mb-1">
            INTERCEPTED TRANSMISSION
          </span>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentAgent.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm md:text-base text-white/95 font-medium italic leading-relaxed"
            >
              &ldquo;{currentAgent.quote}&rdquo;
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom: Fast Switcher Bar for all 10 Agents */}
      <div className="flex items-center gap-1.5 pt-5 mt-4 border-t border-white/5 overflow-x-auto pb-1 scrollbar-none">
        {AGENT_ENTITIES.map((agent, idx) => {
          const isActive = idx === activeAgentIndex;
          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap focus:outline-none ${
                isActive
                  ? "bg-indigo-500/20 text-white border border-indigo-400/60 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                  : "bg-white/[0.03] text-white/50 hover:text-white/80 hover:bg-white/[0.06] border border-white/5"
              }`}
              data-cursor="hover"
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: isActive ? agent.color : "rgba(255,255,255,0.3)" }}
              />
              <span>{agent.name.replace(" Agent", "")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
