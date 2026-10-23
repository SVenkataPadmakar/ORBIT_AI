/**
 * SCENE 5: STARTUP GALAXY — PARTICLES VERTEX SHADER
 * GPU particle system (≤ 100k) with per-particle hue, size, velocity,
 * and orbital kinematics emerging from the 7 agent node seeds into 4 galaxy clusters.
 * Section 6 & 10 of .antigravity/rules.md
 */

export const particlesVertexShader = /* glsl */ `
#define LOW_QUALITY 0

// Global Uniforms per Section 10
uniform float u_time;             // Elapsed animation time
uniform float u_scroll;           // Scene normalized scroll progress (0..1)
uniform float u_dpr;              // Device pixel ratio (1.0..2.0)
uniform float u_reduced_motion;   // Motion reduction flag
uniform float u_low_quality;      // Dynamic low quality switch

// Per-particle Attributes
attribute vec3 a_seed;            // Seed origin (from agent nodes)
attribute vec4 a_orbit;           // x: clusterIdx (0..3), y: radius, z: speed, w: phase
attribute vec3 a_color;           // Cluster subtle hue
attribute float a_size;           // Particle base size
attribute vec2 a_random;          // x: dispersion noise, y: vertical jitter

// Varyings to Fragment Shader
varying vec3 v_color;
varying float v_alpha;
varying float v_cluster;

void main() {
  float clusterIdx = a_orbit.x;
  float baseRadius = a_orbit.y;
  float orbitSpeed = a_orbit.z;
  float initialPhase = a_orbit.w;

  // Emerging factor from agent seeds (scroll 0.0 -> 0.4: emerge from seeds; 0.4 -> 1.0: full galaxy expansion)
  float emergeT = smoothstep(0.0, 0.45, u_scroll);

  // Time-dependent orbital angle
  float speed = (u_reduced_motion > 0.5) ? 0.04 : orbitSpeed;
  float angle = initialPhase + u_time * speed;

  // Radial breathing and logarithmic spiral arm dispersion
  float spiralOffset = clusterIdx * 1.570796; // 4 arms separated by 90 deg (pi/2)
  float finalAngle = angle + spiralOffset;

  // Radius expands as galaxy matures with scroll
  float currentRadius = mix(length(a_seed.xy), baseRadius, emergeT);
  // Add noise dispersion
  currentRadius += a_random.x * (0.2 + 0.3 * u_scroll);

  // Orbital position in galaxy disk (XZ or XY plane)
  float x = cos(finalAngle) * currentRadius;
  float z = sin(finalAngle) * (currentRadius * 0.88); // slight elliptical compression
  float y = a_random.y * (0.35 + 0.15 * cos(finalAngle * 2.0)); // disk thickness

  vec3 orbitPos = vec3(x, y, z);

  // Blend from agent seed origin to full galaxy orbit
  vec3 currentPos = mix(a_seed, orbitPos, emergeT);

  // Additional subtle wave motion for active startup ecosystem
  if (u_reduced_motion < 0.5) {
    currentPos.y += sin(u_time * 1.5 + currentRadius * 3.0) * 0.06;
  }

  vec4 modelViewPos = modelViewMatrix * vec4(currentPos, 1.0);
  gl_Position = projectionMatrix * modelViewPos;

  // Distance attenuation for point size
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

  // Alpha fade based on distance and emergence progress
  float depthFade = clamp(1.0 - (dist / 18.0), 0.15, 1.0);
  v_alpha = (0.35 + 0.65 * emergeT) * depthFade;
}
`;
