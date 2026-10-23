"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  nebulaVertexShader,
  nebulaFragmentShader,
} from "../shaders/nebulaParticle.glsl";

interface NebulaProps {
  count?: number;
  radius?: number;
}

export function VolumetricNebula({ count = 650, radius = 28 }: NebulaProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Dynamic mobile LOD check (SSR-safe)
  const effectiveCount = useMemo(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return Math.min(count, 320);
    }
    return count;
  }, [count]);

  const [positions, scales, colors, phases] = useMemo(() => {
    const pos = new Float32Array(effectiveCount * 3);
    const sc = new Float32Array(effectiveCount);
    const col = new Float32Array(effectiveCount * 3);
    const ph = new Float32Array(effectiveCount);

    // Deep space palette: Indigo, Violet, Magenta, Cyan, Warm Amber
    const palette = [
      new THREE.Color("#6366F1"),
      new THREE.Color("#8B5CF6"),
      new THREE.Color("#A855F7"),
      new THREE.Color("#EC4899"),
      new THREE.Color("#06B6D4"),
      new THREE.Color("#F59E0B"),
    ];

    for (let i = 0; i < effectiveCount; i++) {
      // Swirling toroidal cluster distribution
      const u = Math.random();
      const theta = u * Math.PI * 2;
      const r = 4 + Math.pow(Math.random(), 0.7) * radius;
      const spiral = theta * 1.5;

      pos[i * 3 + 0] = Math.cos(spiral) * r + (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16 + Math.sin(spiral) * 3;
      pos[i * 3 + 2] = Math.sin(spiral) * r + (Math.random() - 0.5) * 8;

      sc[i] = 1.0 + Math.random() * 2.5;

      const chosen =
        palette[Math.floor(Math.random() * palette.length)] ?? palette[0]!;
      col[i * 3 + 0] = chosen.r;
      col[i * 3 + 1] = chosen.g;
      col[i * 3 + 2] = chosen.b;

      ph[i] = Math.random() * Math.PI * 2;
    }

    return [pos, sc, col, ph];
  }, [effectiveCount, radius]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 1.2 },
    }),
    []
  );

  useFrame(({ clock }, delta) => {
    uniforms.uTime.value = clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.006;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={nebulaVertexShader}
        fragmentShader={nebulaFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
