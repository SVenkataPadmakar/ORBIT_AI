/**
 * SCENE 4: AGENT AWAKENING — AGENT FRAGMENT SHADER
 * Emissive core + Fresnel shell with #define LOW_QUALITY variant.
 * Section 6 & 10 of .antigravity/rules.md
 */
import { fresnelGLSL } from "./lib/fresnel.glsl";

export const agentFragmentShader = /* glsl */ `
#define LOW_QUALITY 0

// Global Uniforms per Section 10
uniform float u_time;             // Animation time
uniform float u_scroll;           // Scene normalized scroll progress (0..1)
uniform vec3 u_accent;            // Orbit violet (#7C5CFF)
uniform vec3 u_accent_glow;       // Glow violet (#A48BFF)
uniform vec3 u_agent_color;       // Per-agent distinct tint
uniform float u_reduced_motion;   // Motion reduction flag
uniform float u_low_quality;      // Dynamic low quality switch

// Varyings from Vertex Shader
varying vec3 v_normal;
varying vec3 v_view_dir;
varying vec3 v_world_pos;
varying vec2 v_uv;

${fresnelGLSL}

void main() {
  vec3 normal = normalize(v_normal);
  vec3 viewDir = normalize(v_view_dir);

  // Normal dot View Direction for core/rim calculation
  float nDotV = clamp(dot(normal, viewDir), 0.0, 1.0);

  // 1. Fresnel Shell Calculation
  float fresnel = 0.0;
  #if LOW_QUALITY == 1
    // Simplified linear edge calculation for mobile fill-rate conservation
    fresnel = 1.0 - nDotV;
  #else
    if (u_low_quality > 0.5) {
      fresnel = 1.0 - nDotV;
    } else {
      fresnel = getFresnel(normal, viewDir, 3.2, 0.05);
    }
  #endif

  // 2. Emissive Core Pulse (Subtle 3s heartbeat/awakening breathing)
  float pulse = 1.0;
  if (u_reduced_motion < 0.5) {
    pulse = 0.85 + 0.15 * sin(u_time * 2.5 + dot(v_world_pos, vec3(1.0)));
  }

  // Core brightness: highest at center (nDotV close to 1)
  float coreIntensity = pow(nDotV, 2.5) * pulse;

  // 3. Compose Colors
  // Core is intense white-tinted agent color
  vec3 coreColor = mix(u_agent_color, vec3(1.0, 1.0, 1.0), 0.45) * coreIntensity * 1.6;

  // Shell is vibrant fresnel rim in accent glow + agent tint
  vec3 shellColor = mix(u_accent_glow, u_agent_color, 0.6) * fresnel * 2.2;

  // Deep dark ambient body so geometry maintains form in space
  vec3 bodyColor = vec3(0.04, 0.04, 0.07) * (1.0 - fresnel * 0.5);

  vec3 finalColor = bodyColor + coreColor + shellColor;

  // Emissive bloom boost: edges and hot core glow into post-processing threshold
  float alpha = clamp(0.7 + fresnel * 0.3, 0.0, 1.0);

  gl_FragColor = vec4(finalColor, alpha);
}
`;
