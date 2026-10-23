// apps/frontend/components/landing/scenes/Scene5Galaxy.tsx
// Scene 5: Startup Galaxy (Section 6 & 10 of .antigravity/rules.md)
// 7 agent seeds expand into a GPU particle system (≤ 100k) clustered into 4 groups:
// Customers, Revenue, Investors, Team.
// Per-particle hue, size, velocity. Tier budgets: Tier A 100k, Tier B 30k, Tier C 5k.

"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { particlesVertexShader } from "@/shaders/particles.vert";
import { particlesFragmentShader } from "@/shaders/particles.frag";

interface Scene5GalaxyProps {
  scrollProgress: number;
  prefersReducedMotion?: boolean;
  tier?: "TIER_A" | "TIER_B" | "TIER_C";
}

// 4 Startup Galaxy Clusters per specification
interface ClusterMeta {
  name: string;
  threeColor: THREE.Color;
  baseRadiusMin: number;
  baseRadiusMax: number;
  speed: number;
}

const CLUSTERS_DATA: ClusterMeta[] = [
  {
    name: "Customers",
    threeColor: new THREE.Color("#38BDF8"), // cool azure
    baseRadiusMin: 1.2,
    baseRadiusMax: 4.8,
    speed: 0.28,
  },
  {
    name: "Revenue",
    threeColor: new THREE.Color("#4ADE80"), // validation emerald
    baseRadiusMin: 1.4,
    baseRadiusMax: 5.2,
    speed: 0.24,
  },
  {
    name: "Investors",
    threeColor: new THREE.Color("#FBBF24"), // warm amber/gold
    baseRadiusMin: 1.6,
    baseRadiusMax: 5.6,
    speed: 0.20,
  },
  {
    name: "Team",
    threeColor: new THREE.Color("#A48BFF"), // Orbit violet
    baseRadiusMin: 1.8,
    baseRadiusMax: 6.0,
    speed: 0.18,
  },
];

// Seed origins from the 7 Scene 4 agent nodes
const AGENT_SEEDS: [number, number, number][] = [
  [-0.15, 0.45, 0.12],
  [0.16, 0.32, -0.14],
  [-0.14, 0.10, -0.16],
  [0.18, -0.10, 0.15],
  [-0.16, -0.28, 0.12],
  [0.14, -0.44, -0.10],
  [-0.10, -0.58, 0.18],
];

/**
 * Creates crisp monospace billboard texture for cluster markers
 */
function createClusterLabelTexture(text: string, color: THREE.Color): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 256, 64);
    ctx.font = "bold 22px 'Geist Mono', Consolas, Menlo, Monaco, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.shadowColor = `#${color.getHexString()}`;
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#EDEDF2";
    ctx.letterSpacing = "2px";
    ctx.fillText(text.toUpperCase(), 128, 32);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(text.toUpperCase(), 128, 32);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

export function Scene5Galaxy({
  scrollProgress,
  prefersReducedMotion = false,
  tier = "TIER_A",
}: Scene5GalaxyProps) {
  const timeRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);

  // Exact particle budget per device tier (Section 10)
  const particleCount = useMemo(() => {
    if (tier === "TIER_C") return 5_000;
    if (tier === "TIER_B") return 30_000;
    return 100_000; // Tier A: 100k max particles
  }, [tier]);

  // World-space monospace cluster label textures
  const clusterLabelTextures = useMemo(() => {
    if (typeof document === "undefined") return [];
    return CLUSTERS_DATA.map((c) => createClusterLabelTexture(c.name, c.threeColor));
  }, []);

  // Pre-allocate GPU buffers for particle system
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    const positions = new Float32Array(particleCount * 3);
    const seeds = new Float32Array(particleCount * 3);
    const orbits = new Float32Array(particleCount * 4); // clusterIdx, radius, speed, phase
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const randoms = new Float32Array(particleCount * 2); // dispersion, vertical jitter

    for (let i = 0; i < particleCount; i++) {
      const clusterIdx = i % 4;
      const cluster = CLUSTERS_DATA[clusterIdx]!;

      // Assign an agent seed
      const seedIdx = i % AGENT_SEEDS.length;
      const seed = AGENT_SEEDS[seedIdx] ?? [0, 0, 0];

      seeds[i * 3] = seed[0];
      seeds[i * 3 + 1] = seed[1];
      seeds[i * 3 + 2] = seed[2];

      // Initial positions start near seeds
      positions[i * 3] = seed[0];
      positions[i * 3 + 1] = seed[1];
      positions[i * 3 + 2] = seed[2];

      // Radial distribution (logarithmic falloff: dense near core, sparse at arms)
      const u = Math.random();
      const radiusFrac = Math.pow(u, 1.6);
      const radius = THREE.MathUtils.lerp(
        cluster.baseRadiusMin,
        cluster.baseRadiusMax,
        radiusFrac
      );

      // Orbital parameters
      const speed = cluster.speed * (0.8 + 0.4 * Math.random());
      const phase = Math.random() * Math.PI * 2;

      orbits[i * 4] = clusterIdx;
      orbits[i * 4 + 1] = radius;
      orbits[i * 4 + 2] = speed;
      orbits[i * 4 + 3] = phase;

      // Cluster subtle hue with per-particle luminescence variation
      const lum = 0.85 + 0.3 * (Math.random() - 0.5);
      colors[i * 3] = Math.min(cluster.threeColor.r * lum, 1.0);
      colors[i * 3 + 1] = Math.min(cluster.threeColor.g * lum, 1.0);
      colors[i * 3 + 2] = Math.min(cluster.threeColor.b * lum, 1.0);

      // Particle size variation
      sizes[i] = 0.05 + 0.10 * Math.random();

      // Random dispersion and disk thickness
      randoms[i * 2] = (Math.random() - 0.5) * 0.45; // radial jitter
      randoms[i * 2 + 1] = (Math.random() - 0.5) * 0.65; // vertical z/y jitter
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("a_seed", new THREE.BufferAttribute(seeds, 3));
    geo.setAttribute("a_orbit", new THREE.BufferAttribute(orbits, 4));
    geo.setAttribute("a_color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("a_size", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("a_random", new THREE.BufferAttribute(randoms, 2));

    const mat = new THREE.ShaderMaterial({
      vertexShader: particlesVertexShader,
      fragmentShader: particlesFragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_scroll: { value: scrollProgress },
        u_dpr: { value: Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2) },
        u_reduced_motion: { value: prefersReducedMotion ? 1.0 : 0.0 },
        u_low_quality: { value: tier === "TIER_C" ? 1.0 : 0.0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { geometry: geo, material: mat };
  }, [particleCount, scrollProgress, prefersReducedMotion, tier]);

  // Update uniforms when scroll progress changes
  useEffect(() => {
    if (material.uniforms.u_scroll) {
      material.uniforms.u_scroll.value = scrollProgress;
    }
    if (material.uniforms.u_reduced_motion) {
      material.uniforms.u_reduced_motion.value = prefersReducedMotion ? 1.0 : 0.0;
    }
  }, [scrollProgress, prefersReducedMotion, material]);

  // Main animation loop
  useFrame((_, delta) => {
    if (!prefersReducedMotion) {
      timeRef.current += delta;
    }
    const t = timeRef.current;

    if (material.uniforms.u_time) {
      material.uniforms.u_time.value = t;
    }

    // Gentle global disk precession
    if (groupRef.current && !prefersReducedMotion) {
      groupRef.current.rotation.y = t * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0.65, 0, 0]} rotation={[0.42, 0, 0.12]}>
      {/* ─── DYNAMIC LIGHT RIG (MAX 4 TOTAL PER SECTION 9) ────────────────── */}
      {/* 1. Warm Key Light from above (moves with camera) */}
      <directionalLight
        position={[6, 9, 5]}
        intensity={1.5}
        color="#FFEEDB"
      />

      {/* 2. Cool Rim Light (behind subject) */}
      <directionalLight
        position={[-6, 4, -7]}
        intensity={1.1}
        color="#7C5CFF"
      />

      {/* 3. Central Core Point Light */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2.6}
        distance={14}
        color="#A48BFF"
        decay={2}
      />

      {/* ─── CENTRAL GALAXY STAR CORE ────────────────────────────────────── */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial color="#7C5CFF" transparent opacity={0.25} />
      </mesh>

      {/* ─── GPU PARTICLES MESH (UP TO 100K PARTICLES) ───────────────────── */}
      <points geometry={geometry} material={material} />

      {/* ─── 4 CLUSTER MONOSPACE WORLD-SPACE SPRITES ─────────────────────── */}
      {clusterLabelTextures.map((tex, i) => {
        const angle = i * (Math.PI * 0.5) + 0.35;
        const dist = 3.6;
        const lx = Math.cos(angle) * dist;
        const lz = Math.sin(angle) * (dist * 0.88);

        return (
          <sprite key={CLUSTERS_DATA[i]?.name ?? i} position={[lx, 0.45, lz]} scale={[0.55, 0.14, 1]}>
            <spriteMaterial
              map={tex}
              transparent
              depthWrite={false}
              opacity={0.88}
            />
          </sprite>
        );
      })}
    </group>
  );
}
