// apps/frontend/components/landing/scenes/Scene3Product.tsx
// Scene 3: Product Formation (150vh)
// Features: ~12 metaballs (SDF) merging into a monolith; wireframe overlay fades in at 60% scroll.
// Raymarched SDF in fragment shader on desktop, static mesh fallback on mobile/Tier C per Section 7.

"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { metaballVertexShader } from "@/shaders/metaball.vert";
import { metaballFragmentShader } from "@/shaders/metaball.frag";
import { COLORS } from "@/lib/design/tokens";

interface Scene3ProductProps {
  scrollProgress: number; // 0..1 for Scene 3
  prefersReducedMotion?: boolean;
  tier?: "TIER_A" | "TIER_B" | "TIER_C";
}

const SCATTERED_POSITIONS: [number, number, number][] = [
  [-0.85,  0.75,  0.35],
  [ 0.78,  0.65, -0.42],
  [-0.65, -0.60, -0.48],
  [ 0.72, -0.75,  0.45],
  [-0.80,  0.10, -0.60],
  [ 0.75,  0.15,  0.58],
  [ 0.12,  0.95, -0.45],
  [-0.18, -0.92,  0.38],
  [ 0.45,  0.82,  0.50],
  [-0.52, -0.78, -0.40],
  [ 0.88, -0.22, -0.25],
  [-0.75,  0.45, -0.20],
];

const TARGET_POSITIONS: [number, number, number][] = [
  [-0.25,  0.52, -0.15],
  [ 0.25,  0.52, -0.15],
  [-0.25,  0.52,  0.15],
  [ 0.25,  0.52,  0.15],
  [-0.25,  0.00, -0.15],
  [ 0.25,  0.00, -0.15],
  [-0.25,  0.00,  0.15],
  [ 0.25,  0.00,  0.15],
  [-0.25, -0.52, -0.15],
  [ 0.25, -0.52, -0.15],
  [-0.25, -0.52,  0.15],
  [ 0.25, -0.52,  0.15],
];

export function Scene3Product({
  scrollProgress,
  prefersReducedMotion = false,
  tier = "TIER_A",
}: Scene3ProductProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const instancedFallbackSpheresRef = useRef<THREE.InstancedMesh>(null);

  // Mobile detection for Section 7: "On mobile: Disable SDF raymarching (use static mesh fallback)"
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobileScreen(window.innerWidth < 768);
    }
  }, []);

  const isStaticMeshFallback = tier === "TIER_C" || isMobileScreen;

  // Shader Uniforms for Raymarching
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_scroll: { value: 0 },
      u_reduced_motion: { value: prefersReducedMotion ? 1.0 : 0.0 },
      u_low_quality: { value: tier === "TIER_B" ? 1.0 : 0.0 },
      u_accent: { value: new THREE.Color(COLORS.accent) },
      u_accent_glow: { value: new THREE.Color(COLORS.accentGlow) },
      u_warm_rim: { value: new THREE.Color(COLORS.warning) }, // Warm amber #F59E0B
    }),
    [prefersReducedMotion, tier]
  );

  // Wireframe opacity: begins at 60% scroll, fully visible by 85% scroll
  const wireframeOpacity = Math.max(0, Math.min((scrollProgress - 0.6) / 0.25, 1)) * 0.85;

  const lastProgressRef = useRef(-1);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();

    // Update shader uniforms
    if (shaderMaterialRef.current) {
      const u = shaderMaterialRef.current.uniforms;
      if (u.u_time) u.u_time.value = elapsed;
      if (u.u_scroll) {
        u.u_scroll.value = THREE.MathUtils.lerp(u.u_scroll.value, scrollProgress, 0.12);
      }
    }

    // Pointer parallax response (±0.15 rad, damped)
    if (groupRef.current && !prefersReducedMotion) {
      const targetRotY = state.pointer.x * 0.18 + (scrollProgress - 0.5) * 0.25;
      const targetRotX = -state.pointer.y * 0.12;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
    }

    // Mobile Static Mesh Fallback: animate 12 low-poly spheres merging
    if (isStaticMeshFallback && instancedFallbackSpheresRef.current) {
      if (Math.abs(lastProgressRef.current - scrollProgress) > 0.001) {
        lastProgressRef.current = scrollProgress;
        const dummy = new THREE.Object3D();
        const merge = THREE.MathUtils.clamp((scrollProgress - 0.05) / 0.65, 0, 1);

        for (let i = 0; i < 12; i++) {
          const init = SCATTERED_POSITIONS[i] ?? [0, 0, 0];
          const target = TARGET_POSITIONS[i] ?? [0, 0, 0];

          const x = THREE.MathUtils.lerp(init[0], target[0], merge);
          const y = THREE.MathUtils.lerp(init[1], target[1], merge);
          const z = THREE.MathUtils.lerp(init[2], target[2], merge);

          dummy.position.set(x, y, z);
          const s = THREE.MathUtils.lerp(0.24, 0.20, merge);
          dummy.scale.set(s, s, s);
          dummy.updateMatrix();
          instancedFallbackSpheresRef.current.setMatrixAt(i, dummy.matrix);
        }
        instancedFallbackSpheresRef.current.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0.7, 0, 0]}>
      {/* ─── DESKTOP: RAYMARCHED SDF METABALLS IN FRAGMENT SHADER ─── */}
      {!isStaticMeshFallback && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.2, 3.2, 3.2]} />
          <shaderMaterial
            ref={shaderMaterialRef}
            vertexShader={metaballVertexShader}
            fragmentShader={metaballFragmentShader}
            uniforms={uniforms}
            transparent={true}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* ─── MOBILE / TIER C: STATIC MESH FALLBACK (SECTION 7 REQUIREMENT) ─── */}
      {isStaticMeshFallback && (
        <>
          {/* 12 Instanced Spheres merging into monolith */}
          <instancedMesh
            ref={instancedFallbackSpheresRef}
            args={[undefined, undefined, 12]}
          >
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial
              color="#7C5CFF"
              emissive="#7C5CFF"
              emissiveIntensity={0.4}
              roughness={0.3}
              metalness={0.7}
            />
          </instancedMesh>

          {/* Central Monolith Slab */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.72, 1.48, 0.44]} />
            <meshStandardMaterial
              color="#0D0D18"
              metalness={0.8}
              roughness={0.25}
              emissive="#7C5CFF"
              emissiveIntensity={scrollProgress * 0.2}
              transparent
              opacity={Math.min(scrollProgress * 1.5, 1)}
            />
          </mesh>
        </>
      )}

      {/* ─── CAD BLUEPRINT WIREFRAME OVERLAY (FADES IN AT 60% SCROLL) ─── */}
      <mesh ref={wireframeRef} position={[0, 0, 0]}>
        <boxGeometry args={[0.76, 1.52, 0.50, 2, 4, 2]} />
        <meshBasicMaterial
          wireframe
          color={COLORS.accentGlow}
          transparent
          opacity={wireframeOpacity}
        />
      </mesh>

      {/* ─── LIGHTING RIG (SECTION 6 & 9) ─── */}
      {/* Cool Key Light (Slate / Violet from upper-left) */}
      <directionalLight position={[-3, 4, 3]} color="#EDEDF2" intensity={1.2} />

      {/* Warm Rim Light (Amber #F59E0B from lower-rear, teasing Scene 5 warm galaxy) */}
      <pointLight position={[3, -2, -3]} color="#F59E0B" intensity={1.6} distance={10} />
    </group>
  );
}
