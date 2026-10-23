// apps/web/shaders/implosion.frag
// Scene 6: Orbit Core — Particles implosion fragment shader
// Section 6 & Section 10 of .antigravity/rules.md
#define LOW_QUALITY 0

uniform float u_time;
uniform float u_scroll;
uniform float u_low_quality;

varying vec3 v_color;
varying float v_alpha;
varying float v_implode;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float distSq = dot(coord, coord);

  if (distSq > 0.25) {
    discard;
  }

  float dist = sqrt(distSq) * 2.0;

  #if LOW_QUALITY == 1
    float intensity = 1.0 - dist;
  #else
    float intensity = 0.0;
    if (u_low_quality > 0.5) {
      intensity = 1.0 - dist;
    } else {
      intensity = exp(-dist * 3.4);
    }
  #endif

  // Peak flash at singularity (s ~ 0.45 - 0.50) turns particles towards hot core white
  float coreFlash = smoothstep(0.36, 0.48, u_scroll) * (1.0 - smoothstep(0.48, 0.62, u_scroll));
  vec3 hotWhite = vec3(1.0, 1.0, 1.0);
  vec3 colorWithCore = mix(v_color, hotWhite, 0.4 + 0.6 * coreFlash);

  vec3 finalColor = mix(v_color, colorWithCore, pow(intensity, 1.8));
  float alpha = clamp(intensity * v_alpha, 0.0, 1.0);

  gl_FragColor = vec4(finalColor * (1.2 + 0.8 * coreFlash), alpha);
}
