"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import Lenis from "lenis";
import dynamic from "next/dynamic";

const OrbitUniverseCanvas = dynamic(
  () => import("./canvas/OrbitUniverseCanvas"),
  { ssr: false }
);
const OrbitDemoCenter = dynamic(
  () => import("./demo/OrbitDemoCenter").then((mod) => mod.OrbitDemoCenter),
  { ssr: false }
);
import { OrbitNavbar } from "./navbar/OrbitNavbar";
import { SectorNavRail, SECTORS } from "./hud/SectorNavRail";
import { CelestialInspector } from "./hud/CelestialInspector";
import { SectorHero } from "./sections/SectorHero";
import { SectorEcosystem } from "./sections/SectorEcosystem";
import { SectorCouncil } from "./sections/SectorCouncil";
import { SectorTrajectory } from "./sections/SectorTrajectory";
import { SectorLaunch } from "./sections/SectorLaunch";
import { AGENT_ENTITIES } from "./canvas/AgentConstellation";

export function OrbitExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollProgressRef = useRef(0);
  const lastNavScrolled = useRef(false);
  const lastActiveSector = useRef(0);

  const [navScrolled, setNavScrolled] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [activeSector, setActiveSector] = useState(0);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);

  // ── 0. Tab Visibility & Inactive Throttle (Save Battery & GPU) ──
  useEffect(() => {
    function handleVisibility() {
      setIsVisible(!document.hidden);
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ── Helper to calculate discrete sector index ──
  const getSectorIndex = (progress: number) => {
    return Math.min(
      SECTORS.length - 1,
      Math.max(
        0,
        SECTORS.findIndex((s, i) => {
          const next = SECTORS[i + 1];
          if (!next) return true;
          return progress < (s.targetProgress + next.targetProgress) / 2;
        })
      )
    );
  };

  // ── 1. Initialize Lenis Smooth Scroll with Mutable Ref Pipeline ──
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (typeof window.matchMedia === "function") {
      try {
        const lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 0.9,
          touchMultiplier: 1.5,
        });
        lenisRef.current = lenis;

        let rafId: number;
        function raf(time: number) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        lenis.on("scroll", (e: { progress: number; scroll: number }) => {
          // Direct mutable ref update: zero React re-render overhead for 3D canvas
          scrollProgressRef.current = e.progress;

          // State only updates when navbar threshold actually flips
          const isScrolled = e.scroll > 20;
          if (isScrolled !== lastNavScrolled.current) {
            lastNavScrolled.current = isScrolled;
            setNavScrolled(isScrolled);
          }

          // Discrete Sector change: Only triggers re-render when crossing sector boundary!
          const newSector = getSectorIndex(e.progress);
          if (newSector !== lastActiveSector.current) {
            lastActiveSector.current = newSector;
            setActiveSector(newSector);
          }
        });

        return () => {
          cancelAnimationFrame(rafId);
          lenis.destroy();
          lenisRef.current = null;
        };
      } catch (err) {
        console.warn("Lenis initialization skipped:", err);
      }
    }

    // Fallback native scroll listener for headless/testing environments
    function handleScroll() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      scrollProgressRef.current = progress;

      const isScrolled = window.scrollY > 20;
      if (isScrolled !== lastNavScrolled.current) {
        lastNavScrolled.current = isScrolled;
        setNavScrolled(isScrolled);
      }

      const newSector = getSectorIndex(progress);
      if (newSector !== lastActiveSector.current) {
        lastActiveSector.current = newSector;
        setActiveSector(newSector);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── 2. Track Normalized Mouse Coordinates for 3D Parallax ──
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ── 3. Automatic Agent Deliberation Cycle ──
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAgentIndex((prev) => (prev + 1) % AGENT_ENTITIES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // ── 4. Waypoint Navigation Fast Travel ──
  const handleNavigateSector = useCallback((targetProgress: number) => {
    if (!lenisRef.current) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = targetProgress * maxScroll;
    lenisRef.current.scrollTo(targetScroll, { duration: 1.4 });
  }, []);

  const handleOpenDemo = useCallback(() => setDemoOpen(true), []);
  const handleCloseDemo = useCallback(() => setDemoOpen(false), []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[#030308] text-white selection:bg-indigo-500/30 overflow-x-clip"
    >
      {/* ── Persistent 3D WebGL Canvas with High-Performance Ref Pipeline ── */}
      <OrbitUniverseCanvas
        scrollProgress={scrollProgressRef}
        mouse={mouseRef}
        isVisible={isVisible && !demoOpen}
        hoveredNodeId={hoveredNodeId}
        selectedNodeId={selectedNodeId}
        activeAgentIndex={activeAgentIndex}
        onHoverNode={setHoveredNodeId}
        onSelectNode={setSelectedNodeId}
        onSelectAgent={setActiveAgentIndex}
      />

      {/* ── Rebuilt Premium Founder OS Navigation Bar ── */}
      <OrbitNavbar
        isScrolled={navScrolled}
        onOpenDemo={handleOpenDemo}
        onNavigateSector={handleNavigateSector}
      />

      {/* ── Waypoint Direct Nav Rail ── */}
      <SectorNavRail
        activeSectorIndex={activeSector}
        onNavigateSector={handleNavigateSector}
      />

      {/* ── Foreground Storytelling Content Layers ── */}
      <main className="relative z-10">
        {/* Sector 01: Hero & Orbital Intelligence Core */}
        <SectorHero
          onOpenDemo={handleOpenDemo}
          onNavigateSector={handleNavigateSector}
        />

        {/* Sector 02: Orbital Ecosystem */}
        <SectorEcosystem
          hoveredNodeId={hoveredNodeId}
          selectedNodeId={selectedNodeId}
          onHoverNode={setHoveredNodeId}
          onSelectNode={setSelectedNodeId}
        />

        {/* Sector 03: Autonomous Council */}
        <SectorCouncil
          activeAgentIndex={activeAgentIndex}
          onSelectAgent={setActiveAgentIndex}
        />

        {/* Sector 04: Warp Trajectory */}
        <SectorTrajectory />

        {/* Sector 05: Orbital Insertion & Launch */}
        <SectorLaunch />
      </main>

      {/* ── Selected Celestial Body Inspector Modal ── */}
      <CelestialInspector
        selectedNodeId={selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
      />

      {/* ── Orbit Product Demo Experience Center ── */}
      <OrbitDemoCenter
        isOpen={demoOpen}
        onClose={handleCloseDemo}
      />

      {/* ── Bottom-Left Quick Action ── */}
      <div className="fixed bottom-6 left-6 z-30">
        <Link
          href="/projects/new"
          prefetch={true}
          className="size-10 rounded-full border border-white/15 bg-black/60 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:border-white/30 hover:scale-105 transition-all shadow-lg"
          aria-label="Quick Start Project"
        >
          <Zap className="size-4 fill-white text-white" />
        </Link>
      </div>
    </div>
  );
}
