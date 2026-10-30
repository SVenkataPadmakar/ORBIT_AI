"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export interface AgentEntity {
  id: string;
  name: string;
  role: string;
  color: string;
  baseAngle: number;
  radiusX: number;
  radiusZ: number;
  orbitSpeed: number;
  altitude: number;
  quote: string;
  mission: string;
}

// 7-9 Specialized Autonomous Agents configured to match the original orbital constellation
export const AGENT_ENTITIES: AgentEntity[] = [
  {
    id: "architecture",
    name: "Architecture Agent",
    role: "System & Schema",
    color: "#10B981", // Emerald green (Top-Left)
    baseAngle: Math.PI * 0.82,
    radiusX: 5.6,
    radiusZ: 3.8,
    orbitSpeed: 0.14,
    altitude: 1.35,
    quote: "Postgres + Vector + Event Streams. Scale to 500k ops before sharding.",
    mission: "System architecture, API schemas, and deployment pipelines.",
  },
  {
    id: "vc",
    name: "VC Agent",
    role: "Cap Table & Dilution",
    color: "#F59E0B", // Amber gold (Mid-Left)
    baseAngle: Math.PI * 1.05,
    radiusX: 4.8,
    radiusZ: 3.2,
    orbitSpeed: 0.14,
    altitude: 0.45,
    quote: "Series A investable at $60K MRR. Preserve 82% founder equity.",
    mission: "Fundraising benchmarks, investor thesis scoring, and dilution models.",
  },
  {
    id: "traction",
    name: "Traction Agent",
    role: "Distribution Engines",
    color: "#06B6D4", // Bright Cyan (Lower-Left)
    baseAngle: Math.PI * 1.25,
    radiusX: 4.2,
    radiusZ: 2.8,
    orbitSpeed: 0.14,
    altitude: -0.4,
    quote: "Direct cold outbound to 100 design partners beats waitlist pages.",
    mission: "Cohort acquisition, cold outbound funnels, and activation hooks.",
  },
  {
    id: "risk",
    name: "Risk Agent",
    role: "Adversarial Stress Test",
    color: "#FB7185", // Coral Pink/Red (Bottom)
    baseAngle: Math.PI * 1.52,
    radiusX: 3.8,
    radiusZ: 2.5,
    orbitSpeed: 0.14,
    altitude: -1.25,
    quote: "Incumbents added this via API last month. Differentiation is fragile.",
    mission: "Detect blind spots, distribution bottlenecks, and platform risk.",
  },
  {
    id: "market",
    name: "Market Agent",
    role: "TAM & Gravity Vectors",
    color: "#8B5CF6", // Violet (Lower-Right)
    baseAngle: Math.PI * 1.82,
    radiusX: 4.6,
    radiusZ: 3.0,
    orbitSpeed: 0.14,
    altitude: -0.65,
    quote: "Fastest CAGR is in automated workflow orchestration (38% YoY).",
    mission: "Evidence-based bottom-up market sizing and regulatory mapping.",
  },
  {
    id: "product",
    name: "Product Agent",
    role: "Architecture & Sprints",
    color: "#EC4899", // Magenta (Mid-Right)
    baseAngle: Math.PI * 0.15,
    radiusX: 5.4,
    radiusZ: 3.6,
    orbitSpeed: 0.14,
    altitude: 0.55,
    quote: "Cut 4 of 6 features. Ship the autonomous loop in 10 days.",
    mission: "Zero-bloat MVP scope contracts and sprint-ready user stories.",
  },
  {
    id: "operations",
    name: "Ops Agent",
    role: "Autonomous Workflows",
    color: "#3B82F6", // Royal Blue (Upper-Right)
    baseAngle: Math.PI * 0.38,
    radiusX: 5.0,
    radiusZ: 3.4,
    orbitSpeed: 0.14,
    altitude: 1.2,
    quote: "Automate onboarding support tickets before hiring first rep.",
    mission: "Toolchain integration, monitoring alerts, and operational runbooks.",
  },
  {
    id: "finance",
    name: "Finance Agent",
    role: "Burn & Unit Economics",
    color: "#14B8A6", // Teal (Far-Top)
    baseAngle: Math.PI * 0.62,
    radiusX: 6.2,
    radiusZ: 4.2,
    orbitSpeed: 0.14,
    altitude: -0.85,
    quote: "18-month runway buffer required. Maintain >72% gross margin.",
    mission: "Cash burn forecasting, pricing elasticity, and working capital.",
  },
];

interface AgentConstellationProps {
  activeAgentIndex: number;
  onSelectAgent?: (index: number) => void;
  position?: [number, number, number];
}

export function AgentConstellation({
  activeAgentIndex,
  onSelectAgent,
  position = [0, 0, 0],
}: AgentConstellationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const activeAgent = AGENT_ENTITIES[activeAgentIndex] ?? AGENT_ENTITIES[0]!;

  return (
    <group ref={groupRef} position={position}>
      {/* ── 8 Rotating Polyhedral Agent Planets ── */}
      {AGENT_ENTITIES.map((agent, i) => {
        const isActive = i === activeAgentIndex;
        return (
          <RotatingAgentPlanet
            key={agent.id}
            agent={agent}
            isActive={isActive}
            onClick={() => onSelectAgent?.(i)}
          />
        );
      })}

      {/* ── Active Laser Communications Beam ── */}
      <ActiveLaserBeam activeAgent={activeAgent} />
    </group>
  );
}

function RotatingAgentPlanet({
  agent,
  isActive,
  onClick,
}: {
  agent: AgentEntity;
  isActive: boolean;
  onClick: () => void;
}) {
  const planetGroupRef = useRef<THREE.Group>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  const ringMeshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Each frame: compute continuous circular/elliptical orbital motion!
  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const currentAngle = agent.baseAngle + t * agent.orbitSpeed;

    const x = Math.cos(currentAngle) * agent.radiusX;
    const z = Math.sin(currentAngle) * agent.radiusZ;
    const y = agent.altitude + Math.sin(currentAngle * 1.5) * 0.2;

    if (planetGroupRef.current) {
      planetGroupRef.current.position.set(x, y, z);
    }

    // Axial rotation of the planet
    if (coreMeshRef.current) {
      coreMeshRef.current.rotation.y += delta * (isActive ? 2.0 : 0.7);
      coreMeshRef.current.rotation.x += delta * 0.4;

      const targetScale = isActive ? 1.25 : isHovered ? 1.15 : 1.0;
      coreMeshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }

    if (ringMeshRef.current) {
      ringMeshRef.current.rotation.z += delta * 0.5;
    }
  });

  return (
    <group
      ref={planetGroupRef}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onPointerOut={() => setIsHovered(false)}
    >
      {/* 1. Polyhedral Faceted Core (Dodecahedron) */}
      <mesh ref={coreMeshRef}>
        <dodecahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial
          color={agent.color}
          emissive={agent.color}
          emissiveIntensity={isActive ? 1.2 : isHovered ? 0.95 : 0.65}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      {/* 2. Soft Glowing Atmosphere Aura */}
      <mesh>
        <sphereGeometry args={[0.34, 16, 16]} />
        <meshBasicMaterial
          color={agent.color}
          transparent
          opacity={isActive ? 0.35 : isHovered ? 0.25 : 0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Equatorial Planetary Telemetry Ring */}
      <mesh ref={ringMeshRef} rotation={[Math.PI * 0.35, 0.2, 0]}>
        <torusGeometry args={[0.34, 0.007, 8, 32]} />
        <meshBasicMaterial
          color={agent.color}
          transparent
          opacity={isActive ? 0.8 : isHovered ? 0.6 : 0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Telemetry Label Badge (Always single-line, readable, with matching halo) */}
      <Html
        center
        position={[0, -0.42, 0]}
        distanceFactor={8}
        zIndexRange={[50, 0]}
        className="pointer-events-none select-none"
      >
        <span
          className={`inline-block whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-mono tracking-wider transition-all border ${
            isActive
              ? "text-white bg-purple-950/90 border-purple-400/80 shadow-[0_0_12px_rgba(168,85,247,0.5)]"
              : isHovered
              ? "text-white bg-indigo-950/80 border-indigo-400/60 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
              : "text-white/85 bg-black/80 border-white/20 shadow-sm"
          }`}
        >
          {agent.name}
        </span>
      </Html>
    </group>
  );
}

function ActiveLaserBeam({ activeAgent }: { activeAgent: AgentEntity }) {
  const lineRef = useRef<THREE.Line>(null);

  useFrame(({ clock }) => {
    if (!lineRef.current) return;
    const t = clock.getElapsedTime();
    const currentAngle = activeAgent.baseAngle + t * activeAgent.orbitSpeed;

    const x = Math.cos(currentAngle) * activeAgent.radiusX;
    const z = Math.sin(currentAngle) * activeAgent.radiusZ;
    const y = activeAgent.altitude + Math.sin(currentAngle * 1.5) * 0.2;

    const positions = lineRef.current.geometry.attributes.position;
    if (positions) {
      const arr = positions.array as Float32Array;
      // Vertex 0: Core origin
      arr[0] = 0;
      arr[1] = 0;
      arr[2] = 0;
      // Vertex 1: Active Satellite Target
      arr[3] = x;
      arr[4] = y;
      arr[5] = z;
      positions.needsUpdate = true;
    }
  });

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(6);
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, []);

  return (
    // @ts-expect-error Three.js R3F line element
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={activeAgent.color}
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
      />
    </line>
  );
}
