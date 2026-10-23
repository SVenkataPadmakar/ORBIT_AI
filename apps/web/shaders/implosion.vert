// apps/web/shaders/implosion.vert
// Scene 6: Orbit Core — Particles implosion with quaternion rotation
// Section 6 & Section 10 of .antigravity/rules.md
#define LOW_QUALITY 0

uniform float u_time;             // Elapsed animation time
uniform float u_scroll;           // Scene normalized scroll progress (0..1)
uniform float u_dpr;              // Device pixel ratio (1.0..2.0)
uniform float u_reduced_motion;   // Motion reduction flag
uniform float u_low_quality;      // Dynamic low quality switch

attribute vec3 a_initialPos;      // Initial galaxy orbit position
attribute vec4 a_orbit;           // x: clusterIdx, y: radius, z: speed, w: phase
attribute vec3 a_color;           // Subtle cluster hue
attribute float a_size;           // Particle base size
attribute vec2 a_random;          // Random noise seeds

varying vec3 v_color;
varying float v_alpha;
varying float v_implode;

// Quaternion rotation: rotates vector v by quaternion q (xyz: vector part, w: scalar part)
vec3 rotateByQuat(vec3 v, vec4 q) {
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

void main() {
  float speed = a_orbit.z;
  float initialPhase = a_orbit.w;

  // Implosion progress: 0.0 -> 0.48 collapses into the center
  float implodeT = smoothstep(0.0, 0.48, u_scroll);

  // Vortex swirl axis (slightly tilted for dramatic organic spiral)
  vec3 axis = normalize(vec3(0.08, 1.0, 0.05));

  // Angular speed spikes as radius contracts (conservation of angular momentum)
  float spinRate = (u_reduced_motion > 0.5) ? 2.5 : (14.0 + a_random.x * 6.0);
  float angle = initialPhase + (u_time * speed * 0.5) + (implodeT * spinRate);

  // Half-angle quaternion setup
  float halfAngle = angle * 0.5;
  vec4 q = vec4(axis * sin(halfAngle), cos(halfAngle));

  // Rotate initial galaxy position via quaternion
  vec3 swirledPos = rotateByQuat(a_initialPos, q);

  // Non-linear suction lerp to center (0, 0, 0)
  float pullPower = 1.8;
  vec3 collapsedPos = mix(swirledPos, vec3(0.0, 0.0, 0.0), pow(implodeT, pullPower));

  // Post-implosion stardust halo (scroll > 0.48):
  // Singularity expands into a subtle ambient stardust field around the revealed wordmark
  if (u_scroll > 0.48) {
    float postT = smoothstep(0.48, 1.0, u_scroll);
    float haloRadius = 0.35 + 0.65 * postT;
    vec3 haloOffset = vec3(
      cos(angle * 2.0 + a_random.x * 6.28) * haloRadius,
      (a_random.y - 0.5) * 0.6 * haloRadius,
      sin(angle * 2.0 + a_random.y * 6.28) * haloRadius
    );
    collapsedPos += haloOffset * 0.35;
  }

  vec4 modelViewPos = modelViewMatrix * vec4(collapsedPos, 1.0);
  gl_Position = projectionMatrix * modelViewPos;

  float dist = -modelViewPos.z;
  float sizeMultiplier = (dist > 0.1) ? (1.0 / dist) : 1.0;

  // Peak flash when collapsing at the singularity core
  float flashIntensity = 1.0 + 3.0 * smoothstep(0.35, 0.48, u_scroll) * (1.0 - smoothstep(0.48, 0.65, u_scroll));

  #if LOW_QUALITY == 1
    gl_PointSize = clamp(a_size * u_dpr * sizeMultiplier * 22.0 * flashIntensity, 1.5, 6.0);
  #else
    if (u_low_quality > 0.5) {
      gl_PointSize = clamp(a_size * u_dpr * sizeMultiplier * 22.0 * flashIntensity, 1.5, 6.0);
    } else {
      gl_PointSize = clamp(a_size * u_dpr * sizeMultiplier * 34.0 * flashIntensity, 1.5, 9.0);
    }
  #endif

  v_color = a_color;
  v_implode = implodeT;

  // Attenuate alpha after wordmark fully emerges to hand over focus cleanly
  float postFade = 1.0 - smoothstep(0.60, 0.95, u_scroll) * 0.75;
  float depthFade = clamp(1.0 - (dist / 16.0), 0.2, 1.0);
  v_alpha = depthFade * postFade;
}
