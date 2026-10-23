/**
 * SCENE 5: STARTUP GALAXY — PARTICLES FRAGMENT SHADER
 * Soft radial particle bloom with per-particle cluster hue and #define LOW_QUALITY variant.
 * Section 6 & 10 of .antigravity/rules.md
 */

export const particlesFragmentShader = /* glsl */ `
#define LOW_QUALITY 0

uniform float u_time;
uniform float u_scroll;
uniform float u_low_quality;

varying vec3 v_color;
varying float v_alpha;
varying float v_cluster;

void main() {
  // Convert gl_PointCoord to center origin [-0.5, 0.5]
  vec2 coord = gl_PointCoord - vec2(0.5);
  float distSq = dot(coord, coord);

  // Soft circle cutoff
  if (distSq > 0.25) {
    discard;
  }

  float dist = sqrt(distSq) * 2.0; // 0.0 at center, 1.0 at edge

  #if LOW_QUALITY == 1
    // Linear falloff for mobile fill-rate conservation
    float intensity = 1.0 - dist;
  #else
    float intensity = 0.0;
    if (u_low_quality > 0.5) {
      intensity = 1.0 - dist;
    } else {
      // Exponential falloff with hot emissive nucleus
      intensity = exp(-dist * 3.2);
    }
  #endif

  // Bright core highlight blending into subtle cluster hue
  vec3 coreColor = mix(v_color, vec3(1.0, 1.0, 1.0), 0.45);
  vec3 finalColor = mix(v_color, coreColor, pow(intensity, 2.0));

  // Additive bloom peak intensity
  float alpha = clamp(intensity * v_alpha, 0.0, 1.0);

  gl_FragColor = vec4(finalColor * (1.2 + 0.4 * intensity), alpha);
}
`;
