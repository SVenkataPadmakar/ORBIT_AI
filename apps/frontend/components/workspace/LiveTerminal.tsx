"use client";

import React, { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import { Terminal, Copy, Check, Trash2, Maximize2, Minimize2 } from "lucide-react";
import { useStartupStore } from "@/lib/stores/startup-store";
import { cn } from "@/lib/utils/cn";

export interface LiveTerminalProps {
  runId?: string;
  className?: string;
  defaultHeight?: string;
  isDone?: boolean;
}

export const LiveTerminal = memo(function LiveTerminal({
  runId,
  className,
  defaultHeight = "max-h-64",
  isDone = false,
}: LiveTerminalProps) {
  const terminalLogs = useStartupStore((s) => s.terminalLogs);
  const clearTerminalLogs = useStartupStore((s) => s.clearTerminalLogs);
  const agentProgress = useStartupStore((s) => s.agentProgress);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if pipeline status is done
  const step7Progress = agentProgress["risk_analysis"] || agentProgress["developer"];
  const isCompletedFromStore =
    step7Progress && (step7Progress.status === "done" || step7Progress.percent >= 100);
  const isTerminalDone = Boolean(isDone || isCompletedFromStore);

  // Auto-scroll to bottom whenever new logs arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  const handleCopy = () => {
    if (terminalLogs.length === 0) return;
    navigator.clipboard.writeText(terminalLogs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-black font-mono text-green-400 shadow-2xl overflow-hidden transition-all duration-300",
        className
      )}
    >
      {/* ── Terminal Header Bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/90 border-b border-white/[0.08] select-none">
        <div className="flex items-center gap-2.5">
          {/* macOS style window dots */}
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-500/80" />
            <span className="size-2.5 rounded-full bg-yellow-500/80" />
            <span className="size-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <div className="flex items-center gap-2 pl-2 text-xs font-semibold tracking-wider uppercase text-zinc-400">
            <Terminal className="size-3.5 text-green-400" />
            <span className="text-zinc-200">Live Terminal</span>
            <span className="text-zinc-600">·</span>
            <span className="text-[11px] text-zinc-500 lowercase">
              {runId ? `run:${runId.slice(0, 8)}` : "agent-bus"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live indicator badge */}
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium transition-colors",
              isTerminalDone
                ? "bg-zinc-800/60 border-zinc-700/60 text-zinc-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                isTerminalDone ? "bg-zinc-500" : "bg-emerald-400 animate-pulse"
              )}
            />
            <span>{isTerminalDone ? "COMPLETED" : "STREAMING"}</span>
          </div>

          {/* Copy Logs Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Copy logs"
            aria-label="Copy logs"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          </button>

          {/* Clear Button */}
          <button
            type="button"
            onClick={clearTerminalLogs}
            className="p-1 rounded-md text-zinc-400 hover:text-red-400 hover:bg-white/10 transition-colors"
            title="Clear logs"
            aria-label="Clear logs"
          >
            <Trash2 className="size-3.5" />
          </button>

          {/* Toggle Expand Height */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
            aria-label={isExpanded ? "Collapse terminal" : "Expand terminal"}
          >
            {isExpanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Terminal Scrolling Feed with Typewriter Slide-In ── */}
      <div
        className={cn(
          "p-4 overflow-y-auto space-y-1 text-xs select-text scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent leading-relaxed",
          isExpanded ? "max-h-[500px]" : defaultHeight
        )}
      >
        {terminalLogs.length === 0 ? (
          <div className="text-zinc-600 italic">
            <span>[SYSTEM] Connected to agent orchestration bus. Awaiting live execution logs...</span>
          </div>
        ) : (
          terminalLogs.map((log, idx) => {
            const isError = /fail|error|exception/i.test(log);
            const isSuccess = /pass|success|verified|done|complete/i.test(log);
            const isPackage = /zip|download|deliverable/i.test(log);

            return (
              <motion.div
                key={`${idx}-${log.slice(0, 20)}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={cn(
                  "flex items-start gap-2 font-mono break-all",
                  isError
                    ? "text-red-400"
                    : isSuccess
                    ? "text-emerald-400"
                    : isPackage
                    ? "text-cyan-400"
                    : "text-green-400"
                )}
              >
                <span className="text-zinc-600 select-none shrink-0">&gt;</span>
                <span className="flex-1">{log}</span>
              </motion.div>
            );
          })
        )}

        {/* Terminal Prompt Cursor: Stops blinking when status === "done" */}
        <div className="flex items-center gap-1.5 text-green-400 pt-1">
          <span className="text-zinc-600 select-none">&gt;</span>
          <span
            className={cn(
              "font-bold text-sm select-none",
              isTerminalDone
                ? "text-zinc-600"
                : "text-green-400 animate-pulse"
            )}
          >
            _
          </span>
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  );
});
