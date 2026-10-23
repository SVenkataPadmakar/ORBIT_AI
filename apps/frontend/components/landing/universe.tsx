"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Sphere, Line } from "@react-three/drei";
import * as THREE from "three";
import { useWebGLSupported } from "@/lib/hooks/use-webgl";
import { WebGLErrorBoundary } from "@/components/ui/webgl-error-boundary";

type Node = {
    id: string;
    label: string;
    position: [number, number, number];
    color: string;
};

const NODES: Node[] = [
    { id: "idea",       label: "Idea",       position: [0,    0,    0],    color: "#6366F1" },
    { id: "market",     label: "Market",     position: [2.5,  1,    0.5],  color: "#8B5CF6" },
    { id: "customers",  label: "Customers",  position: [-2.4, 0.8,  0.3],  color: "#A855F7" },
    { id: "product",    label: "Product",    position: [0.3,  2.5, -0.5],  color: "#EC4899" },
    { id: "investors",  label: "Investors",  position: [-1.8,-1.8,  0.8],  color: "#F59E0B" },
    { id: "revenue",    label: "Revenue",    position: [2.0, -1.6, -0.3],  color: "#10B981" },
    { id: "competitors",label: "Competitors",position: [-0.5,-0.5,  2.5],  color: "#EF4444" },
];

const EDGES: [string, string][] = [
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

function UniverseNode({ node, hovered, onHover }: {
    node: Node;
    hovered: boolean;
    onHover: (id: string | null) => void;
}) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        const target = hovered ? 1.2 : 1.0;
        const current = meshRef.current.scale.x;
        const next = current + (target - current) * 0.08;
        meshRef.current.scale.setScalar(next);
        meshRef.current.rotation.y += delta * (hovered ? 1.2 : 0.3);
    });

    return (
        <group position={node.position}>
            {/* Glow */}
            {hovered && (
                <mesh>
                    <sphereGeometry args={[0.38, 16, 16]} />
                    <meshBasicMaterial color={node.color} transparent opacity={0.18} />
                </mesh>
            )}

            {/* Core node */}
            <mesh
                ref={meshRef}
                onPointerOver={() => onHover(node.id)}
                onPointerOut={() => onHover(null)}
            >
                <sphereGeometry args={[0.22, 24, 24]} />
                <meshStandardMaterial
                    color={node.color}
                    metalness={0.6}
                    roughness={0.2}
                    emissive={node.color}
                    emissiveIntensity={hovered ? 0.6 : 0.2}
                />
            </mesh>

            {/* Ring around node */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.28, 0.008, 8, 40]} />
                <meshBasicMaterial color={node.color} transparent opacity={0.5} />
            </mesh>

            {/* Label */}
            <Text
                position={[0, -0.42, 0]}
                fontSize={0.14}
                color={hovered ? "#FFFFFF" : "#9494B8"}
                anchorX="center"
                anchorY="middle"
                font="/fonts/Inter-Medium.woff"
            >
                {node.label}
            </Text>
        </group>
    );
}

function Universe({ hoveredId, onHover }: {
    hoveredId: string | null;
    onHover: (id: string | null) => void;
}) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.04;
        }
    });

    const nodeMap = useMemo(() =>
        Object.fromEntries(NODES.map((n) => [n.id, n])), []);

    return (
        <group ref={groupRef}>
            {/* Edges */}
            {EDGES.map(([a, b]) => {
                const na = nodeMap[a];
                const nb = nodeMap[b];
                if (!na || !nb) return null;
                const isActive = hoveredId === a || hoveredId === b;
                return (
                    <Line
                        key={`${a}-${b}`}
                        points={[na.position, nb.position]}
                        color={isActive ? "#6366F1" : "#2A2A3E"}
                        lineWidth={isActive ? 1.5 : 0.5}
                        transparent
                        opacity={isActive ? 0.8 : 0.4}
                    />
                );
            })}

            {/* Nodes */}
            {NODES.map((node) => (
                <UniverseNode
                    key={node.id}
                    node={node}
                    hovered={hoveredId === node.id}
                    onHover={onHover}
                />
            ))}

            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1.5} color="#6366F1" />
            <pointLight position={[-5, -5, 5]} intensity={0.8} color="#A855F7" />
        </group>
    );
}

function StartupUniverseCSSFallback({ hoveredId, onHover }: {
    hoveredId: string | null;
    onHover: (id: string | null) => void;
}) {
    return (
        <div className="relative w-full h-full min-h-[360px] flex items-center justify-center pointer-events-auto">
            <div className="relative w-72 h-72 rounded-full border border-indigo-500/20 flex items-center justify-center">
                <div className="absolute w-56 h-56 rounded-full border border-purple-500/30 animate-spin" style={{ animationDuration: "35s" }} />
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-[0_0_40px_rgba(99,102,241,0.6)] flex items-center justify-center text-xs font-bold text-white tracking-widest">
                    ORBIT
                </div>
                {NODES.map((node, i) => {
                    const angle = (i / NODES.length) * 2 * Math.PI;
                    const x = Math.cos(angle) * 115;
                    const y = Math.sin(angle) * 115;
                    const isHovered = hoveredId === node.id;
                    return (
                        <div
                            key={node.id}
                            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300"
                            style={{
                                left: `calc(50% + ${x}px)`,
                                top: `calc(50% + ${y}px)`,
                                transform: `translate(-50%, -50%) scale(${isHovered ? 1.25 : 1})`,
                            }}
                            onMouseEnter={() => onHover(node.id)}
                            onMouseLeave={() => onHover(null)}
                        >
                            <div
                                className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-white shadow-lg border border-white/10"
                                style={{
                                    backgroundColor: node.color,
                                    boxShadow: `0 0 15px ${node.color}80`,
                                }}
                            >
                                {node.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function StartupUniverseCanvas({ hoveredId, onHover }: {
    hoveredId: string | null;
    onHover: (id: string | null) => void;
}) {
    const webglSupported = useWebGLSupported();
    if (!webglSupported) {
        return <StartupUniverseCSSFallback hoveredId={hoveredId} onHover={onHover} />;
    }

    return (
        <WebGLErrorBoundary fallback={<StartupUniverseCSSFallback hoveredId={hoveredId} onHover={onHover} />}>
            <Canvas
                camera={{ position: [0, 0, 7], fov: 50 }}
                dpr={[1, 1.5]}
                gl={{ antialias: false, alpha: true, failIfMajorPerformanceCaveat: false }}
                style={{ background: "transparent" }}
            >
                <Universe hoveredId={hoveredId} onHover={onHover} />
                <OrbitControls
                    enableZoom
                    enablePan={false}
                    minDistance={4}
                    maxDistance={12}
                    autoRotate={false}
                />
            </Canvas>
        </WebGLErrorBoundary>
    );
}
