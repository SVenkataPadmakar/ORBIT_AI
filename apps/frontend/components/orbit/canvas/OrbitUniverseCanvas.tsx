"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from "@react-three/drei";
import { useWebGLSupported } from "@/lib/hooks/use-webgl";
import { WebGLErrorBoundary } from "@/components/ui/webgl-error-boundary";
import { CosmicFallbackBackground } from "./CosmicFallbackBackground";
import { StarField } from "./StarField";
import { OrbitalIntelligenceSphere } from "./OrbitalIntelligenceSphere";
import { AgentConstellation } from "./AgentConstellation";
import { VolumetricNebula } from "./VolumetricNebula";
import { CameraFlightRig } from "./CameraFlightRig";

interface OrbitUniverseCanvasProps {
  scrollProgress: number | React.MutableRefObject<number>;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  hoveredNodeId: string | null;
  selectedNodeId: string | null;
  activeAgentIndex: number;
  isVisible?: boolean;
  onHoverNode: (id: string | null) => void;
  onSelectNode: (id: string) => void;
  onSelectAgent: (index: number) => void;
}

export default function OrbitUniverseCanvas({
  scrollProgress,
  mouse,
  hoveredNodeId,
  selectedNodeId,
  activeAgentIndex,
  isVisible = true,
  onHoverNode,
  onSelectNode,
  onSelectAgent,
}: OrbitUniverseCanvasProps) {
  const [dpr, setDpr] = useState(1.5);
  const webglSupported = useWebGLSupported();

  // If WebGL context is disabled or unavailable on this device/browser, gracefully render CSS cosmic space
  if (!webglSupported) {
    return <CosmicFallbackBackground />;
  }

  return (
    <WebGLErrorBoundary fallback={<CosmicFallbackBackground />}>
      <Canvas
        frameloop={isVisible ? "always" : "never"}
        camera={{ position: [0, 1.8, 7.5], fov: 48, near: 0.1, far: 200 }}
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            console.warn("WebGL context lost caught; gracefully handling GPU context.");
          });
        }}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none", // Let touch & mouse pass smoothly to foreground UI
          zIndex: 0,
          background: "radial-gradient(ellipse at 50% 40%, #0c0a24 0%, #050412 55%, #020205 100%)",
        }}
      >
        {/* ── Dynamic Performance Adaptation: 60 FPS Target ── */}
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <PerformanceMonitor
          onDecline={() => setDpr(1.0)}
          onIncline={() => setDpr(1.5)}
        />

        {/* ── Optimized Deep Space Lighting ── */}
        <ambientLight intensity={1.5} color="#1E1B4B" />
        <directionalLight position={[10, 20, 15]} intensity={2.6} color="#C7D2FE" />
        <pointLight position={[0, 4, 3]} intensity={4.5} distance={30} color="#818CF8" />

        {/* ── 3D Cosmic Elements ── */}
        <StarField count={2800} />
        <VolumetricNebula count={500} radius={28} />

        {/* ── Sector 01 Focus: Radiant Orbital Intelligence Core & Coordinate Grid ── */}
        <OrbitalIntelligenceSphere position={[0, 0, 0]} scale={1.25} />

        {/* ── Autonomous Agent Planets Rotating in Circular Orbits ── */}
        <AgentConstellation
          activeAgentIndex={activeAgentIndex}
          onSelectAgent={onSelectAgent}
          position={[0, 0, 0]}
        />

        {/* ── Scroll-Synchronized Camera Trajectory Rig ── */}
        <CameraFlightRig
          scrollProgress={scrollProgress}
          mouse={mouse}
        />
      </Canvas>
    </WebGLErrorBoundary>
  );
}

export { OrbitUniverseCanvas };
