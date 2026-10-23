// apps/frontend/components/landing/WatchDemoModal.tsx
// Section 11: WATCH DEMO MODAL
// Fallback chain: mp4 → m3u8 → 7-step walkthrough (Framer Motion) → static poster + email capture
// 90vw × 90vh, black scrim, backdrop-blur(24px), focus trap, ESC close, scroll lock, telemetry

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Cpu,
  FileText,
  Network,
  Kanban,
  Rocket,
  Send,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/analytics";

interface WatchDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StepData {
  id: number;
  title: string;
  shortLabel: string;
  caption: string;
  icon: React.ElementType;
  accentColor: string;
  uiContent: React.ReactNode;
}

const STEPS: StepData[] = [
  {
    id: 1,
    title: "Idea Input",
    shortLabel: "Idea",
    caption: "One prompt initializes the autonomous startup substrate.",
    icon: Sparkles,
    accentColor: "#7C5CFF",
    uiContent: (
      <div className="w-full h-full p-6 flex flex-col justify-center items-center text-center font-mono">
        <div className="w-full max-w-xl p-5 rounded-xl bg-[#07070B] border border-[#1E1E2A] text-left space-y-3">
          <div className="flex items-center gap-2 text-xs text-[#8A8A96]">
            <span className="w-2 h-2 rounded-full bg-[#7C5CFF] animate-pulse" />
            <span>FOUNDER PROMPT INITIALIZATION</span>
          </div>
          <div className="text-sm text-[#EDEDF2] font-sans">
            &quot;Build an AI-native observability platform that detects microservice cascading failures before they impact SLA.&quot;
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-[#1E1E2A] text-[11px] text-[#4ADE80]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Synthesizing problem space across 14 market categories...</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Validation",
    shortLabel: "Validate",
    caption: "Constitutional agents cross-examine competitors and moats in real time.",
    icon: CheckCircle2,
    accentColor: "#4ADE80",
    uiContent: (
      <div className="w-full h-full p-6 flex flex-col justify-center items-center font-mono">
        <div className="w-full max-w-xl grid grid-cols-2 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-[#07070B] border border-[#1E1E2A] space-y-1.5">
            <span className="text-[#8A8A96] text-[11px]">MARKET VALIDATION</span>
            <div className="text-xl font-bold text-[#4ADE80]">94%</div>
            <p className="text-[11px] text-[#8A8A96] font-sans">Validated pain point with 48 active enterprise signals</p>
          </div>
          <div className="p-4 rounded-xl bg-[#07070B] border border-[#1E1E2A] space-y-1.5">
            <span className="text-[#8A8A96] text-[11px]">DEFENSIBILITY INDEX</span>
            <div className="text-xl font-bold text-[#A48BFF]">HIGH</div>
            <p className="text-[11px] text-[#8A8A96] font-sans">Zero-marginal cost data network effects confirmed</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Agents",
    shortLabel: "Agents",
    caption: "Seven specialized intelligences orchestrate synchronously.",
    icon: Cpu,
    accentColor: "#38BDF8",
    uiContent: (
      <div className="w-full h-full p-6 flex flex-col justify-center items-center font-mono">
        <div className="w-full max-w-xl grid grid-cols-3 gap-2.5 text-xs text-center">
          {["Market", "Product", "Architect", "Sprint", "Launch", "Growth"].map((agent, i) => (
            <div key={agent} className="p-3 rounded-lg bg-[#07070B] border border-[#1E1E2A] flex flex-col items-center gap-1">
              <span className="text-[#EDEDF2] font-semibold">{agent}</span>
              <span className="text-[10px] text-[#38BDF8]">Agent {i + 1} · Online</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "PRD",
    shortLabel: "PRD",
    caption: "Comprehensive technical product requirement doc synthesized.",
    icon: FileText,
    accentColor: "#FBBF24",
    uiContent: (
      <div className="w-full h-full p-6 flex flex-col justify-center items-center font-mono">
        <div className="w-full max-w-xl p-4 rounded-xl bg-[#07070B] border border-[#1E1E2A] text-left space-y-2 text-xs">
          <div className="flex justify-between items-center text-[#FBBF24] text-[11px] font-bold">
            <span>PRD v2.4 · READY FOR COMPOSITION</span>
            <span>100% COMPLETE</span>
          </div>
          <p className="text-[#8A8A96] text-[11px]">User Personas: SRE Leads, Platform Directors</p>
          <p className="text-[#8A8A96] text-[11px]">Core Loop: Real-time telemetry ingestion → Root cause synthesis</p>
          <div className="text-[#EDEDF2] text-[11px] pt-1 border-t border-[#1E1E2A]">
            Includes 18 user stories and 6 critical acceptance bounds.
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: "Architecture",
    shortLabel: "Arch",
    caption: "PostgreSQL schema and vector embedding topology mapped.",
    icon: Network,
    accentColor: "#A48BFF",
    uiContent: (
      <div className="w-full h-full p-6 flex flex-col justify-center items-center font-mono">
        <div className="w-full max-w-xl p-4 rounded-xl bg-[#07070B] border border-[#1E1E2A] text-left text-xs space-y-2">
          <div className="text-[#A48BFF] text-[11px] font-bold">SYSTEM GRAPH TOPOLOGY</div>
          <div className="text-[#EDEDF2] bg-[#12121A] p-2.5 rounded border border-[#1E1E2A] text-[11px]">
            POSTGRES (State) ── gRPC ── VECTOR DB (Embeddings) ── SSE (Streams)
          </div>
          <p className="text-[#8A8A96] text-[11px]">Zero-latency streaming RPC configured for edge clients.</p>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    title: "Sprint",
    shortLabel: "Sprint",
    caption: "Stories decomposed, implemented, verified with tests.",
    icon: Kanban,
    accentColor: "#F43F5E",
    uiContent: (
      <div className="w-full h-full p-6 flex flex-col justify-center items-center font-mono">
        <div className="w-full max-w-xl space-y-2 text-xs">
          <div className="flex justify-between items-center text-[#8A8A96] text-[11px]">
            <span>SPRINT EXECUTION CYCLE</span>
            <span className="text-[#4ADE80]">18/24 TASKS PASSING</span>
          </div>
          <div className="w-full bg-[#1A1A24] h-2 rounded-full overflow-hidden">
            <div className="bg-[#7C5CFF] h-full w-3/4 transition-all duration-500" />
          </div>
          <div className="text-[11px] text-[#8A8A96] pt-1">
            4 parallel worker agents generating clean TypeScript modules.
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 7,
    title: "Launch",
    shortLabel: "Launch",
    caption: "Pre-flight verification passed. Production containers active.",
    icon: Rocket,
    accentColor: "#10B981",
    uiContent: (
      <div className="w-full h-full p-6 flex flex-col justify-center items-center font-mono">
        <div className="w-full max-w-xl p-5 rounded-xl bg-[#07070B] border border-[#10B981]/30 text-center space-y-2 text-xs">
          <div className="text-[#10B981] text-base font-bold flex items-center justify-center gap-2">
            <Rocket className="w-5 h-5" />
            DEPLOYMENT CONFIRMED
          </div>
          <p className="text-[#EDEDF2] font-sans text-sm">
            Founder Operating System running in live production state.
          </p>
          <div className="text-[11px] text-[#8A8A96]">
            Latency: 12ms · SSL: Active · All 7 Agents Standing By
          </div>
        </div>
      </div>
    ),
  },
];

export function WatchDemoModal({ isOpen, onClose }: WatchDemoModalProps) {
  const [sourceMode, setSourceMode] = useState<"mp4" | "m3u8" | "walkthrough" | "poster">("walkthrough");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [stepProgress, setStepProgress] = useState(0);
  const [emailInput, setEmailInput] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const openTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check available media sources per Section 11 preference
  useEffect(() => {
    if (!isOpen) return;

    let isSubscribed = true;
    openTimeRef.current = Date.now();
    trackEvent("demo_modal", { action: "open" });

    async function probeSources() {
      try {
        const mp4Res = await fetch("/demo.mp4", { method: "HEAD" });
        if (mp4Res.ok && isSubscribed) {
          setSourceMode("mp4");
          return;
        }
      } catch {
        // Fall to next preference
      }

      try {
        const m3u8Res = await fetch("/demo.m3u8", { method: "HEAD" });
        if (m3u8Res.ok && isSubscribed) {
          setSourceMode("m3u8");
          return;
        }
      } catch {
        // Fall to 7-step walkthrough
      }

      if (isSubscribed) {
        setSourceMode("walkthrough");
      }
    }

    probeSources();

    return () => {
      isSubscribed = false;
      const dwellMs = Date.now() - openTimeRef.current;
      trackEvent("demo_modal", { action: "close", dwell_ms: dwellMs });
    };
  }, [isOpen]);

  // Handle focus trap and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Trap Tab key
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Auto-focus first interactive element
    const initialTimer = setTimeout(() => {
      if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(initialTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  // Auto-advance 8s timer for walkthrough mode
  useEffect(() => {
    if (!isOpen || sourceMode !== "walkthrough" || !isPlaying) return;

    const intervalMs = 100;
    const totalStepMs = 8000;

    timerRef.current = setInterval(() => {
      setStepProgress((prev) => {
        const next = prev + (intervalMs / totalStepMs) * 100;
        if (next >= 100) {
          setCurrentStep((s) => {
            const nextStep = (s + 1) % STEPS.length;
            trackEvent("demo_modal", {
              action: "step_viewed",
              step: nextStep + 1,
              title: STEPS[nextStep]?.title,
            });
            if (nextStep === 0) {
              trackEvent("demo_modal", {
                action: "complete",
                total_dwell_ms: Date.now() - openTimeRef.current,
              });
            }
            return nextStep;
          });
          return 0;
        }
        return next;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, sourceMode, isPlaying]);

  const handleSeek = useCallback((index: number) => {
    setCurrentStep(index);
    setStepProgress(0);
    trackEvent("demo_modal", {
      action: "step_viewed",
      step: index + 1,
      title: STEPS[index]?.title,
    });
  }, []);

  const handleNext = useCallback(() => {
    handleSeek((currentStep + 1) % STEPS.length);
  }, [currentStep, handleSeek]);

  const handlePrev = useCallback(() => {
    handleSeek((currentStep - 1 + STEPS.length) % STEPS.length);
  }, [currentStep, handleSeek]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    trackEvent("demo_email_capture", { email: emailInput });
    setEmailSubmitted(true);
  };

  if (!isOpen) return null;

  const currentStepData = STEPS[currentStep] ?? STEPS[0]!;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-[24px] p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Orbit Product Walkthrough Demo"
    >
      <div
        ref={modalRef}
        className="relative w-[90vw] h-[90vh] max-w-6xl bg-[#0A0A0F] border border-[#1E1E2A] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#EDEDF2]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A24] bg-[#07070B] z-10">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-[#7C5CFF] font-semibold">
              ORBIT DEMO
            </span>
            <span className="text-xs text-[#8A8A96] hidden sm:inline">
              Autonomous 7-Agent Pipeline Walkthrough
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 text-[#8A8A96] hover:text-[#EDEDF2] hover:bg-[#14141E] rounded-md transition-colors text-xs flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#7C5CFF]"
              aria-label={isPlaying ? "Pause walkthrough" : "Resume walkthrough"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-[#4ADE80]" />}
              <span className="font-mono hidden md:inline">{isPlaying ? "Pause" : "Play"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8A8A96] hover:text-[#EDEDF2] hover:bg-[#14141E] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]"
              aria-label="Close demo modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 7-Segment Progress Bar (Click-to-seek per Section 11) */}
        {sourceMode === "walkthrough" && (
          <div className="w-full bg-[#07070B] px-6 py-2.5 border-b border-[#1A1A24] flex items-center gap-2">
            {STEPS.map((step, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;
              const fillPct = isPast ? 100 : isCurrent ? stepProgress : 0;

              return (
                <button
                  key={step.id}
                  onClick={() => handleSeek(idx)}
                  className="flex-1 group py-1 flex flex-col gap-1 text-left focus-visible:outline-none"
                  aria-label={`Jump to Step ${step.id}: ${step.title}`}
                >
                  <div className="w-full h-1.5 bg-[#1E1E2A] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#7C5CFF] transition-all duration-100 ease-linear"
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8A8A96] group-hover:text-[#EDEDF2]">
                    <span className={isCurrent ? "text-[#EDEDF2] font-semibold" : ""}>
                      {step.id}. {step.shortLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Content Viewport */}
        <div className="flex-1 relative flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#0A0A12] to-[#050507]">
          {/* Mode 1: Native MP4 Video */}
          {sourceMode === "mp4" && (
            <div className="w-full h-full flex items-center justify-center p-6">
              <video
                src="/demo.mp4"
                controls
                autoPlay
                muted
                className="max-w-full max-h-full rounded-xl shadow-2xl border border-[#1E1E2A]"
                onError={() => setSourceMode("walkthrough")}
              />
            </div>
          )}

          {/* Mode 2: HLS Stream (falls through if unavailable) */}
          {sourceMode === "m3u8" && (
            <div className="w-full h-full flex items-center justify-center p-6">
              <video
                src="/demo.m3u8"
                controls
                autoPlay
                muted
                className="max-w-full max-h-full rounded-xl shadow-2xl border border-[#1E1E2A]"
                onError={() => setSourceMode("walkthrough")}
              />
            </div>
          )}

          {/* Mode 3: 7-Step Animated Product Walkthrough (Framer Motion) */}
          {sourceMode === "walkthrough" && (
            <div className="w-full h-full flex flex-col justify-between p-6 sm:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full flex-1 flex flex-col items-center justify-center"
                >
                  {/* Step Title Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-mono text-xs text-[#7C5CFF] px-2.5 py-0.5 rounded bg-[#7C5CFF]/10 border border-[#7C5CFF]/20">
                      STEP {currentStepData.id} OF 7
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#EDEDF2]">
                      {currentStepData.title}
                    </h3>
                  </div>

                  {/* UI Simulation Canvas */}
                  <div className="w-full max-w-3xl h-64 sm:h-72 rounded-2xl bg-[#0A0A10] border border-[#1E1E2A] shadow-2xl relative overflow-hidden flex items-center justify-center">
                    {currentStepData.uiContent}
                  </div>

                  {/* 1-Line Exact Caption */}
                  <p className="mt-5 text-sm sm:text-base text-[#8A8A96] text-center max-w-xl font-normal">
                    {currentStepData.caption}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#1A1A24]">
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 text-xs font-mono text-[#8A8A96] hover:text-[#EDEDF2] hover:bg-[#14141E] rounded-lg transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#7C5CFF]"
                  aria-label="Previous step"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="font-mono text-xs text-[#4A4A55]">
                  Auto-advances every 8s
                </div>

                <button
                  onClick={handleNext}
                  className="px-4 py-2 text-xs font-mono text-[#EDEDF2] bg-[#7C5CFF] hover:bg-[#6845F5] rounded-lg transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#A48BFF]"
                  aria-label="Next step"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Mode 4: Poster Fallback + Email Capture */}
          {sourceMode === "poster" && (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="w-12 h-12 text-[#7C5CFF] mb-4" />
              <h3 className="text-2xl font-bold text-[#EDEDF2] mb-2">Demo Coming Soon</h3>
              <p className="text-sm text-[#8A8A96] max-w-md mb-6">
                Live interactive walkthrough recorded sessions are preparing. Enter your email to receive direct founder sandbox access.
              </p>

              {emailSubmitted ? (
                <div className="p-3 bg-[#4ADE80]/10 border border-[#4ADE80]/30 rounded-lg text-sm text-[#4ADE80] font-mono">
                  Thank you. Sandbox invite dispatched on next build.
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="flex gap-2 max-w-md w-full">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="founder@company.com"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-[#07070B] border border-[#1E1E2A] text-sm text-[#EDEDF2] placeholder-[#8A8A96] focus:outline-none focus:border-[#7C5CFF]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#7C5CFF] hover:bg-[#6845F5] text-sm font-medium text-[#EDEDF2] rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>Notify</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 border-t border-[#1A1A24] bg-[#07070B] flex items-center justify-between text-xs text-[#8A8A96] font-mono">
          <span>Press ESC or click backdrop to close</span>
          <span className="hidden sm:inline">Telemetry: Active</span>
        </div>
      </div>
    </div>
  );
}
