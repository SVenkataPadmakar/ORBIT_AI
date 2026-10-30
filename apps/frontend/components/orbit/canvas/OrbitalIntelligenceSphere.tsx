"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface OrbitalIntelligenceSphereProps {
  position?: [number, number, number];
  scale?: number;
}

/**
 * Procedural Galaxy Core & Orbital Intelligence Sphere.
 * Renders the exact wireframe coordinate grid globe from the original UI:
 * - Inner luminous indigo/violet celestial core
 * - Luminous starlight atmosphere aura
 * - Glowing wireframe sphere with TAM GRAVITY FIELD & CORE HYPOTHESIS HUD chips
 * - Tilted elliptical orbital rings with ARCHITECTURE RINGS & ENTROPY ZONE telemetry
 */
export function OrbitalIntelligenceSphere({
  position = [0, 0, 0],
  scale = 1.25,
}: OrbitalIntelligenceSphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  const wireframeMeshRef = useRef<THREE.Mesh>(null);
  const auraMeshRef = useRef<THREE.Mesh>(null);
  const ringGroupRef = useRef<THREE.Group>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();

    // Gentle axial rotation
    if (coreMeshRef.current) {
      coreMeshRef.current.rotation.y += delta * 0.12;
    }
    if (wireframeMeshRef.current) {
      wireframeMeshRef.current.rotation.y += delta * 0.08;
      wireframeMeshRef.current.rotation.x = Math.sin(time * 0.25) * 0.05;
      const breathe = 1.0 + Math.sin(time * 1.5) * 0.015;
      wireframeMeshRef.current.scale.setScalar(breathe);
    }
    if (auraMeshRef.current) {
      const breathe = 1.0 + Math.sin(time * 1.8) * 0.02;
      auraMeshRef.current.scale.setScalar(breathe);
    }
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.y = time * 0.015;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* ── 1. Luminous Deep Space Core ── */}
      <mesh ref={coreMeshRef}>
        <sphereGeometry args={[1.02, isMobile ? 24 : 48, isMobile ? 24 : 48]} />
        <meshStandardMaterial
          color="#1E1B4B"
          emissive="#312E81"
          emissiveIntensity={1.4}
          roughness={0.35}
          metalness={0.65}
        />
      </mesh>

      {/* ── 2. Atmospheric Nebula Glow ── */}
      <mesh ref={auraMeshRef}>
        <sphereGeometry args={[1.14, isMobile ? 20 : 36, isMobile ? 20 : 36]} />
        <meshBasicMaterial
          color="#6366F1"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── 3. Glowing Wireframe Coordinate Grid Shell ── */}
      <mesh ref={wireframeMeshRef}>
        <sphereGeometry args={[1.22, isMobile ? 22 : 36, isMobile ? 22 : 36]} />
        <meshBasicMaterial
          color="#E0E7FF"
          transparent
          opacity={0.42}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          wireframe={true}
        />
      </mesh>

      {/* ── Central Sphere Telemetry Badges (TAM GRAVITY FIELD & CORE HYPOTHESIS) ── */}
      {/* TAM Gravity Field Badge */}
      <Html
        center
        position={[0, 0.76, 1.1]}
        distanceFactor={8}
        zIndexRange={[60, 0]}
        className="pointer-events-none select-none"
      >
        <span className="inline-block whitespace-nowrap px-2.5 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase text-cyan-200/90 bg-black/85 border border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.35)]">
          TAM GRAVITY FIELD
        </span>
      </Html>

      {/* Core Hypothesis Badge */}
      <Html
        center
        position={[0, -0.25, 1.25]}
        distanceFactor={8}
        zIndexRange={[60, 0]}
        className="pointer-events-none select-none"
      >
        <span className="inline-block whitespace-nowrap px-2.5 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase text-indigo-200/90 bg-black/85 border border-indigo-400/40 shadow-[0_0_12px_rgba(99,102,241,0.35)]">
          CORE HYPOTHESIS
        </span>
      </Html>

      {/* ── 4. Major Orbital Ring Streamlines with Space HUD Badges ── */}
      <group ref={ringGroupRef}>
        {/* Ring 1: Inner Core Orbit */}
        <mesh rotation={[Math.PI * 0.44, 0.2, 0]}>
          <torusGeometry args={[2.6, 0.012, 12, isMobile ? 48 : 96]} />
          <meshBasicMaterial
            color="#818CF8"
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Ring 2: Architecture Rings with Telemetry Badge */}
        <group rotation={[Math.PI * 0.41, -0.25, 0]}>
          <mesh>
            <torusGeometry args={[4.6, 0.014, 12, isMobile ? 54 : 108]} />
            <meshBasicMaterial
              color="#EC4899"
              transparent
              opacity={0.45}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <Html
            center
            position={[-3.6, 0.9, -0.6]}
            distanceFactor={8}
            zIndexRange={[50, 0]}
            className="pointer-events-none select-none"
          >
            <span className="inline-block whitespace-nowrap px-2.5 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase text-pink-200/90 bg-black/85 border border-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.35)]">
              ARCHITECTURE RINGS
            </span>
          </Html>
        </group>

        {/* Ring 3: Entropy Zone Orbit with Telemetry Badge */}
        <group rotation={[Math.PI * 0.39, 0.32, 0]}>
          <mesh>
            <torusGeometry args={[6.4, 0.014, 12, isMobile ? 54 : 108]} />
            <meshBasicMaterial
              color="#A855F7"
              transparent
              opacity={0.4}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <Html
            center
            position={[4.2, 0.5, -1.2]}
            distanceFactor={8}
            zIndexRange={[50, 0]}
            className="pointer-events-none select-none"
          >
            <span className="inline-block whitespace-nowrap px-2.5 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase text-purple-200/90 bg-black/85 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
              ENTROPY ZONE
            </span>
          </Html>
        </group>

        {/* Ring 4: Outer Perimeter Horizon Ring */}
        <mesh rotation={[Math.PI * 0.46, -0.15, 0]}>
          <torusGeometry args={[8.0, 0.011, 12, isMobile ? 48 : 96]} />
          <meshBasicMaterial
            color="#38BDF8"
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ── 5. Ambient Core Lighting ── */}
      <pointLight color="#818CF8" intensity={3.5} distance={15} decay={2} />
      <pointLight color="#38BDF8" intensity={2.0} distance={10} decay={2} />
    </group>
  );
}
