// apps/frontend/components/landing/scenes/Scene4Agents.tsx
// Scene 4: Agent Awakening (Section 6 & 10 of .antigravity/rules.md)
// S3 monolith fragments into exactly 7 agent nodes orbiting the core.
// Agents: Market, Product, Architect, Sprint, Launch, Growth, Investor
// World-space monospace sprites, additive screen-space trails, max 7 point lights.

"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { agentVertexShader } from "@/shaders/agent.vert";
import { agentFragmentShader } from "@/shaders/agent.frag";

interface Scene4AgentsProps {
  scrollProgress: number;
  prefersReducedMotion?: boolean;
  tier?: "TIER_A" | "TIER_B" | "TIER_C";
}

// Exactly 7 Agents per specification (Section 6 & user prompt)
interface AgentConfig {
  name: string;
  color: string;
  threeColor: THREE.Color;
  monolithOrigin: [number, number, number];
  orbitRadius: number;
  orbitEccentricity: number;
  inclination: [number, number, number]; // Rotation angles for orbit plane
  speed: number;
  phase: number;
}

const TWO_PI = Math.PI * 2;

const AGENTS_DATA: AgentConfig[] = [
  {
    name: "Market",
    color: "#4ADE80",
    threeColor: new THREE.Color("#4ADE80"),
    monolithOrigin: [-0.15, 0.45, 0.12],
    orbitRadius: 1.15,
    orbitEccentricity: 0.90,
    inclination: [0.35, 0.20, -0.15],
    speed: 0.95,
    phase: (0 / 7) * TWO_PI,
  },
  {
    name: "Product",
    color: "#A48BFF",
    threeColor: new THREE.Color("#A48BFF"),
    monolithOrigin: [0.16, 0.32, -0.14],
    orbitRadius: 1.35,
    orbitEccentricity: 0.92,
    inclination: [-0.38, 0.45, 0.20],
    speed: 0.85,
    phase: (1 / 7) * TWO_PI,
  },
  {
    name: "Architect",
    color: "#818CF8",
    threeColor: new THREE.Color("#818CF8"),
    monolithOrigin: [-0.14, 0.10, -0.16],
    orbitRadius: 1.55,
    orbitEccentricity: 0.88,
    inclination: [0.45, -0.30, 0.35],
    speed: 0.75,
    phase: (2 / 7) * TWO_PI,
  },
  {
    name: "Sprint",
    color: "#38BDF8",
    threeColor: new THREE.Color("#38BDF8"),
    monolithOrigin: [0.18, -0.10, 0.15],
    orbitRadius: 1.75,
    orbitEccentricity: 0.91,
    inclination: [-0.25, 0.50, -0.28],
    speed: 0.90,
    phase: (3 / 7) * TWO_PI,
  },
  {
    name: "Launch",
    color: "#F472B6",
    threeColor: new THREE.Color("#F472B6"),
    monolithOrigin: [-0.16, -0.28, 0.12],
    orbitRadius: 1.95,
    orbitEccentricity: 0.87,
    inclination: [0.40, 0.32, -0.45],
    speed: 0.70,
    phase: (4 / 7) * TWO_PI,
  },
  {
    name: "Growth",
    color: "#34D399",
    threeColor: new THREE.Color("#34D399"),
    monolithOrigin: [0.14, -0.44, -0.10],
    orbitRadius: 2.15,
    orbitEccentricity: 0.93,
    inclination: [-0.30, -0.40, 0.25],
    speed: 0.65,
    phase: (5 / 7) * TWO_PI,
  },
  {
    name: "Investor",
    color: "#FBBF24",
    threeColor: new THREE.Color("#FBBF24"),
    monolithOrigin: [-0.10, -0.58, 0.18],
    orbitRadius: 2.35,
    orbitEccentricity: 0.89,
    inclination: [0.50, 0.15, 0.20],
    speed: 0.60,
    phase: (6 / 7) * TWO_PI,
  },
];

const MAX_TRAIL_POINTS_PER_AGENT = 200; // Hard budget: 7 x 200 = 1400 points
const MOBILE_TRAIL_POINTS = 30; // Truncated on mobile to conserve fill-rate

/**
 * Creates an offline, crisp monospace canvas sprite texture for an agent label
 */
function createMonospaceLabelTexture(text: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 256, 64);
    ctx.font = "600 22px 'Geist Mono', Consolas, Menlo, Monaco, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Ambient glow behind text
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = "#EDEDF2";
    ctx.letterSpacing = "2px";
    ctx.fillText(text.toUpperCase(), 128, 32);

    // Second crisp pass for contrast
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(text.toUpperCase(), 128, 32);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

/**
 * Creates soft circular particle texture for additive trail points
 */
function createTrailParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    gradient.addColorStop(0.3, "rgba(220, 200, 255, 0.85)");
    gradient.addColorStop(0.7, "rgba(124, 92, 255, 0.3)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Computes 3D position of an agent at time t and scroll progress
 */
function computeAgentPosition(agent: AgentConfig, t: number, scrollProgress: number, prefersReducedMotion: boolean): THREE.Vector3 {
  const fragT = Math.min(Math.max(scrollProgress / 0.35, 0), 1);
  const easeOutFrag = 1 - Math.pow(1 - fragT, 3);

  const orbitSpeed = prefersReducedMotion ? 0.05 : agent.speed;
  const angle = t * orbitSpeed + agent.phase;

  const ex = Math.cos(angle) * agent.orbitRadius;
  const ey = Math.sin(angle) * (agent.orbitRadius * agent.orbitEccentricity);

  const pos3D = new THREE.Vector3(ex, ey, 0);
  const euler = new THREE.Euler(
    agent.inclination[0],
    agent.inclination[1],
    agent.inclination[2]
  );
  pos3D.applyEuler(euler);

  const origin = new THREE.Vector3(...agent.monolithOrigin);
  return new THREE.Vector3().lerpVectors(origin, pos3D, easeOutFrag);
}

export function Scene4Agents({
  scrollProgress,
  prefersReducedMotion = false,
  tier = "TIER_A",
}: Scene4AgentsProps) {
  const timeRef = useRef(0);

  // Points per agent based on device tier (mobile: disable long trails)
  const trailPointsCount = useMemo(() => {
    if (tier === "TIER_C") return 0;
    if (tier === "TIER_B") return MOBILE_TRAIL_POINTS;
    return MAX_TRAIL_POINTS_PER_AGENT;
  }, [tier]);

  const totalTrailParticles = 7 * trailPointsCount;

  // History ring buffers for trails
  const trailHistory = useRef<THREE.Vector3[][]>(
    Array.from({ length: 7 }, () => [])
  );

  // Agent nodes direct transforms & lights
  const agentMeshes = useRef<(THREE.Group | null)[]>([]);
  const agentLights = useRef<(THREE.PointLight | null)[]>([]);
  const labelSprites = useRef<(THREE.Sprite | null)[]>([]);

  // Particle texture for trails
  const trailTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    return createTrailParticleTexture();
  }, []);

  // World-space monospace sprite textures
  const labelTextures = useMemo(() => {
    if (typeof document === "undefined") return [];
    return AGENTS_DATA.map((agent) =>
      createMonospaceLabelTexture(agent.name, agent.color)
    );
  }, []);

  // Shader Materials for the 7 Agent Nodes (Emissive core + Fresnel shell)
  const shaderMaterials = useMemo(() => {
    return AGENTS_DATA.map((agent) => {
      return new THREE.ShaderMaterial({
        vertexShader: agentVertexShader,
        fragmentShader: agentFragmentShader,
        uniforms: {
          u_time: { value: 0 },
          u_scroll: { value: scrollProgress },
          u_accent: { value: new THREE.Color("#7C5CFF") },
          u_accent_glow: { value: new THREE.Color("#A48BFF") },
          u_agent_color: { value: agent.threeColor },
          u_reduced_motion: { value: prefersReducedMotion ? 1.0 : 0.0 },
          u_low_quality: { value: tier === "TIER_C" ? 1.0 : 0.0 },
        },
        transparent: true,
        depthWrite: true,
      });
    });
  }, [scrollProgress, prefersReducedMotion, tier]);

  // Trail buffer geometry & attributes
  const trailGeoRef = useRef<THREE.BufferGeometry>(null);
  const trailPositions = useMemo(
    () => new Float32Array(Math.max(totalTrailParticles, 1) * 3),
    [totalTrailParticles]
  );
  const trailColors = useMemo(
    () => new Float32Array(Math.max(totalTrailParticles, 1) * 3),
    [totalTrailParticles]
  );
  const trailAlphas = useMemo(
    () => new Float32Array(Math.max(totalTrailParticles, 1)),
    [totalTrailParticles]
  );

  // Pre-seed trail history along backwards orbital trajectory
  useEffect(() => {
    if (trailPointsCount <= 0) return;
    const initialT = 0;
    AGENTS_DATA.forEach((agent, i) => {
      const history: THREE.Vector3[] = [];
      const dt = 0.02;
      for (let p = 0; p < trailPointsCount; p++) {
        const histTime = initialT - p * dt;
        history.push(computeAgentPosition(agent, histTime, scrollProgress, prefersReducedMotion));
      }
      trailHistory.current[i] = history;
    });
  }, [trailPointsCount, scrollProgress, prefersReducedMotion]);

  // Pre-generate orbital wire guides for visual architectural elegance
  const orbitalGuideGeometries = useMemo(() => {
    return AGENTS_DATA.map((agent) => {
      const curve = new THREE.EllipseCurve(
        0,
        0,
        agent.orbitRadius,
        agent.orbitRadius * agent.orbitEccentricity,
        0,
        2 * Math.PI,
        false,
        0
      );
      const points = curve.getPoints(64);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      // Rotate geometry into 3D inclined orbital plane
      const euler = new THREE.Euler(
        agent.inclination[0],
        agent.inclination[1],
        agent.inclination[2]
      );
      const rotMatrix = new THREE.Matrix4().makeRotationFromEuler(euler);
      geo.applyMatrix4(rotMatrix);
      return geo;
    });
  }, []);

  // Update uniforms when scroll progress changes
  useEffect(() => {
    shaderMaterials.forEach((mat) => {
      if (mat.uniforms.u_scroll) {
        mat.uniforms.u_scroll.value = scrollProgress;
      }
      if (mat.uniforms.u_reduced_motion) {
        mat.uniforms.u_reduced_motion.value = prefersReducedMotion ? 1.0 : 0.0;
      }
    });
  }, [scrollProgress, prefersReducedMotion, shaderMaterials]);

  // Main animation loop
  useFrame((_, delta) => {
    if (!prefersReducedMotion) {
      timeRef.current += delta;
    }
    const t = timeRef.current;

    const fragT = Math.min(Math.max(scrollProgress / 0.35, 0), 1);
    const easeOutFrag = 1 - Math.pow(1 - fragT, 3);

    // Update time uniform in shaders
    shaderMaterials.forEach((mat) => {
      if (mat.uniforms.u_time) {
        mat.uniforms.u_time.value = t;
      }
    });

    let particleIdx = 0;

    // Compute 3D position for each agent
    AGENTS_DATA.forEach((agent, i) => {
      const meshGroup = agentMeshes.current[i];
      const light = agentLights.current[i];
      const sprite = labelSprites.current[i];

      const currentPos = computeAgentPosition(agent, t, scrollProgress, prefersReducedMotion);

      if (meshGroup) {
        meshGroup.position.copy(currentPos);
      }

      // Position the agent's dedicated point light (exactly 7 lights total)
      if (light) {
        light.position.copy(currentPos);
      }

      // Position the world-space monospace label sprite upright above the agent node
      if (sprite) {
        sprite.position.set(currentPos.x, currentPos.y + 0.22, currentPos.z);
      }

      // Add to trail history
      if (trailPointsCount > 0) {
        const history = trailHistory.current[i];
        if (history) {
          // Prepend latest position
          history.unshift(currentPos.clone());
          if (history.length > trailPointsCount) {
            history.pop();
          }

          // Populate buffer attributes
          for (let p = 0; p < trailPointsCount; p++) {
            const bufIdx = particleIdx + p;
            const pt = history[p];
            if (pt) {
              trailPositions[bufIdx * 3] = pt.x;
              trailPositions[bufIdx * 3 + 1] = pt.y;
              trailPositions[bufIdx * 3 + 2] = pt.z;

              // Color matches agent
              trailColors[bufIdx * 3] = agent.threeColor.r;
              trailColors[bufIdx * 3 + 1] = agent.threeColor.g;
              trailColors[bufIdx * 3 + 2] = agent.threeColor.b;

              // Alpha fades along tail and scales with fragmentation
              const life = 1 - p / trailPointsCount;
              trailAlphas[bufIdx] = life * life * 0.85 * (0.2 + 0.8 * easeOutFrag);
            } else {
              trailPositions[bufIdx * 3] = currentPos.x;
              trailPositions[bufIdx * 3 + 1] = currentPos.y;
              trailPositions[bufIdx * 3 + 2] = currentPos.z;
              trailAlphas[bufIdx] = 0;
            }
          }
          particleIdx += trailPointsCount;
        }
      }
    });

    // Update trail geometry buffer
    if (trailGeoRef.current && trailPointsCount > 0) {
      const posAttr = trailGeoRef.current.getAttribute("position");
      const colAttr = trailGeoRef.current.getAttribute("color");
      const alphaAttr = trailGeoRef.current.getAttribute("alpha");
      if (posAttr) posAttr.needsUpdate = true;
      if (colAttr) colAttr.needsUpdate = true;
      if (alphaAttr) alphaAttr.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ─── CENTRAL CORE NEXUS (S3 Monolith Residue) ──────────────────────── */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshBasicMaterial
          color="#EDEDF2"
          transparent
          opacity={0.35 * (1 - scrollProgress * 0.5)}
        />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#7C5CFF" />
      </mesh>

      {/* ─── 7 ORBITAL WIRE GUIDES ────────────────────────────────────────── */}
      {orbitalGuideGeometries.map((geo, i) => (
        <lineLoop key={i} geometry={geo}>
          <lineBasicMaterial
            color="#7C5CFF"
            transparent
            opacity={0.16}
            depthWrite={false}
          />
        </lineLoop>
      ))}

      {/* ─── 7 AGENT NODES (EXACT LABELS, NO CARDS, NO ICONS) ─────────────── */}
      {AGENTS_DATA.map((agent, i) => {
        const mat = shaderMaterials[i];

        return (
          <group
            key={agent.name}
            ref={(el) => {
              agentMeshes.current[i] = el;
            }}
          >
            {/* Outer Fresnel Shell Sphere */}
            <mesh>
              <sphereGeometry args={[0.11, 24, 24]} />
              {mat && <primitive object={mat} attach="material" />}
            </mesh>

            {/* Inner White Emissive Nucleus */}
            <mesh>
              <sphereGeometry args={[0.042, 16, 16]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>

            {/* Exactly 1 Point Light per Agent Node (Max 7 Total in Scene) */}
            <pointLight
              ref={(el) => {
                agentLights.current[i] = el;
              }}
              color={agent.threeColor}
              intensity={1.5}
              distance={4.0}
              decay={2}
            />
          </group>
        );
      })}

      {/* ─── WORLD-SPACE MONOSPACE SPRITE LABELS (UPRIGHT BILLBOARDS) ─────── */}
      {labelTextures.map((tex, i) => (
        <sprite
          key={AGENTS_DATA[i]?.name ?? i}
          ref={(el) => {
            labelSprites.current[i] = el;
          }}
          scale={[0.45, 0.112, 1]}
        >
          <spriteMaterial
            map={tex}
            transparent
            depthWrite={false}
            opacity={0.92}
          />
        </sprite>
      ))}

      {/* ─── SCREEN-SPACE ADDITIVE TRAILS BUFFER ──────────────────────────── */}
      {trailPointsCount > 0 && trailTexture && (
        <points>
          <bufferGeometry ref={trailGeoRef}>
            <bufferAttribute
              attach="attributes-position"
              args={[trailPositions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[trailColors, 3]}
            />
            <bufferAttribute
              attach="attributes-alpha"
              args={[trailAlphas, 1]}
            />
          </bufferGeometry>
          {/* Custom Trail Point Material with Additive Blending */}
          <pointsMaterial
            size={0.075}
            map={trailTexture}
            vertexColors
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            sizeAttenuation
          />
        </points>
      )}
    </group>
  );
}
