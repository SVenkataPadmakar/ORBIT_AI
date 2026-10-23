// apps/web/shaders/agent.frag
// Fragment shader for Agent Nodes in Scene 4 (Agent Awakening)
// Emissive core + fresnel shell with #define LOW_QUALITY variant

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

float getFresnel(vec3 normal, vec3 viewDir, float power, float bias) {
  float nDotV = clamp(dot(normal, viewDir), 0.0, 1.0);
  return clamp(bias + (1.0 - bias) * pow(1.0 - nDotV, power), 0.0, 1.0);
}

void main() {
  vec3 normal = normalize(v_normal);
  vec3 viewDir = normalize(v_view_dir);

  float nDotV = clamp(dot(normal, viewDir), 0.0, 1.0);

  // 1. Fresnel Shell
  float fresnel = 0.0;
  #if LOW_QUALITY == 1
    fresnel = 1.0 - nDotV;
  #else
    if (u_low_quality > 0.5) {
      fresnel = 1.0 - nDotV;
    } else {
      fresnel = getFresnel(normal, viewDir, 3.2, 0.05);
    }
  #endif

  // 2. Emissive Core Pulse
  float pulse = 1.0;
  if (u_reduced_motion < 0.5) {
    pulse = 0.85 + 0.15 * sin(u_time * 2.5 + dot(v_world_pos, vec3(1.0)));
  }

  float coreIntensity = pow(nDotV, 2.5) * pulse;

  // 3. Compose Colors
  vec3 coreColor = mix(u_agent_color, vec3(1.0, 1.0, 1.0), 0.45) * coreIntensity * 1.6;
  vec3 shellColor = mix(u_accent_glow, u_agent_color, 0.6) * fresnel * 2.2;
  vec3 bodyColor = vec3(0.04, 0.04, 0.07) * (1.0 - fresnel * 0.5);

  vec3 finalColor = bodyColor + coreColor + shellColor;
  float alpha = clamp(0.7 + fresnel * 0.3, 0.0, 1.0);

  gl_FragColor = vec4(finalColor, alpha);
}
