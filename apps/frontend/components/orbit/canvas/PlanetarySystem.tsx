"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  orbitalVectorVertexShader,
  orbitalVectorFragmentShader,
} from "../shaders/orbitalVector.glsl";
import {
  atmosphereVertexShader,
  atmosphereFragmentShader,
} from "../shaders/atmosphereGlow.glsl";

export interface CelestialNode {
  id: string;
  label: string;
  sector: string;
  color: string;
  secondaryColor: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  tilt: number;
  elevation: number;
  stats: { metric: string; value: string };
  description: string;
}

export const CELESTIAL_NODES: CelestialNode[] = [
  {
    id: "idea",
    label: "Core Hypothesis",
    sector: "Genesis Core",
    color: "#6366F1",
    secondaryColor: "#818CF8",
    size: 0.44,
    orbitRadius: 2.2,
    orbitSpeed: 0.4,
    tilt: 0.12,
    elevation: 0.3,
    stats: { metric: "Belief Clarity", value: "98.4%" },
    description: "The founding spark. Ground zero for problem-solution symmetry.",
  },
  {
    id: "market",
    label: "TAM Gravity Field",
    sector: "Macro Sector 01",
    color: "#8B5CF6",
    secondaryColor: "#A78BFA",
    size: 0.42,
    orbitRadius: 3.4,
    orbitSpeed: 0.35,
    tilt: 0.18,
    elevation: 0.6,
    stats: { metric: "Market Velocity", value: "+34% YoY" },
    description: "Gravitational pull of addressable enterprise demand and urgency.",
  },
  {
    id: "customers",
    label: "Cohort Moons",
    sector: "Retention Belt",
    color: "#A855F7",
    secondaryColor: "#C084FC",
    size: 0.36,
    orbitRadius: 5.2,
    orbitSpeed: 0.24,
    tilt: -0.22,
    elevation: -0.8,
    stats: { metric: "Retention Gravity", value: "76% NRR" },
    description: "Early adopter density, pain frequency, and willing-to-pay signals.",
  },
  {
    id: "product",
    label: "Architecture Rings",
    sector: "Synthesis Orbit",
    color: "#EC4899",
    secondaryColor: "#F472B6",
    size: 0.46,
    orbitRadius: 7.0,
    orbitSpeed: 0.18,
    tilt: 0.35,
    elevation: 1.1,
    stats: { metric: "Cycle Latency", value: "12d Sprints" },
    description: "Full-stack schema, reactive APIs, and autonomous micro-agents.",
  },
  {
    id: "investors",
    label: "Capital Nebula",
    sector: "Valuation Rim",
    color: "#F59E0B",
    secondaryColor: "#FBBF24",
    size: 0.38,
    orbitRadius: 8.8,
    orbitSpeed: 0.14,
    tilt: -0.15,
    elevation: -1.2,
    stats: { metric: "Series A Heat", value: "$18M Post" },
    description: "Thesis alignment, dilution dynamics, and milestone-backed runway.",
  },
  {
    id: "revenue",
    label: "Yield Pulsar",
    sector: "Monetization Axis",
    color: "#10B981",
    secondaryColor: "#34D399",
    size: 0.40,
    orbitRadius: 10.4,
    orbitSpeed: 0.12,
    tilt: 0.28,
    elevation: 0.7,
    stats: { metric: "LTV/CAC Ratio", value: "4.8x" },
    description: "Self-sustaining unit economics and contractual expansion loops.",
  },
  {
    id: "competitors",
    label: "Entropy Zone",
    sector: "Perimeter Shield",
    color: "#EF4444",
    secondaryColor: "#F87171",
    size: 0.34,
    orbitRadius: 12.0,
    orbitSpeed: 0.09,
    tilt: -0.4,
    elevation: -1.5,
    stats: { metric: "Moat Differential", value: "10x Faster" },
    description: "Legacy incumbents and pivot vectors monitored in real-time.",
  },
];

export const ORBITAL_EDGES: [string, string][] = [
  ["idea", "market"],
  ["idea", "customers"],
  ["idea", "product"],
  ["market", "investors"],
  ["market", "revenue"],
  ["customers", "product"],
  ["product", "revenue"],
  ["investors", "revenue"],
  ["competitors", "market"],
  ["idea", "competitors"],
];

interface PlanetarySystemProps {
  hoveredId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  position?: [number, number, number];
}

export function PlanetarySystem({
  hoveredId,
  selectedId,
  onHover,
  onSelect,
  position = [0, 0, 0],
}: PlanetarySystemProps) {
  const groupRef = useRef<THREE.Group>(null);
  const nodePositions = useRef<Record<string, THREE.Vector3>>({});

  // Initialize node position trackers
  useMemo(() => {
    CELESTIAL_NODES.forEach((node) => {
      nodePositions.current[node.id] = new THREE.Vector3(
        node.orbitRadius,
        node.elevation,
        0
      );
    });
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Compute updated Keplerian celestial positions for edges
    CELESTIAL_NODES.forEach((node) => {
      if (node.orbitRadius === 0) {
        nodePositions.current[node.id]?.set(0, 0, 0);
      } else {
        const angle = t * node.orbitSpeed + node.tilt * 5.0;
        const x = Math.cos(angle) * node.orbitRadius;
        const z = Math.sin(angle) * node.orbitRadius;
        const y = node.elevation + Math.sin(angle * 2.0) * 0.25;
        nodePositions.current[node.id]?.set(x, y, z);
      }
    });

    if (groupRef.current) {
      // Very slow orbital plane rotation
      groupRef.current.rotation.y = t * 0.012;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* ── 1. Keplerian Orbit Ring Lines ── */}
      {CELESTIAL_NODES.map((node) => {
        if (node.orbitRadius <= 0) return null;
        return (
          <mesh
            key={`orbit-ring-${node.id}`}
            rotation={[Math.PI / 2 + node.tilt * 0.3, 0, 0]}
            position={[0, node.elevation * 0.4, 0]}
          >
            <torusGeometry args={[node.orbitRadius, 0.010, 6, 64]} />
            <meshBasicMaterial
              color={node.color}
              transparent
              opacity={hoveredId === node.id ? 0.45 : 0.12}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}

      {/* ── 2. Inter-Planetary Vector Pulses (Batched into 1 single LineSegments draw call) ── */}
      <OrbitalPulseLinks
        edges={ORBITAL_EDGES}
        nodePositions={nodePositions}
        hoveredId={hoveredId}
        selectedId={selectedId}
      />

      {/* ── 3. Celestial Bodies (Planets & Pulsars) ── */}
      {CELESTIAL_NODES.map((node) => (
        <CelestialSphere
          key={node.id}
          node={node}
          isHovered={hoveredId === node.id}
          isSelected={selectedId === node.id}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

function CelestialSphere({
  node,
  isHovered,
  isSelected,
  onHover,
  onSelect,
}: {
  node: CelestialNode;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const posGroupRef = useRef<THREE.Group>(null);

  // Atmosphere glow uniforms
  const atmosphereUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(node.secondaryColor) },
      uCoefficient: { value: 1.2 },
      uPower: { value: 2.8 },
    }),
    [node.secondaryColor]
  );

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    // Position planet along Keplerian orbit
    if (posGroupRef.current) {
      if (node.orbitRadius === 0) {
        posGroupRef.current.position.set(0, 0, 0);
      } else {
        const angle = t * node.orbitSpeed + node.tilt * 5.0;
        posGroupRef.current.position.x = Math.cos(angle) * node.orbitRadius;
        posGroupRef.current.position.z = Math.sin(angle) * node.orbitRadius;
        posGroupRef.current.position.y =
          node.elevation + Math.sin(angle * 2.0) * 0.25;
      }
    }

    // Sphere rotation & scale interpolation
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (isHovered ? 1.4 : 0.4);

      const targetScale = isSelected ? 1.4 : isHovered ? 1.25 : 1.0;
      const currentScale = meshRef.current.scale.x;
      const nextScale = currentScale + (targetScale - currentScale) * 0.12;
      meshRef.current.scale.setScalar(nextScale);
    }

    // Outer equatorial ring rotation
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.5;
    }
  });

  return (
    <group ref={posGroupRef}>
      {/* Interactive Core Sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node.id);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id);
        }}
      >
        <sphereGeometry args={[node.size, 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          metalness={0.7}
          roughness={0.25}
          emissive={node.color}
          emissiveIntensity={isHovered || isSelected ? 0.8 : 0.25}
        />
      </mesh>

      {/* Atmospheric Fresnel Rim */}
      <mesh ref={atmosphereRef} scale={[1.25, 1.25, 1.25]}>
        <sphereGeometry args={[node.size, 24, 24]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={atmosphereUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Equatorial Telemetry Ring */}
      <mesh ref={ringRef} rotation={[Math.PI * 0.4, 0.2, 0]}>
        <torusGeometry args={[node.size * 1.5, 0.008, 8, 48]} />
        <meshBasicMaterial
          color={node.secondaryColor}
          transparent
          opacity={isHovered ? 0.75 : 0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3D Aerospace Telemetry Tag - Rendered selectively on hover/select to eliminate 7 continuous DOM reflows */}
      {(isHovered || isSelected) && (
        <Html center position={[0, -node.size - 0.35, 0]} distanceFactor={16} zIndexRange={[100, 0]} className="pointer-events-none select-none">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase whitespace-nowrap transition-colors border ${
              isHovered || isSelected
                ? "text-white bg-indigo-950/90 border-indigo-400/80 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                : "text-indigo-200/60 bg-black/60 border-white/10"
            }`}
          >
            {node.label}
          </span>
        </Html>
      )}
    </group>
  );
}

// Batched Single-Draw-Call Inter-Planetary Vector Pulses
function OrbitalPulseLinks({
  edges,
  nodePositions,
  hoveredId,
  selectedId,
}: {
  edges: [string, string][];
  nodePositions: React.MutableRefObject<Record<string, THREE.Vector3>>;
  hoveredId: string | null;
  selectedId: string | null;
}) {
  const lineSegmentsRef = useRef<THREE.LineSegments>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { geometry, uniforms } = useMemo(() => {
    const vertexCount = edges.length * 2;
    const positions = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const active = new Float32Array(vertexCount);

    for (let i = 0; i < edges.length; i++) {
      // Vertex 0 of edge
      uvs[i * 4] = 0.0;
      uvs[i * 4 + 1] = 0.0;
      // Vertex 1 of edge
      uvs[i * 4 + 2] = 1.0;
      uvs[i * 4 + 3] = 1.0;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geom.setAttribute("aActive", new THREE.BufferAttribute(active, 1));

    const unis = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#6366F1") },
      uActiveColor: { value: new THREE.Color("#67E8F9") },
      uSpeed: { value: 1.2 },
    };

    return { geometry: geom, uniforms: unis };
  }, [edges.length]);

  useFrame(({ clock }) => {
    if (materialRef.current?.uniforms?.uTime) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }

    if (!lineSegmentsRef.current) return;
    const posAttr = lineSegmentsRef.current.geometry.attributes.position;
    const activeAttr = lineSegmentsRef.current.geometry.attributes.aActive;
    if (!posAttr || !activeAttr) return;

    const posArray = posAttr.array as Float32Array;
    const activeArray = activeAttr.array as Float32Array;

    for (let i = 0; i < edges.length; i++) {
      const [src, dst] = edges[i]!;
      const pA = nodePositions.current[src];
      const pB = nodePositions.current[dst];
      if (pA && pB) {
        posArray[i * 6] = pA.x;
        posArray[i * 6 + 1] = pA.y;
        posArray[i * 6 + 2] = pA.z;
        posArray[i * 6 + 3] = pB.x;
        posArray[i * 6 + 4] = pB.y;
        posArray[i * 6 + 5] = pB.z;
      }

      const isActive =
        hoveredId === src ||
        hoveredId === dst ||
        selectedId === src ||
        selectedId === dst;

      activeArray[i * 2] = isActive ? 1.0 : 0.0;
      activeArray[i * 2 + 1] = isActive ? 1.0 : 0.0;
    }

    posAttr.needsUpdate = true;
    activeAttr.needsUpdate = true;
  });

  return (
    <lineSegments ref={lineSegmentsRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={orbitalVectorVertexShader}
        fragmentShader={orbitalVectorFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

