"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useWebGLSupported } from "@/lib/hooks/use-webgl";
import { WebGLErrorBoundary } from "@/components/ui/webgl-error-boundary";

/* ─── Particle field ────────────────────────────────────────────────────────── */

function StarField({ count = 2000 }: { count?: number }) {
    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            arr[i * 3 + 0] = (Math.random() - 0.5) * 60;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 60;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 60;
        }
        return arr;
    }, [count]);

    const ref = useRef<THREE.Points>(null);
    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.015;
            ref.current.rotation.x += delta * 0.005;
        }
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled>
            <PointMaterial
                transparent
                color="#6366F1"
                size={0.05}
                sizeAttenuation
                depthWrite={false}
                opacity={0.5}
            />
        </Points>
    );
}

/* ─── Neural sphere ─────────────────────────────────────────────────────────── */

function NeuralSphere({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
    const meshRef      = useRef<THREE.Mesh>(null);
    const wireRef      = useRef<THREE.Mesh>(null);
    const outerRef     = useRef<THREE.Mesh>(null);
    const glowRef      = useRef<THREE.Mesh>(null);
    const clock        = useRef(0);

    useFrame((_, delta) => {
        clock.current += delta;
        const t = clock.current;

        if (meshRef.current) {
            // Follow cursor with damping
            meshRef.current.rotation.y += (mouse.current.x * 0.8 - meshRef.current.rotation.y) * 0.04;
            meshRef.current.rotation.x += (mouse.current.y * 0.4 - meshRef.current.rotation.x) * 0.04;
            // Breathing
            const s = 1 + Math.sin(t * 0.8) * 0.03;
            meshRef.current.scale.setScalar(s);
        }

        if (wireRef.current) {
            wireRef.current.rotation.y -= delta * 0.3;
            wireRef.current.rotation.z += delta * 0.15;
        }

        if (outerRef.current) {
            outerRef.current.rotation.y += delta * 0.1;
            outerRef.current.rotation.x -= delta * 0.07;
        }

        if (glowRef.current) {
            const gs = 1 + Math.sin(t * 0.6) * 0.06;
            glowRef.current.scale.setScalar(gs);
            const mat = glowRef.current.material as THREE.MeshBasicMaterial;
            mat.opacity = 0.08 + Math.sin(t * 0.8) * 0.04;
        }
    });

    return (
        <group>
            {/* Glow sphere */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[1.6, 32, 32]} />
                <meshBasicMaterial color="#6366F1" transparent opacity={0.08} />
            </mesh>

            {/* Outer wireframe ring */}
            <mesh ref={outerRef}>
                <torusGeometry args={[1.5, 0.003, 16, 80]} />
                <meshBasicMaterial color="#8B5CF6" transparent opacity={0.4} />
            </mesh>

            {/* Core sphere */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    color="#111120"
                    metalness={0.9}
                    roughness={0.1}
                    envMapIntensity={0.5}
                />
            </mesh>

            {/* Inner wireframe */}
            <mesh ref={wireRef}>
                <icosahedronGeometry args={[1.02, 2]} />
                <meshBasicMaterial color="#6366F1" wireframe transparent opacity={0.25} />
            </mesh>

            {/* Orbiting particles */}
            {[0, 1, 2, 3].map((i) => (
                <OrbitParticle key={i} index={i} />
            ))}
        </group>
    );
}

function OrbitParticle({ index }: { index: number }) {
    const ref = useRef<THREE.Mesh>(null);
    const speed = 0.4 + index * 0.15;
    const radius = 1.6 + index * 0.18;
    const angle = (index / 4) * Math.PI * 2;
    const tilt = (index % 2 === 0 ? 1 : -1) * (0.3 + index * 0.2);

    useFrame(({ clock }) => {
        if (!ref.current) return;
        const t = clock.getElapsedTime() * speed + angle;
        ref.current.position.x = Math.cos(t) * radius * Math.cos(tilt);
        ref.current.position.y = Math.sin(t) * radius;
        ref.current.position.z = Math.cos(t) * radius * Math.sin(tilt);
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color={index % 2 === 0 ? "#6366F1" : "#A855F7"} />
        </mesh>
    );
}

/* ─── Camera rig (follows mouse) ────────────────────────────────────────────── */

function CameraRig({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
    useFrame(({ camera }) => {
        camera.position.x += (mouse.current.x * 0.5 - camera.position.x) * 0.02;
        camera.position.y += (-mouse.current.y * 0.3 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);
    });
    return null;
}

/* ─── Lights ────────────────────────────────────────────────────────────────── */

function Lights() {
    return (
        <>
            <ambientLight intensity={0.4} />
            <pointLight position={[4, 4, 4]} intensity={2} color="#6366F1" />
            <pointLight position={[-4, -2, -4]} intensity={1} color="#A855F7" />
            <pointLight position={[0, 6, 2]} intensity={0.5} color="#FFFFFF" />
        </>
    );
}

function AIEntityCSSFallback() {
    return (
        <div className="w-full h-full flex items-center justify-center pointer-events-none">
            <div className="relative w-56 h-56 rounded-full border border-indigo-500/25 flex items-center justify-center animate-pulse" style={{ animationDuration: "5s" }}>
                <div className="w-40 h-40 rounded-full border border-purple-500/35 animate-spin" style={{ animationDuration: "30s" }} />
                <div className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 blur-lg" />
                <div className="w-12 h-12 rounded-full bg-indigo-500 shadow-[0_0_35px_rgba(99,102,241,0.7)]" />
            </div>
        </div>
    );
}

/* ─── Main export ───────────────────────────────────────────────────────────── */

export function AIEntityCanvas({ mouse }: {
    mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
    const webglSupported = useWebGLSupported();
    if (!webglSupported) {
        return <AIEntityCSSFallback />;
    }

    return (
        <WebGLErrorBoundary fallback={<AIEntityCSSFallback />}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                dpr={[1, 1.5]}
                gl={{ antialias: false, alpha: true, failIfMajorPerformanceCaveat: false }}
                style={{ background: "transparent" }}
            >
                <Lights />
                <StarField />
                <NeuralSphere mouse={mouse} />
                <CameraRig mouse={mouse} />
            </Canvas>
        </WebGLErrorBoundary>
    );
}
