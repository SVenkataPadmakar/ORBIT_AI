"use client";

import { useState, memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, ArrowRight, ChevronDown, Zap } from "lucide-react";
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

export const SectorHero = memo(function SectorHero({ onOpenDemo, onNavigateSector }: SectorHeroProps) {
  return (
    <section 
      aria-label="Hero Introduction"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 select-none pointer-events-auto"
    >
      {/* ── Top Pill Badge ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 backdrop-blur-md text-xs font-mono text-indigo-200 mb-8 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
      >
        <span className="size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
        <span className="font-semibold tracking-wider uppercase text-white/90">
          AI CO-FOUNDER PLATFORM <span className="text-white/40 mx-1.5">|</span> ORBIT v3.0 ONLINE
        </span>
      </motion.div>

      {/* ── PRIMARY HEADLINE ── */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-5xl sm:text-7xl md:text-8xl lg:text-[96px] font-black tracking-tight text-white max-w-5xl leading-[1.04] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]"
      >
        Your AI Co-Founder is <br />
        ready.
      </motion.h1>

      {/* ── SUBHEADLINE ── */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 text-base sm:text-lg md:text-xl text-white/70 max-w-2xl font-normal leading-relaxed"
      >
        From idea spark to market test.{" "}
        <strong className="text-white font-semibold">Autonomous evidence missions</strong>,
        calibrated risk models, and sprint architecture.
      </motion.p>

      {/* ── HERO ACTIONS ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className="mt-9 flex flex-wrap items-center justify-center gap-4"
      >
        <Link
          href="/projects/new"
          prefetch={true}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm tracking-wide flex items-center gap-2.5 shadow-[0_0_30px_rgba(99,102,241,0.45)] border border-indigo-400/30 transition-all duration-200 hover:scale-[1.02]"
          data-cursor="hover"
        >
          <Zap className="size-4 fill-white text-white" />
          <span>Start Building Free</span>
          <ArrowRight className="size-4" />
        </Link>

        <button
          onClick={onOpenDemo}
          aria-label="Watch Demo"
          className="px-6 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 backdrop-blur-xl text-white/90 font-medium text-sm flex items-center gap-2.5 transition-all duration-200 hover:scale-[1.02]"
          data-cursor="hover"
        >
          <Play className="size-3.5 fill-white text-white" />
          <span>Watch Demo</span>
        </button>
      </motion.div>

      {/* ── METRICS SOCIAL PROOF ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
        className="mt-16 flex items-center justify-center gap-8 sm:gap-16 text-center select-none"
      >
        <div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">2,400+</div>
          <div className="text-[10px] sm:text-[11px] font-mono tracking-widest text-white/50 uppercase mt-1">Startups Launched</div>
        </div>
        <div className="w-[1px] h-8 bg-white/10 hidden sm:block" />
        <div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">18,000+</div>
          <div className="text-[10px] sm:text-[11px] font-mono tracking-widest text-white/50 uppercase mt-1">Ideas Validated</div>
        </div>
        <div className="w-[1px] h-8 bg-white/10 hidden sm:block" />
        <div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">94,000+</div>
          <div className="text-[10px] sm:text-[11px] font-mono tracking-widest text-white/50 uppercase mt-1">Agent Missions Run</div>
        </div>
      </motion.div>

      {/* ── DESCEND CUE ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        onClick={() => onNavigateSector?.(0.32)}
        className="mt-8 flex flex-col items-center gap-1.5 cursor-pointer text-[10px] font-mono tracking-widest text-white/40 hover:text-white/80 transition-colors uppercase select-none"
      >
        <span>Descend into Orbital System</span>
        <ChevronDown className="size-3.5 animate-bounce text-white/40" />
      </motion.div>
    </section>
  );
});

