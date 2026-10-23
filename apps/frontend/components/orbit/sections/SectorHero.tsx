"use client";

import { useState, memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SectorHeroProps {
  onOpenDemo?: () => void;
  onNavigateSector?: (progress: number) => void;
}

const FOUNDER_STAGES = [
  { id: "idea",         step: "01", label: "Idea",         desc: "Problem discovery & thesis" },
  { id: "research",     step: "02", label: "Research",     desc: "TAM / SAM & competitor moats" },
  { id: "validation",   step: "03", label: "Validation",   desc: "Empirical customer evidence" },
  { id: "product",      step: "04", label: "Product",      desc: "PRD & MVP scope boundary" },
  { id: "architecture", step: "05", label: "Architecture", desc: "PostgreSQL DDL & OpenAPI specs" },
  { id: "execution",    step: "06", label: "Execution",    desc: "14-day sprints & automated code" },
  { id: "launch",       step: "07", label: "Launch",       desc: "Zero-day preflight & cohort GTM" },
];

export const SectorHero = memo(function SectorHero({ onOpenDemo }: SectorHeroProps) {
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);

  return (
    <section 
      aria-label="Hero Introduction"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 select-none pointer-events-auto"
    >
      {/* ── Editorial Category Eyebrow ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md text-xs font-mono text-white/70 mb-8 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
      >
        <span className="size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
        <span className="font-semibold tracking-wider uppercase text-white/90">
          Autonomous AI Founder Operating System
        </span>
      </motion.div>

      {/* ── PRIMARY HEADLINE (Mandated Exact Copy) ── */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white max-w-5xl leading-[1.06] drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
      >
        Build Startups Like A Team Of Experts. <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-cyan-300">
          Powered By Autonomous AI.
        </span>
      </motion.h1>

      {/* ── SUBHEADLINE (Mandated Exact Copy) ── */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 text-base sm:text-xl md:text-2xl text-white/65 max-w-3xl font-normal leading-relaxed"
      >
        Orbit transforms ideas into real products through research, validation, architecture,
        planning, execution, and launch.
      </motion.p>

      {/* ── HERO ACTIONS (Only: Watch Demo, Sign In, Register) ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <button
          onClick={onOpenDemo}
          aria-label="Watch Demo"
          className="group px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm tracking-wide flex items-center gap-2.5 shadow-[0_0_30px_rgba(99,102,241,0.45)] border border-indigo-400/30 transition-all duration-200 hover:scale-[1.02]"
          data-cursor="hover"
        >
          <Play className="size-4 fill-white text-white group-hover:scale-110 transition-transform" />
          <span>Watch Demo</span>
        </button>

        <Link
          href="/login"
          prefetch={true}
          className="px-6 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 backdrop-blur-xl text-white/90 font-medium text-sm transition-all duration-200"
          data-cursor="hover"
        >
          Sign In
        </Link>

        <Link
          href="/register"
          prefetch={true}
          className="px-6 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 backdrop-blur-xl text-white/90 font-medium text-sm transition-all duration-200 flex items-center gap-2"
          data-cursor="hover"
        >
          <span>Register</span>
          <ArrowRight className="size-3.5 text-white/50" />
        </Link>
      </motion.div>

      {/* ── HERO INFORMATION ARCHITECTURE: 7-Stage Founder Execution Pipeline ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
        className="mt-16 w-full max-w-5xl"
      >
        {/* Pipeline Container */}
        <div className="relative rounded-2xl border border-white/[0.08] bg-[#070712]/70 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {/* Pipeline Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4 text-left">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-cyan-400" />
              <span className="text-xs font-mono font-medium text-white/80 uppercase tracking-wider">
                Founder Execution Pipeline
              </span>
            </div>
            <span className="text-[11px] font-mono text-white/40 hidden sm:inline">
              IDEA → PRODUCTION ARCHITECTURE
            </span>
          </div>

          {/* 7 Interactive Stage Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5">
            {FOUNDER_STAGES.map((stage, idx) => {
              const isHovered = activeStageIndex === idx;
              return (
                <div
                  key={stage.id}
                  onMouseEnter={() => setActiveStageIndex(idx)}
                  onMouseLeave={() => setActiveStageIndex(null)}
                  className={cn(
                    "relative p-2.5 rounded-xl border text-left transition-all duration-200 cursor-default",
                    isHovered
                      ? "border-cyan-400/50 bg-cyan-500/[0.08] shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                      : "border-white/[0.06] bg-white/[0.01] hover:border-white/[0.12] hover:bg-white/[0.03]"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-white/40">
                      {stage.step}
                    </span>
                    {idx < 6 && (
                      <ChevronRight className="size-3 text-white/20 hidden lg:block -mr-1" />
                    )}
                  </div>

                  <p className="text-xs font-semibold text-white tracking-tight">
                    {stage.label}
                  </p>
                  <p className="text-[10px] text-white/45 line-clamp-1 mt-0.5 font-mono">
                    {stage.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Subtle Scroll Cue ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="mt-14 flex flex-col items-center gap-2 pointer-events-none text-[11px] font-mono tracking-widest text-white/30 uppercase"
      >
        <span>Explore Orbit Intelligence Core</span>
        <div className="w-[1px] h-6 bg-gradient-to-b from-indigo-400/60 to-transparent" />
      </motion.div>
    </section>
  );
});

