"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ringsVertexShader } from "@/shaders/rings.vert";
import { ringsFragmentShader } from "@/shaders/rings.frag";
import { COLORS } from "@/lib/design/tokens";

interface Scene2ValidateProps {
  scrollProgress: number; // 0..1 for Scene 2
  prefersReducedMotion?: boolean;
  tier?: "TIER_A" | "TIER_B" | "TIER_C";
}

const RING_RADII = [1.0, 1.8, 2.6];
const SIGNAL_COUNT = 42;

export function Scene2Validate({
  scrollProgress,
  prefersReducedMotion = false,
  tier = "TIER_A",
}: Scene2ValidateProps) {
  const groupRef = useRef<THREE.Group>(null);
  const instancedRingsRef = useRef<THREE.InstancedMesh>(null);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // 1. Uniforms
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_scroll: { value: 0 },
      u_reduced_motion: { value: prefersReducedMotion ? 1.0 : 0.0 },
      u_low_quality: { value: tier === "TIER_C" ? 1.0 : 0.0 },
      u_accent: { value: new THREE.Color(COLORS.accent) },
      u_accent_glow: { value: new THREE.Color(COLORS.accentGlow) },
      u_signal: { value: new THREE.Color(COLORS.signal) },
    }),
    [prefersReducedMotion, tier]
  );

  // 2. Initialize Instanced Mesh Matrices & Attributes (3 concentric rings)
  useEffect(() => {
    if (!instancedRingsRef.current) return;
    const mesh = instancedRingsRef.current;
    const tempMatrix = new THREE.Matrix4();

    // Tilt rings for cinematic 3D perspective (approx 65 deg on X axis)
    const tiltEuler = new THREE.Euler(THREE.MathUtils.degToRad(62), 0, THREE.MathUtils.degToRad(15));
    const tiltQuaternion = new THREE.Quaternion().setFromEuler(tiltEuler);

    for (let i = 0; i < 3; i++) {
      const scale = RING_RADII[i] ?? (1.0 + i * 0.8);
      tempMatrix.compose(
        new THREE.Vector3(0, 0, 0),
        tiltQuaternion,
        new THREE.Vector3(scale, scale, scale)
      );
      mesh.setMatrixAt(i, tempMatrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // Attach custom a_ringIndex attribute
    const ringIndices = new Float32Array([0.0, 1.0, 2.0]);
    mesh.geometry.setAttribute("a_ringIndex", new THREE.InstancedBufferAttribute(ringIndices, 1));
  }, []);

  // 3. Initialize ~40 Signal Particles traveling along ring paths
  const { particleData, initialPositions } = useMemo(() => {
    const data: Array<{ ringIndex: number; radius: number; angle: number; speed: number }> = [];
    const positions = new Float32Array(SIGNAL_COUNT * 3);

    for (let i = 0; i < SIGNAL_COUNT; i++) {
      const ringIndex = i % 3;
      const radius = RING_RADII[ringIndex] ?? 1.0;
      const angle = (i / SIGNAL_COUNT) * Math.PI * 2 + Math.random() * 0.5;
      const dir = ringIndex === 1 ? -1 : 1;
      const speed = (0.4 + ringIndex * 0.15) * dir;

      data.push({ ringIndex, radius, angle, speed });
    }
    return { particleData: data, initialPositions: positions };
  }, []);

  // Update loop
  useFrame((state, delta) => {
    // Update Ring Shaders
    if (shaderMaterialRef.current) {
      const u = shaderMaterialRef.current.uniforms;
      if (u.u_time) u.u_time.value += delta;
      if (u.u_scroll) u.u_scroll.value = scrollProgress;
      if (u.u_reduced_motion) u.u_reduced_motion.value = prefersReducedMotion ? 1.0 : 0.0;
    }

    // Update Signal Particle positions along tilted ring trajectories
    if (particlesRef.current && !prefersReducedMotion) {
      const positions = particlesRef.current.geometry.attributes.position?.array as Float32Array | undefined;
      if (positions) {
        const tiltX = THREE.MathUtils.degToRad(62);
        const tiltZ = THREE.MathUtils.degToRad(15);
        const cosTiltX = Math.cos(tiltX);
        const sinTiltX = Math.sin(tiltX);
        const cosTiltZ = Math.cos(tiltZ);
        const sinTiltZ = Math.sin(tiltZ);

        for (let i = 0; i < SIGNAL_COUNT; i++) {
          const item = particleData[i];
          if (!item) continue;
          item.angle += item.speed * delta;

          // Circle in X-Y plane
          const rawX = item.radius * Math.cos(item.angle);
          const rawZ = item.radius * Math.sin(item.angle);

          // Rotate around X, then Z
          const y1 = -rawZ * sinTiltX;
          const z1 = rawZ * cosTiltX;

          const finalX = rawX * cosTiltZ - y1 * sinTiltZ;
          const finalY = rawX * sinTiltZ + y1 * cosTiltZ;
          const finalZ = z1;

          const idx = i * 3;
          positions[idx] = finalX;
          positions[idx + 1] = finalY;
          positions[idx + 2] = finalZ;
        }
        particlesRef.current.geometry.attributes.position!.needsUpdate = true;
      }
    }

    // Subtle pointer parallax tilt
    if (groupRef.current && !prefersReducedMotion) {
      const targetRotY = state.pointer.x * 0.18;
      const targetRotX = -state.pointer.y * 0.12;
      groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0.4, 0, 0]}>
      {/* 2 Lighting Elements per spec */}
      <directionalLight position={[4, 5, 3]} intensity={1.2} color="#EDEDF2" />
      <pointLight position={[-3, -2, -2]} intensity={0.9} color={COLORS.accentGlow} distance={10} />

      {/* Instanced Concentric Torus Rings (3 instances in 1 draw call) */}
      <instancedMesh
        ref={instancedRingsRef}
        args={[undefined, undefined, 3]}
      >
        <torusGeometry args={[1.0, 0.022, 24, 96]} />
        <shaderMaterial
          ref={shaderMaterialRef}
          vertexShader={ringsVertexShader}
          fragmentShader={ringsFragmentShader}
          uniforms={uniforms}
          transparent={false}
        />
      </instancedMesh>

      {/* ~40 Traveling Signal Particles (1 draw call) */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[initialPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          color={COLORS.signal}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
