"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Brain, Cpu, Database, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#080811] shadow-[0_0_80px_rgba(0,0,0,0.85)] z-10"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Play className="size-4 fill-indigo-400/20" />
                </div>
                <div>
                  <h2 id="demo-modal-title" className="text-sm font-semibold text-white tracking-tight">
                    Orbit Autonomous Execution Walkthrough
                  </h2>
                  <p className="text-xs text-white/50 font-mono">15 Specialist Agents · Real-Time Orchestration</p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close demo modal"
                className="size-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
                data-cursor="hover"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Video / Interactive Simulation Canvas */}
            <div className="relative aspect-video w-full bg-black flex flex-col items-center justify-center overflow-hidden border-b border-white/[0.08]">
              {/* Cinematic Grid & Background Lighting */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{
                  backgroundImage: "radial-gradient(rgba(99, 102, 241, 0.35) 1px, transparent 1px)",
                  backgroundSize: "24px 24px"
                }} 
              />
              <div className="absolute -top-24 -left-24 size-80 rounded-full bg-indigo-600/20 blur-3xl" />
              <div className="absolute -bottom-24 -right-24 size-80 rounded-full bg-cyan-600/20 blur-3xl" />

              {/* Operating System Interactive Simulation Frame */}
              <div className="relative z-10 w-11/12 max-w-2xl rounded-xl border border-white/10 bg-[#0c0c16]/90 p-6 backdrop-blur-2xl shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono text-emerald-300 font-medium">CO-FOUNDER SYSTEM ACTIVE</span>
                  </div>
                  <span className="text-[11px] font-mono text-white/40">LATENCY: 14ms · LANGGRAPH READY</span>
                </div>

                {/* Simulated Agent Deliberation */}
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                    <Brain className="size-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-indigo-300 font-semibold">Problem Discovery Agent:</span>{" "}
                      <span className="text-white/80">Identified acute founder bottleneck in technical architecture scoping.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                    <Database className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-cyan-300 font-semibold">Database Architect Agent:</span>{" "}
                      <span className="text-white/80">Synthesized relational PostgreSQL schema with zero-downtime indexes.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                    <Cpu className="size-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-purple-300 font-semibold">Technical Architect Agent:</span>{" "}
                      <span className="text-white/80">Generated OpenAPI 3.1 contract and 14-day sprint backlog tickets.</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-[11px] text-white/50">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    <span>Consensus Score: 94/100 (Unanimous Approval)</span>
                  </div>
                  <span className="text-indigo-400 font-medium">Ready for deployment</span>
                </div>
              </div>
            </div>

            {/* Modal Footer / Direct Transition */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white/[0.01]">
              <p className="text-xs text-white/60">
                Experience the full 15-agent autonomous workspace directly in your browser.
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/login"
                  prefetch={true}
                  onClick={onClose}
                  className="w-full sm:w-auto text-center px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                  data-cursor="hover"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  prefetch={true}
                  onClick={onClose}
                  className="w-full sm:w-auto text-center px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.35)] transition-all"
                  data-cursor="hover"
                >
                  <span>Register Account</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
