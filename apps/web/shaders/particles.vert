// apps/web/shaders/particles.vert
// GPU particle system (≤ 100k) with per-particle hue, size, velocity
#define LOW_QUALITY 0

uniform float u_time;
uniform float u_scroll;
uniform float u_dpr;
uniform float u_reduced_motion;
uniform float u_low_quality;

attribute vec3 a_seed;
attribute vec4 a_orbit;
attribute vec3 a_color;
attribute float a_size;
attribute vec2 a_random;

varying vec3 v_color;
varying float v_alpha;
varying float v_cluster;

void main() {
  float clusterIdx = a_orbit.x;
  float baseRadius = a_orbit.y;
  float orbitSpeed = a_orbit.z;
  float initialPhase = a_orbit.w;

  float emergeT = smoothstep(0.0, 0.45, u_scroll);
  float speed = (u_reduced_motion > 0.5) ? 0.04 : orbitSpeed;
  float angle = initialPhase + u_time * speed;
  float spiralOffset = clusterIdx * 1.570796;
  float finalAngle = angle + spiralOffset;

  float currentRadius = mix(length(a_seed.xy), baseRadius, emergeT);
  currentRadius += a_random.x * (0.2 + 0.3 * u_scroll);

  float x = cos(finalAngle) * currentRadius;
  float z = sin(finalAngle) * (currentRadius * 0.88);
  float y = a_random.y * (0.35 + 0.15 * cos(finalAngle * 2.0));

  vec3 orbitPos = vec3(x, y, z);
  vec3 currentPos = mix(a_seed, orbitPos, emergeT);

  if (u_reduced_motion < 0.5) {
    currentPos.y += sin(u_time * 1.5 + currentRadius * 3.0) * 0.06;
  }

  vec4 modelViewPos = modelViewMatrix * vec4(currentPos, 1.0);
  gl_Position = projectionMatrix * modelViewPos;

  float dist = -modelViewPos.z;
  float sizeMultiplier = (dist > 0.1) ? (1.0 / dist) : 1.0;

  #if LOW_QUALITY == 1
    gl_PointSize = clamp(a_size * u_dpr * sizeMultiplier * 24.0, 1.5, 6.0);
  #else
    if (u_low_quality > 0.5) {
      gl_PointSize = clamp(a_size * u_dpr * sizeMultiplier * 24.0, 1.5, 6.0);
    } else {
      gl_PointSize = clamp(a_size * u_dpr * sizeMultiplier * 36.0, 1.5, 9.0);
    }
  #endif

  v_color = a_color;
  v_cluster = clusterIdx;

  float depthFade = clamp(1.0 - (dist / 18.0), 0.15, 1.0);
  v_alpha = (0.35 + 0.65 * emergeT) * depthFade;
}
