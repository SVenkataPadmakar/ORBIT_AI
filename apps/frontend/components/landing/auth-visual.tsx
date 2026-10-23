"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useWebGLSupported } from "@/lib/hooks/use-webgl";
import { WebGLErrorBoundary } from "@/components/ui/webgl-error-boundary";

function RotatingGeo() {
    const meshRef = useRef<THREE.Mesh>(null);
    const wireRef = useRef<THREE.Mesh>(null);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.15;
            meshRef.current.rotation.y += delta * 0.22;
        }
        if (wireRef.current) {
            wireRef.current.rotation.x -= delta * 0.1;
            wireRef.current.rotation.z += delta * 0.18;
        }
    });

    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[3, 3, 3]} intensity={2} color="#6366F1" />
            <pointLight position={[-3, -3, 2]} intensity={1} color="#A855F7" />

            {/* Solid icosahedron */}
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[1.4, 0]} />
                <meshStandardMaterial
                    color="#14141C"
                    metalness={0.9}
                    roughness={0.1}
                    emissive="#6366F1"
                    emissiveIntensity={0.15}
                />
            </mesh>

            {/* Wireframe layer */}
            <mesh ref={wireRef}>
                <icosahedronGeometry args={[1.42, 0]} />
                <meshBasicMaterial color="#6366F1" wireframe transparent opacity={0.3} />
            </mesh>

            {/* Glow sphere */}
            <mesh>
                <sphereGeometry args={[2, 24, 24]} />
                <meshBasicMaterial color="#6366F1" transparent opacity={0.04} side={THREE.BackSide} />
            </mesh>
        </>
    );
}

function AuthVisualCSSFallback() {
    return (
        <div className="w-full h-full flex items-center justify-center pointer-events-none">
            <div className="relative w-44 h-44 rounded-full border border-indigo-500/30 flex items-center justify-center animate-pulse" style={{ animationDuration: "4s" }}>
                <div className="w-32 h-32 rounded-full border border-purple-500/40" style={{ transform: "rotate(45deg)" }} />
                <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600/40 to-purple-600/40 blur-md" />
                <div className="w-8 h-8 rounded-full bg-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.8)]" />
            </div>
        </div>
    );
}

export function AuthVisualCanvas() {
    const webglSupported = useWebGLSupported();
    if (!webglSupported) {
        return <AuthVisualCSSFallback />;
    }

    return (
        <WebGLErrorBoundary fallback={<AuthVisualCSSFallback />}>
            <Canvas
                camera={{ position: [0, 0, 4.5], fov: 40 }}
                dpr={[1, 1.5]}
                gl={{ antialias: false, alpha: true, failIfMajorPerformanceCaveat: false }}
                style={{ background: "transparent" }}
            >
                <RotatingGeo />
            </Canvas>
        </WebGLErrorBoundary>
    );
}
