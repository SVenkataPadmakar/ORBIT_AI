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
  angle: number;
  radius: number;
  altitude: number;
  quote: string;
  mission: string;
}

export const AGENT_ENTITIES: AgentEntity[] = [
  {
    id: "problem",
    name: "Problem Agent",
    role: "Validation & Discovery",
    color: "#6366F1",
    angle: 0.0,
    radius: 4.8,
    altitude: 1.2,
    quote: "The pain is acute, but founders mistake symptoms for root causes.",
    mission: "Ruthless customer interview interrogation and falsification.",
  },
  {
    id: "market",
    name: "Market Agent",
    role: "TAM & Gravity Vectors",
    color: "#8B5CF6",
    angle: 0.63,
    radius: 5.6,
    altitude: -0.8,
    quote: "Fastest CAGR is in automated workflow orchestration (38% YoY).",
    mission: "Evidence-based bottom-up market sizing and regulatory mapping.",
  },
  {
    id: "product",
    name: "Product Agent",
    role: "Architecture & Sprints",
    color: "#EC4899",
    angle: 1.26,
    radius: 5.0,
    altitude: 1.8,
    quote: "Cut 4 of 6 features. Ship the autonomous loop in 10 days.",
    mission: "Zero-bloat MVP scope contracts and sprint-ready user stories.",
  },
  {
    id: "risk",
    name: "Risk Agent",
    role: "Adversarial Stress Test",
    color: "#EF4444",
    angle: 1.88,
    radius: 6.2,
    altitude: -1.4,
    quote: "Incumbents added this via API last month. Differentiation is fragile.",
    mission: "Detect blind spots, distribution bottlenecks, and platform risk.",
  },
  {
    id: "vc",
    name: "VC Agent",
    role: "Cap Table & Dilution",
    color: "#F59E0B",
    angle: 2.51,
    radius: 5.4,
    altitude: 0.4,
    quote: "Series A investable at $60K MRR. Preserve 82% founder equity.",
    mission: "Fundraising benchmarks, investor thesis scoring, and dilution models.",
  },
  {
    id: "architecture",
    name: "Architecture Agent",
    role: "Infrastructure & Stack",
    color: "#10B981",
    angle: 3.14,
    radius: 6.8,
    altitude: 1.5,
    quote: "Postgres + Vector + Event Streams. Scale to 500k ops before sharding.",
    mission: "System architecture, API schemas, and deployment pipelines.",
  },
  {
    id: "traction",
    name: "Traction Agent",
    role: "Distribution Engines",
    color: "#06B6D4",
    angle: 3.77,
    radius: 5.2,
    altitude: -1.1,
    quote: "Direct cold outbound to 100 design partners beats waitlist pages.",
    mission: "Cohort acquisition, cold outbound funnels, and activation hooks.",
  },
  {
    id: "finance",
    name: "Finance Agent",
    role: "Burn & Unit Economics",
    color: "#14B8A6",
    angle: 4.4,
    radius: 6.0,
    altitude: 0.9,
    quote: "18-month runway buffer required. Maintain >72% gross margin.",
    mission: "Cash burn forecasting, pricing elasticity, and working capital.",
  },
  {
    id: "operations",
    name: "Ops Agent",
    role: "Autonomous Workflows",
    color: "#3B82F6",
    angle: 5.03,
    radius: 5.8,
    altitude: -0.5,
    quote: "Automate onboarding support tickets before hiring first rep.",
    mission: "Toolchain integration, monitoring alerts, and operational runbooks.",
  },
  {
    id: "legal",
    name: "Legal Agent",
    role: "IP & Compliance",
    color: "#A855F7",
    angle: 5.65,
    radius: 6.4,
    altitude: 1.0,
    quote: "Ensure Delaware C-Corp IP assignment and strict GDPR telemetry flags.",
    mission: "Formation covenants, terms of service, and privacy safeguards.",
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

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Slow orbital precess
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Central Quantum Relay Hub */}
      <mesh>
        <octahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color="#6366F1"
          wireframe
          emissive="#6366F1"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* 10 Satellite Intelligence Probes */}
      {AGENT_ENTITIES.map((agent, i) => {
        const isActive = i === activeAgentIndex;
        return (
          <AgentSatellite
            key={agent.id}
            agent={agent}
            isActive={isActive}
            onClick={() => onSelectAgent?.(i)}
          />
        );
      })}

      {/* Laser Communications Line to Active Agent */}
      <ActiveLaserBeam
        targetRadius={activeAgent.radius}
        targetAltitude={activeAgent.altitude}
        targetAngle={activeAgent.angle}
        color={activeAgent.color}
      />
    </group>
  );
}

function AgentSatellite({
  agent,
  isActive,
  onClick,
}: {
  agent: AgentEntity;
  isActive: boolean;
  onClick: () => void;
}) {
  const satelliteRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = Math.cos(agent.angle) * agent.radius;
  const z = Math.sin(agent.angle) * agent.radius;
  const y = agent.altitude;

  useFrame(({ clock }, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * (isActive ? 2.5 : 0.6);
      coreRef.current.rotation.x += delta * 0.4;
      const pulse = isActive ? 1.0 + Math.sin(clock.getElapsedTime() * 4.0) * 0.15 : 1.0;
      coreRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group
      ref={satelliteRef}
      position={[x, y, z]}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onPointerOut={() => setIsHovered(false)}
    >
      {/* Core Satellite Node */}
      <mesh ref={coreRef}>
        <dodecahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial
          color={agent.color}
          metalness={0.8}
          roughness={0.2}
          emissive={agent.color}
          emissiveIntensity={isActive ? 1.2 : 0.3}
        />
      </mesh>

      {/* Active High-Energy Aura */}
      {isActive && (
        <mesh>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshBasicMaterial
            color={agent.color}
            transparent
            opacity={0.22}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Solar Telemetry Fins */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.65, 0.02, 0.15]} />
        <meshBasicMaterial
          color={agent.color}
          transparent
          opacity={isActive ? 0.9 : 0.4}
        />
      </mesh>

      {/* 3D Agent Tag - Rendered selectively when active or hovered to eliminate 10 continuous DOM reflows */}
      {(isActive || isHovered) && (
        <Html center position={[0, -0.4, 0]} distanceFactor={16} zIndexRange={[100, 0]} className="pointer-events-none select-none">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-colors border ${
              isActive
                ? "text-white bg-purple-950/90 border-purple-400/80 shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                : "text-white/80 bg-black/80 border-white/20 shadow-md"
            }`}
          >
            {agent.name}
          </span>
        </Html>
      )}
    </group>
  );
}

function ActiveLaserBeam({
  targetRadius,
  targetAltitude,
  targetAngle,
  color,
}: {
  targetRadius: number;
  targetAltitude: number;
  targetAngle: number;
  color: string;
}) {
  const tx = Math.cos(targetAngle) * targetRadius;
  const tz = Math.sin(targetAngle) * targetRadius;
  const ty = targetAltitude;

  const lineObj = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array([0, 0, 0, tx, ty, tz]);
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    return new THREE.Line(geom, mat);
  }, [color, tx, ty, tz]);

  useFrame(() => {
    const positions = lineObj.geometry.attributes.position;
    if (positions) {
      positions.setXYZ(0, 0, 0, 0);
      positions.setXYZ(1, tx, ty, tz);
      positions.needsUpdate = true;
    }
  });

  return <primitive object={lineObj} />;
}
