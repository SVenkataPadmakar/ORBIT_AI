// apps/frontend/components/landing/scenes/Scene6Core.tsx
// Scene 6: Orbit Core — Closing Scene (Section 6 of .antigravity/rules.md)
// 1. Galaxy collapses inward (implosion, not explosion) via quaternion rotation.
// 2. Reveals the ORBIT wordmark in 3D (extruded, monospace, subtle) with emissive + frosted glass overlay.
// 3. Brand fades and a preview of the real product UI surfaces.
// 4. Cinematic overhead key light + cool rim light (≤ 4 dynamic lights total).

"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { implosionVertexShader } from "@/shaders/implosion.vert";
import { implosionFragmentShader } from "@/shaders/implosion.frag";
import { wordmarkVertexShader } from "@/shaders/wordmark.vert";
import { wordmarkFragmentShader } from "@/shaders/wordmark.frag";

interface Scene6CoreProps {
  scrollProgress: number;
  prefersReducedMotion?: boolean;
  tier?: "TIER_A" | "TIER_B" | "TIER_C";
}

// 4 cluster hues from Scene 5 for continuous cosmological transition
const CLUSTER_COLORS = [
  new THREE.Color("#38BDF8"), // Customers (azure)
  new THREE.Color("#4ADE80"), // Revenue (emerald)
  new THREE.Color("#FBBF24"), // Investors (amber)
  new THREE.Color("#A48BFF"), // Team (violet)
];

/**
 * Creates 2D geometric Shape for monospace uppercase letterforms
 * Monospace width: ~0.64, height: ~0.96
 */
function createMonospaceLetterShape(char: string): THREE.Shape {
  const shape = new THREE.Shape();

  switch (char) {
    case "O": {
      // Outer beveled rounded box
      shape.moveTo(-0.32, -0.38);
      shape.lineTo(-0.32, 0.38);
      shape.lineTo(-0.22, 0.48);
      shape.lineTo(0.22, 0.48);
      shape.lineTo(0.32, 0.38);
      shape.lineTo(0.32, -0.38);
      shape.lineTo(0.22, -0.48);
      shape.lineTo(-0.22, -0.48);
      shape.closePath();

      // Inner hole
      const hole = new THREE.Path();
      hole.moveTo(-0.16, -0.24);
      hole.lineTo(-0.16, 0.24);
      hole.lineTo(-0.08, 0.32);
      hole.lineTo(0.08, 0.32);
      hole.lineTo(0.16, 0.24);
      hole.lineTo(0.16, -0.24);
      hole.lineTo(0.08, -0.32);
      hole.lineTo(-0.08, -0.32);
      hole.closePath();
      shape.holes.push(hole);
      break;
    }
    case "R": {
      shape.moveTo(-0.32, -0.48);
      shape.lineTo(-0.32, 0.48);
      shape.lineTo(0.22, 0.48);
      shape.lineTo(0.32, 0.38);
      shape.lineTo(0.32, 0.08);
      shape.lineTo(0.22, 0.00);
      shape.lineTo(0.06, 0.00);
      shape.lineTo(0.32, -0.48);
      shape.lineTo(0.14, -0.48);
      shape.lineTo(-0.10, 0.00);
      shape.lineTo(-0.16, 0.00);
      shape.lineTo(-0.16, -0.48);
      shape.closePath();

      const hole = new THREE.Path();
      hole.moveTo(-0.16, 0.14);
      hole.lineTo(-0.16, 0.34);
      hole.lineTo(0.16, 0.34);
      hole.lineTo(0.16, 0.14);
      hole.closePath();
      shape.holes.push(hole);
      break;
    }
    case "B": {
      shape.moveTo(-0.32, -0.48);
      shape.lineTo(-0.32, 0.48);
      shape.lineTo(0.22, 0.48);
      shape.lineTo(0.32, 0.38);
      shape.lineTo(0.32, 0.06);
      shape.lineTo(0.22, 0.00);
      shape.lineTo(0.32, -0.06);
      shape.lineTo(0.32, -0.38);
      shape.lineTo(0.22, -0.48);
      shape.closePath();

      const topHole = new THREE.Path();
      topHole.moveTo(-0.16, 0.08);
      topHole.lineTo(-0.16, 0.34);
      topHole.lineTo(0.16, 0.34);
      topHole.lineTo(0.16, 0.08);
      topHole.closePath();
      shape.holes.push(topHole);

      const bottomHole = new THREE.Path();
      bottomHole.moveTo(-0.16, -0.34);
      bottomHole.lineTo(-0.16, -0.08);
      bottomHole.lineTo(0.16, -0.08);
      bottomHole.lineTo(0.16, -0.34);
      bottomHole.closePath();
      shape.holes.push(bottomHole);
      break;
    }
    case "I": {
      // Monospace serif I
      shape.moveTo(-0.28, 0.34);
      shape.lineTo(-0.28, 0.48);
      shape.lineTo(0.28, 0.48);
      shape.lineTo(0.28, 0.34);
      shape.lineTo(0.08, 0.34);
      shape.lineTo(0.08, -0.34);
      shape.lineTo(0.28, -0.34);
      shape.lineTo(0.28, -0.48);
      shape.lineTo(-0.28, -0.48);
      shape.lineTo(-0.28, -0.34);
      shape.lineTo(-0.08, -0.34);
      shape.lineTo(-0.08, 0.34);
      shape.closePath();
      break;
    }
    case "T": {
      shape.moveTo(-0.32, 0.34);
      shape.lineTo(-0.32, 0.48);
      shape.lineTo(0.32, 0.48);
      shape.lineTo(0.32, 0.34);
      shape.lineTo(0.08, 0.34);
      shape.lineTo(0.08, -0.48);
      shape.lineTo(-0.08, -0.48);
      shape.lineTo(-0.08, 0.34);
      shape.closePath();
      break;
    }
    default:
      shape.moveTo(-0.2, -0.2);
      shape.lineTo(0.2, -0.2);
      shape.lineTo(0.2, 0.2);
      shape.lineTo(-0.2, 0.2);
      shape.closePath();
  }

  return shape;
}

/**
 * Creates high-DPI canvas texture of the real product UI preview (Founder OS)
 */
function createProductUITexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Background void
    ctx.fillStyle = "#0A0A12";
    ctx.fillRect(0, 0, 1024, 640);

    // Subtle background mesh grid
    ctx.strokeStyle = "rgba(124, 92, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 640);
      ctx.stroke();
    }
    for (let y = 0; y < 640; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Window top bar
    ctx.fillStyle = "#06060A";
    ctx.fillRect(0, 0, 1024, 52);
    ctx.strokeStyle = "rgba(124, 92, 255, 0.25)";
    ctx.strokeRect(0, 0, 1024, 52);

    // Window controls
    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.arc(28, 26, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#F59E0B";
    ctx.beginPath();
    ctx.arc(48, 26, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#4ADE80";
    ctx.beginPath();
    ctx.arc(68, 26, 6, 0, Math.PI * 2);
    ctx.fill();

    // Window title
    ctx.font = "bold 16px 'Geist Mono', Consolas, monospace";
    ctx.fillStyle = "#8A8A96";
    ctx.textAlign = "left";
    ctx.fillText("ORBIT FOUNDER OS v1.0 · AUTONOMOUS WORKSPACE", 96, 32);

    // Right status
    ctx.font = "14px 'Geist Mono', Consolas, monospace";
    ctx.fillStyle = "#4ADE80";
    ctx.textAlign = "right";
    ctx.fillText("● ALL AGENTS RUNNING · 12MS", 996, 32);

    // Left Column: Operating Pipeline
    ctx.fillStyle = "rgba(18, 18, 26, 0.9)";
    ctx.fillRect(24, 76, 420, 536);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeRect(24, 76, 420, 536);

    ctx.font = "bold 15px 'Geist Mono', Consolas, monospace";
    ctx.fillStyle = "#EDEDF2";
    ctx.textAlign = "left";
    ctx.fillText("AUTONOMOUS PIPELINE", 44, 112);

    const stages = [
      { name: "1. Idea Validation", status: "VALIDATED", color: "#4ADE80" },
      { name: "2. Product PRD", status: "SYNTHESIZED", color: "#4ADE80" },
      { name: "3. Architecture Graph", status: "DEPLOYED", color: "#4ADE80" },
      { name: "4. Sprint Execution", status: "ACTIVE (18/24)", color: "#A48BFF" },
      { name: "5. Launch Readiness", status: "PRE-FLIGHT CLEAR", color: "#8A8A96" },
    ];

    stages.forEach((st, idx) => {
      const y = 148 + idx * 82;
      ctx.fillStyle = "rgba(10, 10, 18, 0.8)";
      ctx.fillRect(44, y, 380, 64);
      ctx.strokeStyle = "rgba(124, 92, 255, 0.18)";
      ctx.strokeRect(44, y, 380, 64);

      ctx.font = "14px 'Geist Mono', Consolas, monospace";
      ctx.fillStyle = "#EDEDF2";
      ctx.fillText(st.name, 60, y + 36);

      ctx.font = "bold 13px 'Geist Mono', Consolas, monospace";
      ctx.fillStyle = st.color;
      ctx.textAlign = "right";
      ctx.fillText(st.status, 404, y + 36);
      ctx.textAlign = "left";
    });

    // Right Column: Live Agent Trace
    ctx.fillStyle = "rgba(18, 18, 26, 0.9)";
    ctx.fillRect(468, 76, 532, 536);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeRect(468, 76, 532, 536);

    ctx.font = "bold 15px 'Geist Mono', Consolas, monospace";
    ctx.fillStyle = "#EDEDF2";
    ctx.fillText("LIVE AGENT EXECUTION TRACE", 488, 112);

    const traces = [
      { agent: "[14:10:02] Market Agent", msg: "Indexed competitor positioning. Moat confidence: 94%." },
      { agent: "[14:10:15] Architect Agent", msg: "Domain schemas & pgvector embedding topology mapped." },
      { agent: "[14:10:33] Sprint Agent", msg: "Initialized verification suite. Automated tests: 100% pass." },
      { agent: "[14:10:48] Launch Agent", msg: "Continuous deployment pipeline verified and primed." },
      { agent: "[14:11:00] Orbit Core", msg: "All intelligences converged. Founder OS in steady state." },
    ];

    traces.forEach((tr, idx) => {
      const y = 152 + idx * 80;
      ctx.fillStyle = "#7C5CFF";
      ctx.font = "bold 13px 'Geist Mono', Consolas, monospace";
      ctx.fillText(tr.agent, 488, y);

      ctx.fillStyle = "#8A8A96";
      ctx.font = "13px 'Geist Mono', Consolas, monospace";
      ctx.fillText(tr.msg, 488, y + 26);
    });

    // Outer subtle border
    ctx.strokeStyle = "rgba(124, 92, 255, 0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 1022, 638);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  return texture;
}

export function Scene6Core({
  scrollProgress,
  prefersReducedMotion = false,
  tier = "TIER_A",
}: Scene6CoreProps) {
  const timeRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);
  const wordmarkGroupRef = useRef<THREE.Group>(null);
  const productUIRef = useRef<THREE.Mesh>(null);

  // Exact particle budget per device tier (Section 10)
  const particleCount = useMemo(() => {
    if (tier === "TIER_C") return 5_000;
    if (tier === "TIER_B") return 30_000;
    return 80_000; // Tier A: 80k particles for implosion
  }, [tier]);

  // Real product UI canvas texture
  const productTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    return createProductUITexture();
  }, []);

  // Wordmark extruded letter geometries
  const letterGeometries = useMemo(() => {
    const letters = ["O", "R", "B", "I", "T"];
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.02,
      bevelSegments: tier === "TIER_C" ? 1 : 2,
    };

    return letters.map((char) => {
      const shape = createMonospaceLetterShape(char);
      const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geom.center(); // Center local pivot
      return { char, geom };
    });
  }, [tier]);

  // Implosion particle buffers
  const { geometry: particlesGeom, material: particlesMat } = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const initialPos = new Float32Array(particleCount * 3);
    const orbit = new Float32Array(particleCount * 4);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const randoms = new Float32Array(particleCount * 2);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const i4 = i * 4;
      const i2 = i * 2;

      const clusterIdx = i % 4;
      const clusterColor = CLUSTER_COLORS[clusterIdx] ?? new THREE.Color("#7C5CFF");

      // Galaxy distribution matching Scene 5
      const t = i / particleCount;
      const angle = clusterIdx * (Math.PI * 0.5) + t * 4.2 + (Math.random() - 0.5) * 0.4;
      const radius = 1.3 + Math.pow(Math.random(), 0.75) * 4.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * (radius * 0.88);
      const y = (Math.random() - 0.5) * 0.65;

      initialPos[i3] = x;
      initialPos[i3 + 1] = y;
      initialPos[i3 + 2] = z;

      orbit[i4] = clusterIdx;
      orbit[i4 + 1] = radius;
      orbit[i4 + 2] = 0.2 + (i % 5) * 0.05; // speed
      orbit[i4 + 3] = Math.random() * Math.PI * 2.0; // phase

      colors[i3] = clusterColor.r;
      colors[i3 + 1] = clusterColor.g;
      colors[i3 + 2] = clusterColor.b;

      sizes[i] = 0.35 + Math.random() * 0.55;

      randoms[i2] = Math.random();
      randoms[i2 + 1] = Math.random();
    }

    geom.setAttribute("a_initialPos", new THREE.BufferAttribute(initialPos, 3));
    geom.setAttribute("a_orbit", new THREE.BufferAttribute(orbit, 4));
    geom.setAttribute("a_color", new THREE.BufferAttribute(colors, 3));
    geom.setAttribute("a_size", new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute("a_random", new THREE.BufferAttribute(randoms, 2));

    const mat = new THREE.ShaderMaterial({
      vertexShader: implosionVertexShader,
      fragmentShader: implosionFragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_scroll: { value: 0 },
        u_dpr: { value: typeof window !== "undefined" ? window.devicePixelRatio : 1.0 },
        u_reduced_motion: { value: prefersReducedMotion ? 1.0 : 0.0 },
        u_low_quality: { value: tier === "TIER_C" ? 1.0 : 0.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geom, material: mat };
  }, [particleCount, prefersReducedMotion, tier]);

  // Wordmark shader material
  const wordmarkMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: wordmarkVertexShader,
      fragmentShader: wordmarkFragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_scroll: { value: 0 },
        u_reveal: { value: 0 },
        u_opacity: { value: 1.0 },
        u_low_quality: { value: tier === "TIER_C" ? 1.0 : 0.0 },
      },
      transparent: true,
      depthWrite: true,
    });
  }, [tier]);

  // Clean disposal on unmount
  useEffect(() => {
    return () => {
      particlesGeom.dispose();
      particlesMat.dispose();
      wordmarkMat.dispose();
      letterGeometries.forEach((lg) => lg.geom.dispose());
      productTexture?.dispose();
    };
  }, [particlesGeom, particlesMat, wordmarkMat, letterGeometries, productTexture]);

  useFrame((state, delta) => {
    timeRef.current += delta;
    const scroll = THREE.MathUtils.clamp(scrollProgress, 0.0, 1.0);

    // Update particles shader uniforms
    if (particlesMat.uniforms.u_time) {
      particlesMat.uniforms.u_time.value = timeRef.current;
    }
    if (particlesMat.uniforms.u_scroll) {
      particlesMat.uniforms.u_scroll.value = scroll;
    }

    // Update wordmark shader uniforms
    if (wordmarkMat.uniforms.u_time) {
      wordmarkMat.uniforms.u_time.value = timeRef.current;
    }
    if (wordmarkMat.uniforms.u_scroll) {
      wordmarkMat.uniforms.u_scroll.value = scroll;
    }

    // Wordmark reveal mechanics:
    // Scroll 0.00 -> 0.35: hidden during implosion (scale = 0)
    // Scroll 0.35 -> 0.65: emerges at center, scales to 1.0 with subtle float
    // Scroll 0.65 -> 0.95: brand fades (opacity 1.0 -> 0.0, scale recedes)
    if (wordmarkGroupRef.current) {
      if (scroll < 0.32) {
        wordmarkGroupRef.current.scale.set(0, 0, 0);
        if (wordmarkMat.uniforms.u_opacity) {
          wordmarkMat.uniforms.u_opacity.value = 0.0;
        }
      } else if (scroll <= 0.65) {
        const emergeT = THREE.MathUtils.smoothstep(scroll, 0.32, 0.58);
        const scaleVal = emergeT * (prefersReducedMotion ? 1.0 : 1.0 + Math.sin(timeRef.current * 1.5) * 0.02);
        wordmarkGroupRef.current.scale.set(scaleVal, scaleVal, scaleVal);
        wordmarkGroupRef.current.position.y = 0.15 + (prefersReducedMotion ? 0 : Math.sin(timeRef.current * 1.2) * 0.04);
        if (wordmarkMat.uniforms.u_opacity) {
          wordmarkMat.uniforms.u_opacity.value = emergeT;
        }
      } else {
        // Brand fades out as product UI surfaces
        const fadeT = THREE.MathUtils.smoothstep(scroll, 0.65, 0.92);
        const opacity = Math.max(1.0 - fadeT, 0.0);
        const recedeScale = 1.0 - fadeT * 0.25;
        wordmarkGroupRef.current.scale.set(recedeScale, recedeScale, recedeScale);
        wordmarkGroupRef.current.position.z = -fadeT * 1.5;
        if (wordmarkMat.uniforms.u_opacity) {
          wordmarkMat.uniforms.u_opacity.value = opacity;
        }
      }
    }

    // Product UI preview mechanics:
    // Scroll 0.00 -> 0.62: hidden (opacity = 0)
    // Scroll 0.62 -> 0.95: surfaces in front of camera!
    // Scroll 0.95 -> 1.00: static, perfectly clear
    if (productUIRef.current) {
      if (scroll < 0.60) {
        productUIRef.current.scale.set(0.001, 0.001, 0.001);
        (productUIRef.current.material as THREE.MeshBasicMaterial).opacity = 0.0;
      } else {
        const surfaceT = THREE.MathUtils.smoothstep(scroll, 0.60, 0.88);
        const currentScale = THREE.MathUtils.lerp(0.82, 1.0, surfaceT);
        productUIRef.current.scale.set(currentScale, currentScale, currentScale);
        (productUIRef.current.material as THREE.MeshBasicMaterial).opacity = surfaceT;

        // Subtle floating tilt when active
        if (!prefersReducedMotion) {
          productUIRef.current.position.y = Math.sin(timeRef.current * 0.8) * 0.03;
          productUIRef.current.rotation.x = 0.05 + Math.sin(timeRef.current * 0.6) * 0.015;
        }
      }
    }
  });

  // Monospace letter spacing offsets for "ORBIT"
  const letterPositions: [number, number, number][] = [
    [-1.70, 0, 0], // O
    [-0.85, 0, 0], // R
    [0.00, 0, 0],  // B
    [0.85, 0, 0],  // I
    [1.70, 0, 0],  // T
  ];

  return (
    <group ref={groupRef}>
      {/* Cinematic Lighting Rig (Section 9: ≤ 4 dynamic lights total) */}
      {/* Overhead dramatic key light shining down on beveled 3D wordmark */}
      <directionalLight position={[0, 5.0, 2.0]} intensity={1.8} color="#EDEDF2" />
      {/* Cool rim light from behind */}
      <directionalLight position={[0, -2.0, -3.5]} intensity={0.8} color="#7C5CFF" />

      {/* Galaxy Implosion Particle Cloud */}
      <points geometry={particlesGeom} material={particlesMat} />

      {/* 3D Extruded Monospace ORBIT Wordmark */}
      <group ref={wordmarkGroupRef} position={[0, 0.15, 0]} rotation={[0.06, 0, 0]}>
        {letterGeometries.map((lg, idx) => {
          const pos = letterPositions[idx] ?? [0, 0, 0];
          return (
            <mesh
              key={lg.char + idx}
              geometry={lg.geom}
              material={wordmarkMat}
              position={pos}
            />
          );
        })}
      </group>

      {/* Real Product UI Surfaces (Floating perspective display preview) */}
      {productTexture && (
        <mesh
          ref={productUIRef}
          position={[0, 0.25, 0.0]}
          rotation={[0.04, 0, 0]}
        >
          <planeGeometry args={[3.6, 2.25]} />
          <meshBasicMaterial
            map={productTexture}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
