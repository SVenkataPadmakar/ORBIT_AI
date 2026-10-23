// apps/web/shaders/particles.frag
// Soft radial particle bloom with per-particle cluster hue
#define LOW_QUALITY 0

uniform float u_time;
uniform float u_scroll;
uniform float u_low_quality;

varying vec3 v_color;
varying float v_alpha;
varying float v_cluster;

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
      intensity = exp(-dist * 3.2);
    }
  #endif

  vec3 coreColor = mix(v_color, vec3(1.0, 1.0, 1.0), 0.45);
  vec3 finalColor = mix(v_color, coreColor, pow(intensity, 2.0));

  float alpha = clamp(intensity * v_alpha, 0.0, 1.0);

  gl_FragColor = vec4(finalColor * (1.2 + 0.4 * intensity), alpha);
}
