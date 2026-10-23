/**
 * SCENE 2: VALIDATION ORBIT — RINGS VERTEX SHADER
 * Instanced torus rings with per-instance orientation and outward radial pulse.
 */
import { rotationGLSL } from "./lib/rotation.glsl";

export const ringsVertexShader = /* glsl */ `
// Global Uniforms
uniform float u_time;             // Elapsed animation time in seconds
uniform float u_scroll;           // Normalized scene scroll progress (0.0 to 1.0)
uniform float u_reduced_motion;   // 1.0 if reduced motion enabled, 0.0 otherwise
uniform float u_low_quality;      // 1.0 on mobile / Tier C, 0.0 on Tier A

// Instance Attributes (custom or standard)
attribute float a_ringIndex;      // 0.0 = inner, 1.0 = mid, 2.0 = outer

// Varyings to Fragment Shader
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vPosition;
varying vec2 vUv;
varying float vRingIndex;
varying float vPulse;

${rotationGLSL}

void main() {
  vUv = uv;
  vRingIndex = a_ringIndex;

  // Calculate per-instance slow counter-rotation
  float rotDir = (a_ringIndex == 1.0) ? -1.0 : 1.0;
  float rotSpeed = (0.2 + a_ringIndex * 0.08) * rotDir;
  float rotAngle = (u_reduced_motion > 0.5) ? 0.0 : u_time * rotSpeed;

  // Local torus rotation
  mat2 r = rotate2D(rotAngle);
  vec3 pos = position;
  pos.xz = r * pos.xz;

  // Center-outward radial pulse wave every 3 seconds (speed = 2pi / 3s ≈ 2.094)
  float pulseCycle = mod(u_time, 3.0) / 3.0; // 0.0 to 1.0
  float ringDist = (a_ringIndex + 1.0) / 3.0; // 0.33, 0.66, 1.0
  float pulseDist = abs(pulseCycle - ringDist);
  float pulseIntensity = smoothstep(0.2, 0.0, pulseDist);
  vPulse = (u_reduced_motion > 0.5) ? 0.2 : pulseIntensity;

  // Slight breathing expansion on pulse
  pos += normal * (vPulse * 0.015);

  // Transform using Three.js instanced mesh matrix
  #ifdef USE_INSTANCING
    vec4 worldPos = instanceMatrix * vec4(pos, 1.0);
    vNormal = normalize(mat3(instanceMatrix) * normal);
  #else
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vNormal = normalize(normalMatrix * normal);
  #endif

  vPosition = worldPos.xyz;
  vViewDir = normalize(cameraPosition - worldPos.xyz);

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;
