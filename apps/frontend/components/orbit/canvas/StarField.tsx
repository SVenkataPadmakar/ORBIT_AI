"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function StarField({ count = 3600 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Dynamic mobile LOD check (SSR-safe)
  const effectiveCount = useMemo(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return Math.min(count, 1600);
    }
    return count;
  }, [count]);

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(effectiveCount * 3);
    const col = new Float32Array(effectiveCount * 3);
    const sz = new Float32Array(effectiveCount);

    // Curated deep space stellar palette
    const colorOptions = [
      new THREE.Color("#FFFFFF"), // O/B class white-blue
      new THREE.Color("#A5B4FC"), // Indigo luminous star
      new THREE.Color("#C4B5FD"), // Violet star
      new THREE.Color("#67E8F9"), // Cyan hypergiant
      new THREE.Color("#FDE68A"), // Yellow dwarf
      new THREE.Color("#FCA5A5"), // Red giant
    ];

    for (let i = 0; i < effectiveCount; i++) {
      // Cylindrical distribution with dense core and outer halo
      const radius = 8 + Math.pow(Math.random(), 1.6) * 90;
      const theta = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 60;

      pos[i * 3 + 0] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(theta) * radius;

      // Pick color with bias towards white-indigo
      const chosenColor =
        colorOptions[Math.floor(Math.random() * colorOptions.length)] ??
        colorOptions[0]!;
      col[i * 3 + 0] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;

      // Variable star sizes
      sz[i] = 0.04 + Math.random() * 0.08;
    }

    return [pos, col, sz];
  }, [effectiveCount]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      // Extremely subtle stellar drift
      pointsRef.current.rotation.y += delta * 0.008;
      pointsRef.current.rotation.x += delta * 0.002;
    }
  });

  return (
    <points ref={pointsRef} frustumCulled>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
