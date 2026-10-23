/**
 * SCENE 2: VALIDATION ORBIT — RINGS FRAGMENT SHADER
 * Instanced concentric rings with signal emission wave & Fresnel rim.
 * Features a #define LOW_QUALITY variant for mobile and Tier C devices.
 */
import { fresnelGLSL } from "./lib/fresnel.glsl";

export const ringsFragmentShader = /* glsl */ `
#define LOW_QUALITY 0

// Global Uniforms
uniform float u_time;             // Elapsed animation time
uniform float u_scroll;           // Normalized scene scroll
uniform vec3 u_accent;            // Orbit violet (#7C5CFF)
uniform vec3 u_accent_glow;       // Glow violet (#A48BFF)
uniform vec3 u_signal;            // Validation green (#4ADE80)
uniform float u_reduced_motion;   // Motion reduction flag
uniform float u_low_quality;      // Dynamic low quality switch

// Varyings from Vertex Shader
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vPosition;
varying vec2 vUv;
varying float vRingIndex;
varying float vPulse;

${fresnelGLSL}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewDir);

  float fresnel = 0.0;
  #if LOW_QUALITY == 1
    // Simplified linear edge calculation for mobile fill-rate conservation
    fresnel = 1.0 - max(dot(normal, viewDir), 0.0);
  #else
    if (u_low_quality > 0.5) {
      fresnel = 1.0 - max(dot(normal, viewDir), 0.0);
    } else {
      fresnel = getFresnel(normal, viewDir, 3.0, 0.1);
    }
  #endif

  // Base metallic ring color (deep dark surface #0A0A0F tinted with accent)
  vec3 baseColor = mix(vec3(0.04, 0.04, 0.06), u_accent * 0.25, 0.35);

  // Signal pulse color: green-tinted violet pulse traveling outward
  vec3 pulseColor = mix(u_accent_glow, u_signal, 0.25);

  // Combine base with Fresnel glow and radial pulse
  vec3 color = baseColor + u_accent * (fresnel * 0.8);
  color += pulseColor * (vPulse * 1.4);

  // Subtle traveling signal along ring circumference
  if (u_reduced_motion < 0.5) {
    float wave = sin(vUv.x * 20.0 + u_time * 3.0 + vRingIndex * 1.5);
    float signalHighlight = smoothstep(0.85, 1.0, wave);
    color += u_signal * (signalHighlight * 0.6);
  }

  gl_FragColor = vec4(color, 1.0);
}
`;
