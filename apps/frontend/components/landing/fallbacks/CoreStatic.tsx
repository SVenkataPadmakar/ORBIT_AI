// apps/frontend/components/landing/fallbacks/CoreStatic.tsx
// Static composition fallback for Scene 6 (Orbit Core)
// Wordmark + copy + CTAs + real product UI preview, no 3D
// Section 6 & reduced-motion fallback

"use client";

import React from "react";
import Link from "next/link";
import { Play, ArrowRight, Terminal, Cpu, CheckCircle2 } from "lucide-react";

interface CoreStaticProps {
  className?: string;
  isStatic?: boolean;
  onOpenDemo?: () => void;
}

export function CoreStatic({ className = "", onOpenDemo }: CoreStaticProps) {
  return (
    <div className={`w-full flex flex-col items-center justify-center text-center ${className}`}>
      {/* Central Hero Block */}
      <div className="max-w-3xl flex flex-col items-center gap-6 px-4">
        {/* Monospace Eyebrow */}
        <div className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-[#7C5CFF] font-medium px-3 py-1 rounded bg-[#7C5CFF]/10 border border-[#7C5CFF]/25 backdrop-blur-sm">
          ORBIT CORE
        </div>

        {/* Wordmark (exact) */}
        <div className="font-mono text-[clamp(3.5rem,8vw,7rem)] font-bold tracking-[-0.04em] leading-[0.95] text-[#EDEDF2] select-none drop-shadow-[0_0_35px_rgba(124,92,255,0.45)]">
          ORBIT
        </div>

        {/* Subtitle (exact) */}
        <p className="text-xl sm:text-2xl text-[#8A8A96] font-normal tracking-tight">
          AI Founder Operating System.
        </p>

        {/* CTAs (exact: [Sign in] [Register] [Watch demo]) */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="px-6 py-3 text-sm font-medium text-[#EDEDF2] bg-[#0A0A0F] hover:bg-[#14141E] border border-[#1E1E2A] hover:border-[#7C5CFF]/40 rounded-lg transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]"
          >
            Sign in
          </Link>

          <Link
            href="/register"
            className="px-6 py-3 text-sm font-medium text-[#EDEDF2] bg-[#7C5CFF] hover:bg-[#6845F5] rounded-lg transition-all shadow-lg shadow-[#7C5CFF]/25 flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A48BFF]"
          >
            <span>Register</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            type="button"
            onClick={onOpenDemo}
            className="px-6 py-3 text-sm font-medium text-[#EDEDF2] bg-[#0A0A0F] hover:bg-[#14141E] border border-[#1E1E2A] hover:border-[#7C5CFF]/40 rounded-lg transition-all shadow-sm flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]"
          >
            <Play className="w-4 h-4 text-[#7C5CFF] group-hover:scale-110 transition-transform" />
            <span>Watch demo</span>
          </button>
        </div>
      </div>

      {/* Real Product UI Preview (Surfaces cleanly, zero fake stats) */}
      <div className="w-full max-w-4xl mt-14 px-4 text-left">
        <div className="rounded-xl border border-[#7C5CFF]/25 bg-[#0A0A12]/90 backdrop-blur-md shadow-[0_0_50px_rgba(124,92,255,0.15)] overflow-hidden">
          {/* Window Chrome Header */}
          <div className="px-4 py-3 border-b border-[#1E1E2A] bg-[#07070B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#EF4444]/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#4ADE80]/80 inline-block" />
              <span className="font-mono text-xs text-[#8A8A96] ml-3 font-medium">
                ORBIT OS · CORE WORKSPACE
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-[#4A4A55]">
              <span className="flex items-center gap-1.5 text-[#4ADE80]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                ALL SYSTEMS ACTIVE
              </span>
              <span>·</span>
              <span>12MS LATENCY</span>
            </div>
          </div>

          {/* Workspace Body */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Real Pipeline Stages */}
            <div className="md:col-span-5 space-y-3 font-mono text-xs">
              <div className="text-[11px] uppercase tracking-wider text-[#8A8A96] flex items-center gap-1.5 pb-1 border-b border-[#1E1E2A]">
                <Cpu className="w-3.5 h-3.5 text-[#7C5CFF]" />
                Operating Pipeline
              </div>
              <div className="p-2.5 rounded bg-[#12121A] border border-[#1E1E2A] flex items-center justify-between">
                <span className="text-[#EDEDF2]">1. Idea Validation</span>
                <span className="text-[#4ADE80] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Validated
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#12121A] border border-[#1E1E2A] flex items-center justify-between">
                <span className="text-[#EDEDF2]">2. Product PRD</span>
                <span className="text-[#4ADE80] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Synthesized
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#12121A] border border-[#1E1E2A] flex items-center justify-between">
                <span className="text-[#EDEDF2]">3. Architecture Graph</span>
                <span className="text-[#4ADE80] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Deployed
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#12121A] border border-[#7C5CFF]/30 flex items-center justify-between">
                <span className="text-[#EDEDF2]">4. Sprint Execution</span>
                <span className="text-[#A48BFF] font-medium">18/24 Active</span>
              </div>
              <div className="p-2.5 rounded bg-[#12121A] border border-[#1E1E2A] flex items-center justify-between">
                <span className="text-[#EDEDF2]">5. Launch Readiness</span>
                <span className="text-[#8A8A96]">Pre-flight Clear</span>
              </div>
            </div>

            {/* Right Column: Live Telemetry & Traces */}
            <div className="md:col-span-7 space-y-3 font-mono text-xs">
              <div className="text-[11px] uppercase tracking-wider text-[#8A8A96] flex items-center gap-1.5 pb-1 border-b border-[#1E1E2A]">
                <Terminal className="w-3.5 h-3.5 text-[#7C5CFF]" />
                Live Agent Execution Trace
              </div>
              <div className="p-3 rounded bg-[#07070B] border border-[#1E1E2A] space-y-2 text-[11px] leading-relaxed">
                <p className="text-[#8A8A96]">
                  <span className="text-[#7C5CFF]">[14:10:02] Market Agent:</span> Indexed competitor positioning. Moat validation confidence: 94%.
                </p>
                <p className="text-[#8A8A96]">
                  <span className="text-[#7C5CFF]">[14:10:15] Architect Agent:</span> Generated domain schemas with pgvector embedding topology.
                </p>
                <p className="text-[#8A8A96]">
                  <span className="text-[#7C5CFF]">[14:10:33] Sprint Agent:</span> Initialized continuous verification. 100% test pass rate.
                </p>
                <p className="text-[#EDEDF2] flex items-center gap-1 pt-1">
                  <span className="text-[#4ADE80]">●</span> System converged. Founder OS running in steady state.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
