"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useWebGLSupported } from "@/lib/hooks/use-webgl";
import { WebGLErrorBoundary } from "@/components/ui/webgl-error-boundary";

export type AuthPortalVisualState = "idle" | "typing" | "authenticating" | "success" | "error";

interface AuthPortalCanvasProps {
  state?: AuthPortalVisualState;
}

function FloatingAICore({ state = "idle" }: { state: AuthPortalVisualState }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  const wireMeshRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  // Dynamic state colors
  const stateColors = useMemo(() => {
    switch (state) {
      case "typing":
        return { primary: "#38BDF8", secondary: "#818CF8", aura: "#0284C7" };
      case "authenticating":
        return { primary: "#C084FC", secondary: "#A855F7", aura: "#7E22CE" };
      case "success":
        return { primary: "#10B981", secondary: "#34D399", aura: "#059669" };
      case "error":
        return { primary: "#EF4444", secondary: "#F87171", aura: "#DC2626" };
      case "idle":
      default:
        return { primary: "#6366F1", secondary: "#8B5CF6", aura: "#4338CA" };
    }
  }, [state]);

  const targetColor = useMemo(() => new THREE.Color(stateColors.primary), [stateColors.primary]);
  const currentColor = useRef(new THREE.Color(stateColors.primary));

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const speedMult = state === "authenticating" ? 2.8 : state === "typing" ? 1.4 : 1.0;

    // Smooth color transition
    currentColor.current.lerp(targetColor, delta * 3.5);

    if (groupRef.current) {
      // Gentle floating levitation
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.12;
      groupRef.current.rotation.y += delta * 0.15 * speedMult;
    }

    if (coreMeshRef.current) {
      coreMeshRef.current.rotation.x += delta * 0.2 * speedMult;
      coreMeshRef.current.rotation.z -= delta * 0.15 * speedMult;
      const pulse = 1.0 + Math.sin(t * (state === "authenticating" ? 6.0 : 2.5)) * 0.04;
      coreMeshRef.current.scale.setScalar(pulse);
      (coreMeshRef.current.material as THREE.MeshStandardMaterial).emissive.copy(currentColor.current);
    }

    if (wireMeshRef.current) {
      wireMeshRef.current.rotation.y -= delta * 0.25 * speedMult;
      wireMeshRef.current.rotation.x += delta * 0.1 * speedMult;
    }

    if (ring1Ref.current) ring1Ref.current.rotation.x += delta * 0.35 * speedMult;
    if (ring2Ref.current) ring2Ref.current.rotation.y += delta * 0.45 * speedMult;
    if (ring3Ref.current) ring3Ref.current.rotation.z += delta * 0.3 * speedMult;
  });

  return (
    <group ref={groupRef}>
      {/* ── 1. Orbital Crystalline Intelligence Core ── */}
      <mesh ref={coreMeshRef}>
        <dodecahedronGeometry args={[1.15, 0]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.9}
          roughness={0.15}
          emissive={stateColors.primary}
          emissiveIntensity={state === "success" ? 1.5 : 0.8}
        />
      </mesh>

      {/* ── 2. Crystalline Wireframe Hull ── */}
      <mesh ref={wireMeshRef}>
        <icosahedronGeometry args={[1.28, 1]} />
        <meshBasicMaterial
          color={stateColors.secondary}
          wireframe
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── 3. High-Energy Harmonic Rings ── */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.0, 0.012, 16, 80]} />
        <meshBasicMaterial
          color={stateColors.primary}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={ring2Ref} rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[2.35, 0.01, 16, 80]} />
        <meshBasicMaterial
          color={stateColors.secondary}
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={ring3Ref} rotation={[0, Math.PI / 3, Math.PI / 6]}>
        <torusGeometry args={[2.7, 0.008, 16, 80]} />
        <meshBasicMaterial
          color="#C084FC"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── 4. Volumetric Energy Aura Shell ── */}
      <mesh>
        <sphereGeometry args={[2.4, 24, 24]} />
        <meshBasicMaterial
          color={stateColors.aura}
          transparent
          opacity={state === "success" ? 0.22 : 0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function OrbitalParticleCloud({ count = 220 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const palette = [
      new THREE.Color("#818CF8"),
      new THREE.Color("#A78BFA"),
      new THREE.Color("#C084FC"),
      new THREE.Color("#38BDF8"),
      new THREE.Color("#FFFFFF"),
    ];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.4 + Math.pow(Math.random(), 0.8) * 6.5;
      const height = (Math.random() - 0.5) * 4.0;

      pos[i * 3 + 0] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      const c = palette[Math.floor(Math.random() * palette.length)] ?? palette[0]!;
      col[i * 3 + 0] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.035;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function AuthPortalCSSFallback({ state = "idle" }: { state: AuthPortalVisualState }) {
  const glowColor =
    state === "typing"
      ? "#38BDF8"
      : state === "authenticating"
      ? "#C084FC"
      : state === "success"
      ? "#10B981"
      : state === "error"
      ? "#EF4444"
      : "#6366F1";

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        className="relative rounded-full flex items-center justify-center animate-pulse"
        style={{
          width: "160px",
          height: "160px",
          background: `radial-gradient(circle, ${glowColor}40 0%, ${glowColor}10 60%, transparent 80%)`,
          boxShadow: `0 0 50px ${glowColor}50`,
          animationDuration: state === "authenticating" ? "1.5s" : "3s",
        }}
      >
        <div
          className="rounded-full border"
          style={{
            width: "110px",
            height: "110px",
            borderColor: `${glowColor}60`,
            boxShadow: `inset 0 0 20px ${glowColor}40`,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "48px",
            height: "48px",
            background: glowColor,
            boxShadow: `0 0 30px ${glowColor}`,
          }}
        />
      </div>
    </div>
  );
}

export default function AuthPortalCanvas({ state = "idle" }: AuthPortalCanvasProps) {
  const webglSupported = useWebGLSupported();

  if (!webglSupported) {
    return <AuthPortalCSSFallback state={state} />;
  }

  return (
    <WebGLErrorBoundary fallback={<AuthPortalCSSFallback state={state} />}>
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 42, near: 0.1, far: 50 }}
        dpr={1}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
          });
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <ambientLight intensity={0.8} color="#1E1B4B" />
        <directionalLight position={[5, 8, 5]} intensity={1.5} color="#C7D2FE" />
        <pointLight position={[0, 0, 0]} intensity={3.0} distance={15} color="#818CF8" />
        <pointLight position={[-4, -3, 2]} intensity={1.8} distance={15} color="#C084FC" />

        <FloatingAICore state={state} />
        <OrbitalParticleCloud count={220} />
      </Canvas>
    </WebGLErrorBoundary>
  );
}

export { AuthPortalCanvas };
