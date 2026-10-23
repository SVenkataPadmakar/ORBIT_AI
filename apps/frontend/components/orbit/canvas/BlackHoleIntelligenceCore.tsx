"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  accretionDiskVertexShader,
  accretionDiskFragmentShader,
} from "../shaders/accretionDisk.glsl";

interface BlackHoleProps {
  position?: [number, number, number];
  scale?: number;
}

// 5 Core Intelligence Streams flowing into the Singularity
const INTELLIGENCE_STREAMS = [
  { name: "AI",        color: "#00F0FF", angleOffset: 0.0,             speed: 0.55 },
  { name: "DATA",      color: "#818CF8", angleOffset: (Math.PI * 2) / 5 * 1, speed: 0.48 },
  { name: "REASONING", color: "#A78BFA", angleOffset: (Math.PI * 2) / 5 * 2, speed: 0.52 },
  { name: "AGENTS",    color: "#38BDF8", angleOffset: (Math.PI * 2) / 5 * 3, speed: 0.60 },
  { name: "EXECUTION", color: "#34D399", angleOffset: (Math.PI * 2) / 5 * 4, speed: 0.44 },
];

export function BlackHoleIntelligenceCore({
  position = [0, 0, 0],
  scale = 1.3,
}: BlackHoleProps) {
  const groupRef = useRef<THREE.Group>(null);
  const diskMeshRef = useRef<THREE.Mesh>(null);
  const upperLensingRef = useRef<THREE.Mesh>(null);
  const lowerLensingRef = useRef<THREE.Mesh>(null);
  const photonRingRef = useRef<THREE.Mesh>(null);

  // Responsive mobile LOD detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Custom ShaderMaterial uniforms for the Accretion Disk
  const diskUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorInner: { value: new THREE.Color("#E0F2FE") }, // White-cyan high-energy photon edge
      uColorMid: { value: new THREE.Color("#6366F1") },   // Deep Co-Founder Indigo
      uColorOuter: { value: new THREE.Color("#312E81") }, // Deep cosmic boundary
      uInnerRadius: { value: 0.28 },
      uOuterRadius: { value: 0.95 },
    }),
    []
  );

  // Animation Loop
  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();
    diskUniforms.uTime.value = time;

    // Subtle axial rotation for accretion disk
    if (diskMeshRef.current) {
      diskMeshRef.current.rotation.z += delta * 0.12;
    }

    // Gravitational lensing arcs counter-swirl
    if (upperLensingRef.current) {
      upperLensingRef.current.rotation.z += delta * 0.08;
    }
    if (lowerLensingRef.current) {
      lowerLensingRef.current.rotation.z -= delta * 0.08;
    }

    // Photon ring breathing pulse
    if (photonRingRef.current) {
      const s = 1.0 + Math.sin(time * 2.0) * 0.015;
      photonRingRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* ── 1. The Event Horizon (Pure Black Void Sphere) ── */}
      <mesh>
        <sphereGeometry args={[1.0, isMobile ? 24 : 36, isMobile ? 24 : 36]} />
        <meshBasicMaterial color="#000002" />
      </mesh>

      {/* ── 2. Photon Sphere Boundary (Razor-Sharp Luminous Rim) ── */}
      <mesh ref={photonRingRef}>
        <sphereGeometry args={[1.025, isMobile ? 20 : 32, isMobile ? 20 : 32]} />
        <meshBasicMaterial
          color="#C7D2FE"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── 3. High-Energy Outer Photon Shell ── */}
      <mesh>
        <sphereGeometry args={[1.06, 24, 24]} />
        <meshBasicMaterial
          color="#818CF8"
          wireframe
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── 4. Primary Relativistic Accretion Disk ── */}
      <mesh
        ref={diskMeshRef}
        rotation={[-Math.PI * 0.40, 0.12, 0]}
      >
        <planeGeometry args={[7.4, 7.4, isMobile ? 28 : 44, isMobile ? 28 : 44]} />
        <shaderMaterial
          vertexShader={accretionDiskVertexShader}
          fragmentShader={accretionDiskFragmentShader}
          uniforms={diskUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── 5. Gravitational Lensing: Upper Einstein Arc (Bending over horizon) ── */}
      <mesh
        ref={upperLensingRef}
        rotation={[Math.PI * 0.42, -0.15, 0]}
        position={[0, 0.1, -0.1]}
      >
        <planeGeometry args={[6.8, 6.8, isMobile ? 20 : 32, isMobile ? 20 : 32]} />
        <shaderMaterial
          vertexShader={accretionDiskVertexShader}
          fragmentShader={accretionDiskFragmentShader}
          uniforms={diskUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          opacity={0.65}
        />
      </mesh>

      {/* ── 6. Gravitational Lensing: Lower Einstein Arc (Bending under horizon) ── */}
      <mesh
        ref={lowerLensingRef}
        rotation={[-Math.PI * 0.44, 0.18, 0]}
        position={[0, -0.1, -0.1]}
      >
        <planeGeometry args={[6.2, 6.2, isMobile ? 18 : 28, isMobile ? 18 : 28]} />
        <shaderMaterial
          vertexShader={accretionDiskVertexShader}
          fragmentShader={accretionDiskFragmentShader}
          uniforms={diskUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          opacity={0.45}
        />
      </mesh>

      {/* ── 7. Technical Keplerian Resonance Rings ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.3, 2.315, isMobile ? 32 : 64]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.6, 3.615, isMobile ? 32 : 64]} />
        <meshBasicMaterial
          color="#818CF8"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── 8. Infalling Intelligence Data Particle Streams (AI, DATA, REASONING, AGENTS, EXECUTION) ── */}
      <InfallingIntelligenceStreams isMobile={isMobile} />
    </group>
  );
}

// GPU Vertex & Fragment Shaders for Infalling Intelligence Data Streams
const infallingVertexShader = /* glsl */ `
  attribute float aBaseR;
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aAngleOffset;

  uniform float uTime;
  uniform float uSize;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = color;
    float cycleProgress = fract(uTime * aSpeed * 0.25 + aPhase);
    float currentR = mix(aBaseR, 1.03, cycleProgress);
    float currentAngle = aAngleOffset + (1.0 / (currentR * 0.6)) * cycleProgress * 4.0;
    float currentHeight = (mod(aPhase, 0.3) - 0.15) * (currentR / 3.0);

    vec3 pos = vec3(cos(currentAngle) * currentR, currentHeight, sin(currentAngle) * currentR);
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = uSize * (220.0 / -mvPosition.z);
    vAlpha = smoothstep(0.0, 0.12, cycleProgress) * (1.0 - smoothstep(0.82, 1.0, cycleProgress));
  }
`;

const infallingFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    float soft = smoothstep(0.5, 0.08, dist);
    gl_FragColor = vec4(vColor, vAlpha * soft * 0.85);
  }
`;

// BufferGeometry Infalling Particle Streams representing Autonomous AI Ingestion (100% GPU Accelerated)
function InfallingIntelligenceStreams({ isMobile }: { isMobile: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const particleCount = isMobile ? 180 : 380;

  // Generate static attributes once - zero CPU recomputations per frame
  const { positions, colors, speeds, phases, radii, angles } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const spd = new Float32Array(particleCount);
    const phs = new Float32Array(particleCount);
    const rad = new Float32Array(particleCount);
    const ang = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const stream = INTELLIGENCE_STREAMS[i % INTELLIGENCE_STREAMS.length]!;
      const streamColor = new THREE.Color(stream.color);

      // Inward logarithmic radius between 1.15 and 4.2
      const r = 1.15 + Math.random() * 3.05;
      const angle = stream.angleOffset + Math.random() * 0.4;
      const height = (Math.random() - 0.5) * 0.35 * (r / 3.0);

      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * r;

      col[i * 3] = streamColor.r;
      col[i * 3 + 1] = streamColor.g;
      col[i * 3 + 2] = streamColor.b;

      spd[i] = stream.speed * (0.8 + Math.random() * 0.4);
      phs[i] = Math.random() * Math.PI * 2;
      rad[i] = r;
      ang[i] = angle;
    }

    return {
      positions: pos,
      colors: col,
      speeds: spd,
      phases: phs,
      radii: rad,
      angles: ang,
    };
  }, [particleCount]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: isMobile ? 0.035 : 0.045 },
    }),
    [isMobile]
  );

  // Animate solely via GPU uniform update
  useFrame(({ clock }) => {
    if (materialRef.current?.uniforms?.uTime) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aBaseR" args={[radii, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aAngleOffset" args={[angles, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={infallingVertexShader}
        fragmentShader={infallingFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
      />
    </points>
  );
}
