/**
 * SCENE 1: THE SPARK — FRAGMENT SHADER
 * Emissive core + Fresnel edge glow in Orbit violet (#7C5CFF)
 */
import { fresnelGLSL } from "./lib/fresnel.glsl";

export const sparkFragmentShader = /* glsl */ `
uniform float u_time;
uniform float u_scroll;
uniform vec3 u_accent;
uniform vec3 u_accent_glow;
uniform float u_reduced_motion;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vPosition;
varying float vNoise;

${fresnelGLSL}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewDir);

  // Fresnel rim calculation
  float fresnel = getFresnel(normal, viewDir, 2.5, 0.15);

  // Subtle core intensity pulse
  float pulse = u_reduced_motion > 0.5 ? 1.0 : 0.95 + 0.05 * sin(u_time * 1.047); // 6s cycle

  // Mix emissive base with rim glow
  vec3 color = mix(u_accent, u_accent_glow, fresnel);
  color *= (1.0 + fresnel * 1.5) * pulse;

  // Add subtle surface noise variation
  color += vec3(vNoise * 2.0);

  gl_FragColor = vec4(color, 1.0);
}
`;
