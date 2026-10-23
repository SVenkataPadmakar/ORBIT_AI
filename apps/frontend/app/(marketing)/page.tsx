"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import LandingPageV3 from "./page.v3";
import { Navbar } from "@/components/landing/Navbar";
import { ScrollProgressBar } from "@/components/landing/ScrollOrchestrator";

const LandingCanvas = dynamic(
  () => import("@/components/landing/LandingCanvas").then((mod) => mod.LandingCanvas),
  { ssr: false }
);
import { SceneShell } from "@/components/landing/SceneShell";
import { SparkSVG } from "@/components/landing/fallbacks/SparkSVG";
import { ValidateSVG } from "@/components/landing/fallbacks/ValidateSVG";
import { ProductSVG } from "@/components/landing/fallbacks/ProductSVG";
import { AgentsSVG } from "@/components/landing/fallbacks/AgentsSVG";
import { GalaxySVG } from "@/components/landing/fallbacks/GalaxySVG";
import { CoreStatic } from "@/components/landing/fallbacks/CoreStatic";
import { WatchDemoModal } from "@/components/landing/WatchDemoModal";
import { CommandPalette } from "@/components/landing/CommandPalette";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useFpsMonitor } from "@/hooks/useFpsMonitor";
import { trackEvent } from "@/lib/analytics";

export default function MarketingPage() {
  // Feature flag check (Section 18): if flag is explicitly "false", render v3
  const isV4Enabled = process.env.NEXT_PUBLIC_LANDING_V4 !== "false";

  if (!isV4Enabled) {
    return <LandingPageV3 />;
  }

  return <LandingPageV4 />;
}

function LandingPageV4() {
  const { scrollState, progressRef } = useScrollProgress();
  const tierConfig = useDeviceTier();
  const prefersReducedMotion = usePrefersReducedMotion();
  const fpsStatus = useFpsMonitor(true);

  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [hasWebGlError, setHasWebGlError] = useState(false);
  const [isCanvasMounted, setIsCanvasMounted] = useState(false);

  // Global Cmd+K / Ctrl+K listener for Command Palette (Section 12)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    // Mount canvas during idle period after initial interactive paint for 0ms TBT on mobile
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const handle = (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(
        () => setIsCanvasMounted(true),
        { timeout: 1200 }
      );
      return () => {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle);
      };
    } else {
      const timer = setTimeout(() => setIsCanvasMounted(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Accessible scene announcer for screen readers
  const [announcedScene, setAnnouncedScene] = useState("Scene 1: The Spark");

  useEffect(() => {
    const sceneNames = [
      "Scene 1: The Spark",
      "Scene 2: Validation Orbit",
      "Scene 3: Product Formation",
      "Scene 4: Agent Awakening",
      "Scene 5: Startup Galaxy",
      "Scene 6: Orbit Core",
    ];
    setAnnouncedScene(sceneNames[scrollState.currentScene] || "Orbit");
    trackEvent("scene_viewed", { scene: scrollState.currentScene + 1, name: sceneNames[scrollState.currentScene] });
  }, [scrollState.currentScene]);

  // Section 20: Scroll depth milestones {25, 50, 75, 100}
  const trackedDepthsRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    const pct = Math.round(scrollState.progress * 100);
    const milestones = [25, 50, 75, 100];
    milestones.forEach((m) => {
      if (pct >= m && !trackedDepthsRef.current.has(m)) {
        trackedDepthsRef.current.add(m);
        trackEvent("scroll_depth", { depth: m });
      }
    });
  }, [scrollState.progress]);

  const shouldRenderStaticFallback =
    prefersReducedMotion ||
    hasWebGlError ||
    fpsStatus.shouldFallbackToStatic ||
    tierConfig.tier === "TIER_C";

  return (
    <main className="relative min-h-screen bg-[#050507] text-[#EDEDF2] overflow-x-clip selection:bg-[#7C5CFF]/30 selection:text-white">
      {/* 1px Accent Scroll Progress Line */}
      <ScrollProgressBar progress={scrollState.progress} />

      {/* Screen Reader Live Region for WCAG 2.2 AA */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcedScene}
      </div>

      {/* Primary Linear-style Navbar */}
      <Navbar
        onOpenDemo={() => setIsDemoOpen(true)}
        onOpenCommandPalette={() => setIsPaletteOpen(true)}
      />

      {/* Background 3D R3F Canvas (aria-hidden) */}
      {!shouldRenderStaticFallback && isCanvasMounted && (
        <LandingCanvas
          progressRef={progressRef}
          currentScene={scrollState.currentScene}
          prefersReducedMotion={prefersReducedMotion}
          tier={tierConfig.tier}
          onContextLost={() => {
            setHasWebGlError(true);
            trackEvent("error_webgl", { error: "context_lost" });
          }}
        />
      )}

      {/* ─── SCENE 1: THE SPARK (100vh) ─────────────────────────────────────── */}
      <SceneShell
        id="spark"
        minHeight="min-h-screen"
        ariaLabel="Scene 1: The Spark"
        className="pt-24 pb-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content (Rule of thirds framing) */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 max-w-xl">
            {/* Monospace Uppercase Eyebrow */}
            <div className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-[#7C5CFF] font-medium px-2.5 py-1 rounded bg-[#7C5CFF]/10 border border-[#7C5CFF]/25 backdrop-blur-sm">
              ORBIT
            </div>

            {/* Display H1 */}
            <h1 className="text-[clamp(2.75rem,5.5vw,4.75rem)] font-bold tracking-[-0.04em] leading-[0.98] text-[#EDEDF2]">
              One idea. <br />
              <span className="text-[#8A8A96]">A whole company.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-[#8A8A96] leading-relaxed max-w-md font-normal">
              The AI Founder Operating System.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                type="button"
                onClick={() => {
                  trackEvent("cta_clicked", { cta: "watch_demo", location: "hero" });
                  setIsDemoOpen(true);
                }}
                className="px-6 py-3 text-sm font-medium text-[#EDEDF2] bg-[#0A0A0F] hover:bg-[#14141E] border border-[#1E1E2A] hover:border-[#7C5CFF]/40 rounded-lg transition-all shadow-sm flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]"
              >
                <Play className="w-4 h-4 text-[#7C5CFF] group-hover:scale-110 transition-transform" />
                <span>Watch demo</span>
              </button>

              <Link
                href="/register"
                onClick={() => trackEvent("cta_clicked", { cta: "register", location: "hero" })}
                className="px-6 py-3 text-sm font-medium text-[#EDEDF2] bg-[#7C5CFF] hover:bg-[#6845F5] rounded-lg transition-all shadow-lg shadow-[#7C5CFF]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A48BFF]"
              >
                Register
              </Link>
            </div>

            {/* Micro-caption revealed cleanly on scroll-stop */}
            <div
              className={`pt-6 transition-opacity duration-300 text-xs font-mono text-[#4A4A55] ${
                !scrollState.isScrolling ? "opacity-100" : "opacity-40"
              }`}
            >
              Idea → Validation → Product → Architecture → Build → Launch
            </div>
          </div>

          {/* Right Static Vector Fallback (Active when WebGL is disabled/reduced-motion) */}
          {shouldRenderStaticFallback && (
            <div className="lg:col-span-5 flex items-center justify-center py-8">
              <SparkSVG isStatic={prefersReducedMotion} />
            </div>
          )}
        </div>
      </SceneShell>

      {/* ─── SCENE 2: VALIDATION ORBIT (150vh) ──────────────────────────────── */}
      <SceneShell
        id="validate"
        minHeight="min-h-[150vh]"
        ariaLabel="Scene 2: Validation Orbit"
        className="pt-24 pb-12 flex flex-col justify-center"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content (Rule of thirds) */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 max-w-xl">
            {/* Monospace Uppercase Eyebrow */}
            <div className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-[#7C5CFF] font-medium px-2.5 py-1 rounded bg-[#7C5CFF]/10 border border-[#7C5CFF]/25 backdrop-blur-sm">
              VALIDATION
            </div>

            {/* Display H2 (≤ 8 words per spec) */}
            <h2 className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold tracking-[-0.03em] leading-[1.05] text-[#EDEDF2]">
              Tested against the market. <br />
              <span className="text-[#8A8A96]">Before you build.</span>
            </h2>

            {/* Micro-caption revealed cleanly on scroll-stop */}
            <div
              className={`transition-opacity duration-300 text-sm font-mono text-[#8A8A96] flex items-center gap-2 pt-2 ${
                !scrollState.isScrolling ? "opacity-100" : "opacity-40"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
              <span>Live competitor scans.</span>
            </div>
          </div>

          {/* Right Static Vector Fallback (Active when WebGL is disabled/reduced-motion) */}
          {shouldRenderStaticFallback && (
            <div className="lg:col-span-5 flex items-center justify-center py-8">
              <ValidateSVG isStatic={prefersReducedMotion} />
            </div>
          )}
        </div>
      </SceneShell>

      {/* ─── SCENE 3: PRODUCT FORMATION (150vh) ─────────────────────────────── */}
      <SceneShell
        id="product"
        minHeight="min-h-[150vh]"
        ariaLabel="Scene 3: Product Formation"
        className="relative"
      >
        <div className="sticky top-0 h-screen flex items-center w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            {/* Left Content (Rule of thirds) */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6 max-w-xl">
              {/* Monospace Uppercase Eyebrow */}
              <div className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-[#7C5CFF] font-medium px-2.5 py-1 rounded bg-[#7C5CFF]/10 border border-[#7C5CFF]/25 backdrop-blur-sm">
                PRODUCT
              </div>

              {/* Display H2 (≤ 8 words per spec) */}
              <h2 className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold tracking-[-0.03em] leading-[1.05] text-[#EDEDF2]">
                Structure from chaos.
              </h2>

              {/* Micro-caption revealed cleanly on scroll-stop */}
              <div
                className={`transition-opacity duration-300 text-sm font-mono text-[#8A8A96] flex items-center gap-2 pt-2 ${
                  !scrollState.isScrolling ? "opacity-100" : "opacity-40"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF]" />
                <span>Features, flows, architecture — one system.</span>
              </div>
            </div>

            {/* Right Static Vector Fallback (Active when WebGL is disabled/reduced-motion) */}
            {shouldRenderStaticFallback && (
              <div className="lg:col-span-5 flex items-center justify-center py-8">
                <ProductSVG isStatic={prefersReducedMotion} />
              </div>
            )}
          </div>
        </div>
      </SceneShell>

      {/* ─── SCENE 4: AGENT AWAKENING (200vh) ───────────────────────────────── */}
      <SceneShell
        id="agents"
        minHeight="min-h-[200vh]"
        ariaLabel="Scene 4: Agent Awakening"
        className="relative"
      >
        <div className="sticky top-0 h-screen flex items-center w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            {/* Left Content (Rule of thirds framing) */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6 max-w-xl">
              {/* Monospace Uppercase Eyebrow */}
              <div className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-[#7C5CFF] font-medium px-2.5 py-1 rounded bg-[#7C5CFF]/10 border border-[#7C5CFF]/25 backdrop-blur-sm">
                AGENTS
              </div>

              {/* Display H2 (≤ 8 words per spec) */}
              <h2 className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold tracking-[-0.03em] leading-[1.05] text-[#EDEDF2]">
                Seven intelligences. <br />
                <span className="text-[#8A8A96]">One mission.</span>
              </h2>

              {/* Micro-caption revealed cleanly on scroll-stop */}
              <div
                className={`transition-opacity duration-300 text-sm font-mono text-[#8A8A96] flex items-center gap-2 pt-2 ${
                  !scrollState.isScrolling ? "opacity-100" : "opacity-40"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#A48BFF]" />
                <span>Every step. Every decision. Traced.</span>
              </div>
            </div>

            {/* Right Static Vector Fallback (Active when WebGL is disabled/reduced-motion) */}
            {shouldRenderStaticFallback && (
              <div className="lg:col-span-5 flex items-center justify-center py-8">
                <AgentsSVG isStatic={prefersReducedMotion} />
              </div>
            )}
          </div>
        </div>
      </SceneShell>

      {/* ─── SCENE 5: STARTUP GALAXY (200vh) ─────────────────────────────────── */}
      <SceneShell
        id="galaxy"
        minHeight="min-h-[200vh]"
        ariaLabel="Scene 5: Startup Galaxy"
        className="relative !justify-start"
      >
        <div className="sticky top-0 h-screen flex items-center w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            {/* Left Content (Rule of thirds framing) */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6 max-w-xl">
              {/* Monospace Uppercase Eyebrow */}
              <div className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-[#7C5CFF] font-medium px-2.5 py-1 rounded bg-[#7C5CFF]/10 border border-[#7C5CFF]/25 backdrop-blur-sm">
                COMPANY
              </div>

              {/* Display H2 (≤ 8 words per spec) */}
              <h2 className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold tracking-[-0.03em] leading-[1.05] text-[#EDEDF2]">
                An idea, in motion.
              </h2>

              {/* Micro-caption revealed cleanly on scroll-stop */}
              <div
                className={`transition-opacity duration-300 text-sm font-mono text-[#8A8A96] flex items-center gap-2 pt-2 ${
                  !scrollState.isScrolling ? "opacity-100" : "opacity-40"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF]" />
                <span>Not a mockup. A running system.</span>
              </div>
            </div>

            {/* Right Static Vector Fallback (Active when WebGL is disabled/reduced-motion) */}
            {shouldRenderStaticFallback && (
              <div className="lg:col-span-5 flex items-center justify-center py-8">
                <GalaxySVG isStatic={prefersReducedMotion} />
              </div>
            )}
          </div>
        </div>
      </SceneShell>

      {/* ─── SCENE 6: ORBIT CORE (150vh) ─────────────────────────────────────── */}
      <SceneShell
        id="core"
        minHeight="min-h-[150vh]"
        ariaLabel="Scene 6: Orbit Core"
        className="relative !justify-start"
      >
        <div className="sticky top-0 h-screen flex items-center justify-center w-full">
          {shouldRenderStaticFallback ? (
            <CoreStatic
              isStatic={prefersReducedMotion}
              onOpenDemo={() => setIsDemoOpen(true)}
            />
          ) : (
            <div className="w-full max-w-4xl flex flex-col items-center justify-between h-[85vh] py-8 text-center px-4 pointer-events-auto">
              {/* Top Eyebrow & Accessible Title */}
              <div className="flex flex-col items-center gap-2">
                <div className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-[#7C5CFF] font-medium px-2.5 py-1 rounded bg-[#7C5CFF]/10 border border-[#7C5CFF]/25 backdrop-blur-sm">
                  ORBIT
                </div>
                <h2 className="font-mono text-2xl font-bold tracking-tight text-[#EDEDF2] md:opacity-0 pointer-events-none">
                  ORBIT
                </h2>
              </div>

              {/* Center clearance for 3D Wordmark & Product UI Preview */}
              <div className="flex-1 w-full pointer-events-none" />

              {/* Bottom Action Island with exact copy & CTAs */}
              <div className="flex flex-col items-center gap-4 bg-[#050507]/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-[#1E1E2A]/70 shadow-2xl">
                <p className="text-base sm:text-lg text-[#8A8A96] font-normal tracking-tight">
                  AI Founder Operating System.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/login"
                    onClick={() => trackEvent("cta_clicked", { cta: "signin", location: "core" })}
                    className="px-6 py-2.5 text-sm font-medium text-[#EDEDF2] bg-[#0A0A0F] hover:bg-[#14141E] border border-[#1E1E2A] hover:border-[#7C5CFF]/40 rounded-lg transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]"
                  >
                    Sign in
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => trackEvent("cta_clicked", { cta: "register", location: "core" })}
                    className="px-6 py-2.5 text-sm font-medium text-[#EDEDF2] bg-[#7C5CFF] hover:bg-[#6845F5] rounded-lg transition-all shadow-lg shadow-[#7C5CFF]/25 flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A48BFF]"
                  >
                    <span>Register</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      trackEvent("cta_clicked", { cta: "watch_demo", location: "core" });
                      setIsDemoOpen(true);
                    }}
                    className="px-6 py-2.5 text-sm font-medium text-[#EDEDF2] bg-[#0A0A0F] hover:bg-[#14141E] border border-[#1E1E2A] hover:border-[#7C5CFF]/40 rounded-lg transition-all shadow-sm flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]"
                  >
                    <Play className="w-4 h-4 text-[#7C5CFF] group-hover:scale-110 transition-transform" />
                    <span>Watch demo</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SceneShell>

      {/* ─── MODALS & COMMAND OVERLAYS ───────────────────────────────────────── */}
      <WatchDemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
      />

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onOpenDemo={() => setIsDemoOpen(true)}
      />
    </main>
  );
}
