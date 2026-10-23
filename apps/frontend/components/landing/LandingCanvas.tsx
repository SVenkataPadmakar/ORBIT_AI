"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { Scene1Spark } from "./scenes/Scene1Spark";
import { Scene2Validate } from "./scenes/Scene2Validate";
import { Scene3Product } from "./scenes/Scene3Product";
import { Scene4Agents } from "./scenes/Scene4Agents";
import { Scene5Galaxy } from "./scenes/Scene5Galaxy";
import { Scene6Core } from "./scenes/Scene6Core";
import { CameraRig } from "./ScrollOrchestrator";
import { ScrollState } from "@/hooks/useScrollProgress";
import { FOG } from "@/lib/design/tokens";

interface LandingCanvasProps {
  progressRef: React.MutableRefObject<ScrollState>;
  currentScene: number;
  prefersReducedMotion: boolean;
  tier: "TIER_A" | "TIER_B" | "TIER_C";
  onContextLost?: () => void;
}

export function LandingCanvas({
  progressRef,
  currentScene,
  prefersReducedMotion,
  tier,
  onContextLost,
}: LandingCanvasProps) {
  const [hasContextLost, setHasContextLost] = useState(false);

  useEffect(() => {
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setHasContextLost(true);
      onContextLost?.();
    };

    window.addEventListener("webglcontextlost", handleContextLost);
    return () => window.removeEventListener("webglcontextlost", handleContextLost);
  }, [onContextLost]);

  if (hasContextLost) {
    return null;
  }

  // Clamped DPR (1 to 2) per performance contract
  const dpr: [number, number] = tier === "TIER_C" ? [1, 1] : [1, 1.75];

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none select-none w-full h-full overflow-hidden"
      aria-hidden="true"
    >
      <Canvas
        aria-hidden="true"
        gl={{
          antialias: tier !== "TIER_C",
          alpha: true,
          powerPreference: "high-performance",
          depth: true,
          stencil: false,
        }}
        dpr={dpr}
        eventSource={typeof document !== "undefined" ? document.body : undefined}
      >
        <PerspectiveCamera makeDefault fov={42} position={[0, 0, 6]} near={0.1} far={60} />

        {/* Global Exponential Depth Fog (Section 9) */}
        <fogExp2 attach="fog" args={[FOG.far, FOG.density]} />

        {/* Minimal Global Ambient Light */}
        <ambientLight color={FOG.far} intensity={0.06} />

        {/* Camera Rig (lerping dolly + parallax) */}
        <CameraRig progressRef={progressRef} prefersReducedMotion={prefersReducedMotion} />

        <Suspense fallback={null}>
          {/* Scene 1 — The Spark */}
          {currentScene === 0 && (
            <Scene1Spark
              scrollProgress={progressRef.current.sceneProgress}
              prefersReducedMotion={prefersReducedMotion}
            />
          )}

          {/* Scene 2 — Validation Orbit */}
          {currentScene === 1 && (
            <Scene2Validate
              scrollProgress={progressRef.current.sceneProgress}
              prefersReducedMotion={prefersReducedMotion}
              tier={tier}
            />
          )}

          {/* Scene 3 — Product Formation */}
          {currentScene === 2 && (
            <Scene3Product
              scrollProgress={progressRef.current.sceneProgress}
              prefersReducedMotion={prefersReducedMotion}
              tier={tier}
            />
          )}

          {/* Scene 4 — Agent Awakening */}
          {currentScene === 3 && (
            <Scene4Agents
              scrollProgress={progressRef.current.sceneProgress}
              prefersReducedMotion={prefersReducedMotion}
              tier={tier}
            />
          )}

          {/* Scene 5 — Startup Galaxy */}
          {currentScene === 4 && (
            <Scene5Galaxy
              scrollProgress={progressRef.current.sceneProgress}
              prefersReducedMotion={prefersReducedMotion}
              tier={tier}
            />
          )}

          {/* Scene 6 — Orbit Core */}
          {currentScene === 5 && (
            <Scene6Core
              scrollProgress={progressRef.current.sceneProgress}
              prefersReducedMotion={prefersReducedMotion}
              tier={tier}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
