"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sparkVertexShader } from "@/shaders/spark.vert";
import { sparkFragmentShader } from "@/shaders/spark.frag";
import { COLORS } from "@/lib/design/tokens";

interface Scene1SparkProps {
  scrollProgress: number; // 0..1 for Scene 1
  prefersReducedMotion?: boolean;
}

export function Scene1Spark({
  scrollProgress,
  prefersReducedMotion = false,
}: Scene1SparkProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_scroll: { value: 0 },
      u_reduced_motion: { value: prefersReducedMotion ? 1.0 : 0.0 },
      u_accent: { value: new THREE.Color(COLORS.accent) },
      u_accent_glow: { value: new THREE.Color(COLORS.accentGlow) },
    }),
    [prefersReducedMotion]
  );

  useEffect(() => {
    if (materialRef.current?.uniforms.u_reduced_motion) {
      materialRef.current.uniforms.u_reduced_motion.value = prefersReducedMotion ? 1.0 : 0.0;
    }
  }, [prefersReducedMotion]);

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    if (u.u_time) u.u_time.value += delta;
    if (u.u_scroll) u.u_scroll.value = scrollProgress;

    // Subtle pointer parallax tilt on the spark
    if (meshRef.current && !prefersReducedMotion) {
      const targetRotationY = state.pointer.x * 0.15;
      const targetRotationX = -state.pointer.y * 0.15;
      meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * 0.05;
      meshRef.current.rotation.x += (targetRotationX - meshRef.current.rotation.x) * 0.05;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1 Point Light (warm center glow) */}
      <pointLight position={[0, 0, 1.5]} intensity={1.2} color={COLORS.accentGlow} distance={6} />

      {/* 1 Rim Light (cool back edge) */}
      <directionalLight position={[2, 2, -3]} intensity={0.8} color="#9090FF" />

      {/* Single Emissive Displaced Sphere (radius 0.4) */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.4, 48, 48]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={sparkVertexShader}
          fragmentShader={sparkFragmentShader}
          uniforms={uniforms}
          wireframe={false}
          transparent={false}
        />
      </mesh>
    </group>
  );
}
