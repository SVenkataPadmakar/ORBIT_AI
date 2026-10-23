"use client";

import { motion } from "framer-motion";
import {
  Terminal,
  Activity,
  Sparkles,
  Code2,
  CheckCircle2,
  Volume2,
  ShieldCheck,
} from "lucide-react";
import { DemoChapter } from "@/lib/demo/demoTypes";

interface DemoInteractiveStageProps {
  chapter: DemoChapter;
  currentTime: number;
}

export function DemoInteractiveStage({
  chapter,
  currentTime,
}: DemoInteractiveStageProps) {
  const { previewState } = chapter;

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#040409] overflow-y-auto">
      {/* Subtle Background Glows */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(99, 102, 241, 0.2) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: chapter.agentColor }}
      />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-cyan-600/15 blur-3xl pointer-events-none" />

      {/* Chapter Stage Header */}
      <div className="relative z-10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <span
              className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold tracking-wider uppercase border shadow-sm"
              style={{
                backgroundColor: `${chapter.agentColor}15`,
                color: chapter.agentColor,
                borderColor: `${chapter.agentColor}35`,
              }}
            >
              {chapter.stageBadge}
            </span>
            <span className="text-xs font-mono text-white/50">
              AGENT: <strong className="text-white/80">{chapter.agentName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
            <Activity className="size-3 animate-pulse" />
            <span>DETERMINISTIC SIMULATION ACTIVE</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
            {previewState.headline}
          </h3>
          <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-2xl font-sans">
            {chapter.description}
          </p>
        </div>
      </div>

      {/* Main Grid: Details & Metrics */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 my-4">
        {/* Left Column: Key Findings / Specifications */}
        <div className="md:col-span-7 space-y-3">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-md space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono text-white/40 border-b border-white/5 pb-2">
              <Sparkles className="size-3 text-indigo-400" />
              <span>CORE ARTIFACT SPECIFICATIONS</span>
            </div>

            <ul className="space-y-2 text-xs text-white/80 font-sans">
              {previewState.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="size-3.5 shrink-0 mt-0.5"
                    style={{ color: chapter.agentColor }}
                  />
                  <span className="leading-relaxed">{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Optional Code Preview if Chapter has one (e.g. Technical Architect) */}
          {previewState.codePreview && (
            <div className="rounded-xl border border-white/[0.08] bg-black/70 p-3.5 font-mono text-[11px] space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-white/40 border-b border-white/10 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Code2 className="size-3 text-cyan-400" />
                  <span>{previewState.codePreview.title}</span>
                </div>
                <span className="text-[10px] uppercase text-cyan-400 font-semibold">
                  {previewState.codePreview.language}
                </span>
              </div>
              <pre className="text-cyan-200/90 overflow-x-auto p-1 leading-relaxed scrollbar-thin">
                <code>{previewState.codePreview.code}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Right Column: Key Metrics & Live Terminal Log */}
        <div className="md:col-span-5 flex flex-col gap-3">
          {/* Key Metrics Cards */}
          {previewState.metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-2">
              {previewState.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 backdrop-blur-sm flex items-center justify-between"
                >
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                      {metric.label}
                    </div>
                    <div className="text-sm font-bold text-white tracking-tight mt-0.5">
                      {metric.value}
                    </div>
                  </div>
                  {metric.trend && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
                      {metric.trend}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Live Terminal Output */}
          {previewState.terminalLogs && (
            <div className="flex-1 rounded-xl border border-white/[0.08] bg-black/80 p-3 font-mono text-[11px] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 text-white/40 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <Terminal className="size-3 text-indigo-400" />
                  <span>AGENT KERNEL LOGS</span>
                </div>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="size-3" /> VERIFIED
                </span>
              </div>
              <div className="space-y-1.5 text-white/70 overflow-y-auto max-h-36 scrollbar-thin">
                {previewState.terminalLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-indigo-400 shrink-0">&gt;</span>
                    <span className="leading-tight">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audio Narration Bar */}
      <div className="relative z-10 rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3.5 backdrop-blur-md flex items-center gap-3">
        <div className="size-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
          <Volume2 className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-semibold">
              Voice-Over Narration
            </span>
            <span className="text-[10px] font-mono text-white/40">
              ({chapter.duration}s Chapter)
            </span>
          </div>
          <p className="text-xs text-white/90 truncate font-sans italic mt-0.5">
            &ldquo;{chapter.narration}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
