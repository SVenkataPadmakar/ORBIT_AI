"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface OrbitalIntelligenceSphereProps {
  position?: [number, number, number];
  scale?: number;
}

// 5 Orbital Streams symbolizing the Autonomous Startup Operating System
const ORBITAL_STREAMS = [
  { name: "RESEARCH",    color: "#22D3EE", speed: 0.45, radius: 1.85, tilt: 0.35 },
  { name: "VALIDATION",  color: "#6366F1", speed: 0.38, radius: 2.25, tilt: -0.42 },
  { name: "ARCHITECTURE",color: "#A855F7", speed: 0.42, radius: 2.65, tilt: 0.55 },
  { name: "EXECUTION",   color: "#38BDF8", speed: 0.50, radius: 3.05, tilt: -0.28 },
  { name: "GROWTH",      color: "#10B981", speed: 0.34, radius: 3.45, tilt: 0.18 },
];

/**
 * Procedural Galaxy Core & Orbital Intelligence Sphere.
 * Replaces the gloomy "black hole / singularity" with a radiant, high-tech celestial sphere
 * surrounded by concentric orbital data rings and glowing stellar filaments.
 */
export function OrbitalIntelligenceSphere({
  position = [0, 0, 0],
  scale = 1.25,
}: OrbitalIntelligenceSphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
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

  // Shader uniforms for luminous stellar atmosphere
  const coreUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorCore: { value: new THREE.Color("#EEF2FF") },
      uColorMid: { value: new THREE.Color("#6366F1") },
      uColorAura: { value: new THREE.Color("#06B6D4") },
    }),
    []
  );

  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();
    coreUniforms.uTime.value = time;

    // Gentle axial rotation
    if (coreMeshRef.current) {
      coreMeshRef.current.rotation.y += delta * 0.15;
    }
    if (auraMeshRef.current) {
      auraMeshRef.current.rotation.y -= delta * 0.08;
      const breathe = 1.0 + Math.sin(time * 1.8) * 0.025;
      auraMeshRef.current.scale.setScalar(breathe);
    }
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* ── 1. Radiant Intelligence Core ── */}
      <mesh ref={coreMeshRef}>
        <sphereGeometry args={[1.05, isMobile ? 24 : 48, isMobile ? 24 : 48]} />
        <meshStandardMaterial
          color="#4338CA"
          emissive="#6366F1"
          emissiveIntensity={1.4}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* ── 2. Luminous Starlight Atmosphere Aura ── */}
      <mesh ref={auraMeshRef}>
        <sphereGeometry args={[1.18, isMobile ? 20 : 36, isMobile ? 20 : 36]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          wireframe={isMobile ? false : true}
        />
      </mesh>

      {/* ── 3. Concentric Orbital Rings with Data Beacons ── */}
      <group ref={ringGroupRef}>
        {ORBITAL_STREAMS.map((stream, idx) => (
          <OrbitalRing
            key={stream.name}
            radius={stream.radius}
            tilt={stream.tilt}
            color={stream.color}
            speed={stream.speed}
            index={idx}
            isMobile={isMobile}
          />
        ))}
      </group>

      {/* ── 4. Ambient Core Glow Light Source ── */}
      <pointLight color="#818CF8" intensity={4.5} distance={15} decay={2} />
      <pointLight color="#22D3EE" intensity={2.0} distance={8} decay={2} />
    </group>
  );
}

function OrbitalRing({
  radius,
  tilt,
  color,
  speed,
  index,
  isMobile,
}: {
  radius: number;
  tilt: number;
  color: string;
  speed: number;
  index: number;
  isMobile: boolean;
}) {
  const ringRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + index * 1.2;
    if (ringRef.current) {
      ringRef.current.rotation.z = Math.sin(t * 0.2) * 0.08;
    }
    if (beaconRef.current) {
      beaconRef.current.position.x = Math.cos(t) * radius;
      beaconRef.current.position.z = Math.sin(t) * radius;
    }
  });

  return (
    <group ref={ringRef} rotation={[tilt, 0, 0]}>
      {/* Precision Orbit Track Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.012, 12, isMobile ? 48 : 96]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Orbiting Satellite Data Node */}
      <mesh ref={beaconRef}>
        <sphereGeometry args={[0.065, 12, 12]} />
        <meshBasicMaterial
          color="#FFFFFF"
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
