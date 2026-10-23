/**
 * SCENE 6: ORBIT CORE — 3D EXTRUDED WORDMARK FRAGMENT SHADER
 * Emissive core + frosted glass overlay + #define LOW_QUALITY
 * Section 6 & 10 of .antigravity/rules.md
 */

export const wordmarkFragmentShader = /* glsl */ `
#define LOW_QUALITY 0

uniform float u_time;
uniform float u_scroll;
uniform float u_opacity;
uniform float u_low_quality;

varying vec3 v_normal;
varying vec3 v_viewDir;
varying vec3 v_worldPos;

void main() {
  vec3 normal = normalize(v_normal);
  vec3 viewDir = normalize(v_viewDir);

  // Overhead dramatic key light direction
  vec3 keyLightDir = normalize(vec3(0.0, 1.0, 0.4));
  // Cool rim light direction (from behind/below)
  vec3 rimLightDir = normalize(vec3(0.0, -0.6, -1.0));

  // Diffuse terms
  float keyNdotL = max(dot(normal, keyLightDir), 0.0);
  float rimNdotL = max(dot(normal, rimLightDir), 0.0);

  // Emissive core base colors
  vec3 baseVoid = vec3(0.03, 0.03, 0.05);           // Deep obsidian surface
  vec3 accentViolet = vec3(0.486, 0.361, 1.0);     // #7C5CFF Orbit violet
  vec3 accentGlow = vec3(0.643, 0.545, 1.0);       // #A48BFF
  vec3 primaryText = vec3(0.93, 0.93, 0.95);       // #EDEDF2

  // Emissive bevel/rim fresnel
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.8);

  #if LOW_QUALITY == 1
    // Simplified lighting for mobile fill-rate
    float spec = pow(max(dot(reflect(-keyLightDir, normal), viewDir), 0.0), 16.0);
    vec3 emissive = mix(baseVoid, accentViolet, fresnel * 0.85);
    vec3 color = emissive + primaryText * (keyNdotL * 0.3 + spec * 0.4);
  #else
    // Frosted glass overlay: micro-facet blur emulation + chromatic transmission
    vec3 halfVec = normalize(keyLightDir + viewDir);
    float spec = pow(max(dot(normal, halfVec), 0.0), 32.0);

    // Frosted glass subsurface translucency
    float frostedScatter = smoothstep(0.0, 1.0, keyNdotL * 0.6 + 0.4);

    // Emissive rim glow concentrated at edges
    vec3 emissive = mix(baseVoid, accentGlow, fresnel);
    emissive += accentViolet * (0.35 + 0.25 * sin(u_time * 1.5 + v_worldPos.x * 2.0));

    // Combine diffuse, frosted scatter, emissive edges, and specular sheen
    vec3 color = emissive * 0.8 + primaryText * (keyNdotL * 0.4 + frostedScatter * 0.25) + vec3(1.0) * (spec * 0.7);
    color += rimNdotL * accentViolet * 0.4;
  #endif

  // Fade term as brand fades to surface product UI (scroll > 0.65)
  float alpha = u_opacity;

  gl_FragColor = vec4(color, alpha);
}
`;
