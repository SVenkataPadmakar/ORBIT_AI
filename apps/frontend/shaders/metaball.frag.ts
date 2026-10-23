// apps/frontend/shaders/metaball.frag.ts
// Optimized Fragment shader for Raymarched SDF Metaballs in Scene 3 (Product Formation)
// High performance: bounding sphere early-out, hard step cap <= 48, cool key, warm rim

export const metaballFragmentShader = /* glsl */ `
#ifdef LOW_QUALITY
  #define MAX_STEPS 32
  #define HIT_EPS 0.006
#else
  #define MAX_STEPS 48
  #define HIT_EPS 0.003
#endif

#define MAX_DIST 8.0

uniform float u_time;
uniform float u_scroll;             // 0.0 to 1.0 within Scene 3
uniform float u_reduced_motion;     // 1.0 if reduced motion active
uniform float u_low_quality;
uniform vec3 u_accent;              // Orbit violet #7C5CFF
uniform vec3 u_accent_glow;         // #A48BFF
uniform vec3 u_warm_rim;            // Warm amber #F59E0B (teasing Scene 5)

varying vec3 v_local_pos;
varying vec3 v_camera_local;
varying vec3 v_world_pos;

// Smooth minimum
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Rounded box SDF for final monolith
float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

// Sphere SDF
float sdSphere(vec3 p, vec3 center, float r) {
  return length(p - center) - r;
}

// Ray-box intersection to bound marching volume
vec2 intersectBox(vec3 ro, vec3 rd, vec3 boxSize) {
  vec3 m = 1.0 / rd;
  vec3 n = m * ro;
  vec3 k = abs(m) * boxSize;
  vec3 t1 = -n - k;
  vec3 t2 = -n + k;
  float tNear = max(max(t1.x, t1.y), t1.z);
  float tFar = min(min(t2.x, t2.y), t2.z);
  if (tNear > tFar || tFar < 0.0) return vec2(-1.0);
  return vec2(max(tNear, 0.0), tFar);
}

// Scene SDF with Bounding Sphere Fast Path
float mapScene(vec3 p) {
  // Fast bounding sphere early exit: skips all 12 smin loops when outside cluster
  float r = length(p);
  if (r > 1.38) {
    return r - 1.15;
  }

  // Predefined scattered coordinates for 12 balls (chaos state)
  vec3 scattered[12];
  scattered[0]  = vec3(-0.85,  0.75,  0.35);
  scattered[1]  = vec3( 0.78,  0.65, -0.42);
  scattered[2]  = vec3(-0.65, -0.60, -0.48);
  scattered[3]  = vec3( 0.72, -0.75,  0.45);
  scattered[4]  = vec3(-0.80,  0.10, -0.60);
  scattered[5]  = vec3( 0.75,  0.15,  0.58);
  scattered[6]  = vec3( 0.12,  0.95, -0.45);
  scattered[7]  = vec3(-0.18, -0.92,  0.38);
  scattered[8]  = vec3( 0.45,  0.82,  0.50);
  scattered[9]  = vec3(-0.52, -0.78, -0.40);
  scattered[10] = vec3( 0.88, -0.22, -0.25);
  scattered[11] = vec3(-0.75,  0.45, -0.20);

  // Target grid coordinates forming the 2x3x2 monolithic block (structure state)
  vec3 targets[12];
  targets[0]  = vec3(-0.25,  0.52, -0.15);
  targets[1]  = vec3( 0.25,  0.52, -0.15);
  targets[2]  = vec3(-0.25,  0.52,  0.15);
  targets[3]  = vec3( 0.25,  0.52,  0.15);
  targets[4]  = vec3(-0.25,  0.00, -0.15);
  targets[5]  = vec3( 0.25,  0.00, -0.15);
  targets[6]  = vec3(-0.25,  0.00,  0.15);
  targets[7]  = vec3( 0.25,  0.00,  0.15);
  targets[8]  = vec3(-0.25, -0.52, -0.15);
  targets[9]  = vec3( 0.25, -0.52, -0.15);
  targets[10] = vec3(-0.25, -0.52,  0.15);
  targets[11] = vec3( 0.25, -0.52,  0.15);

  float mergeProgress = smoothstep(0.05, 0.70, u_scroll);
  float k = mix(0.40, 0.18, mergeProgress);

  float dMetaballs = 1e5;

  for (int i = 0; i < 12; i++) {
    vec3 floatOffset = vec3(0.0);
    if (u_reduced_motion < 0.5) {
      float fi = float(i);
      floatOffset = vec3(
        sin(u_time * 1.1 + fi * 1.3),
        cos(u_time * 0.9 + fi * 1.7),
        sin(u_time * 0.8 + fi * 2.1)
      ) * 0.06 * (1.0 - mergeProgress);
    }

    vec3 currentCenter = mix(scattered[i] + floatOffset, targets[i], mergeProgress);
    float ballRadius = mix(0.24, 0.21, mergeProgress);
    float dBall = sdSphere(p, currentCenter, ballRadius);

    if (i == 0) {
      dMetaballs = dBall;
    } else {
      dMetaballs = smin(dMetaballs, dBall, k);
    }
  }

  // Monolith shape: crisp rounded box
  float dMonolith = sdRoundBox(p, vec3(0.35, 0.72, 0.22), 0.08);

  // Transition from fluid organic blob into architectural monolith
  float crystallize = smoothstep(0.45, 0.88, u_scroll);
  return mix(dMetaballs, dMonolith, crystallize);
}

// Surface normal computation using tetrahedral sampling
vec3 calcNormal(vec3 p) {
  const vec2 e = vec2(0.0015, -0.0015);
  return normalize(
    e.xyy * mapScene(p + e.xyy) +
    e.yyx * mapScene(p + e.yyx) +
    e.yxy * mapScene(p + e.yxy) +
    e.xxx * mapScene(p + e.xxx)
  );
}

void main() {
  vec3 ro = v_camera_local;
  vec3 rd = normalize(v_local_pos - ro);

  // Bounding box for raymarcher (-1.5 to +1.5)
  vec2 bounds = intersectBox(ro, rd, vec3(1.5));
  if (bounds.x < 0.0) {
    discard;
  }

  float t = bounds.x;
  float tMax = bounds.y;
  bool hit = false;
  vec3 p = ro + rd * t;

  for (int i = 0; i < MAX_STEPS; i++) {
    p = ro + rd * t;
    float dist = mapScene(p);
    if (dist < HIT_EPS) {
      hit = true;
      break;
    }
    // Over-relaxation factor (1.12) accelerates ray traversal through SDF space
    t += dist * 1.12;
    if (t > tMax || t > MAX_DIST) break;
  }

  if (!hit) {
    discard;
  }

  vec3 n = calcNormal(p);

  // Lighting specification (Section 6 & 9):
  // Cool key light from upper-left (Orbit violet/slate)
  vec3 keyDir = normalize(vec3(-0.9, 1.4, 1.2));
  float keyDiff = max(dot(n, keyDir), 0.0);
  vec3 keyColor = vec3(0.72, 0.65, 0.98);

  // Warm rim light from lower-rear (amber #F59E0B teases Scene 5 galaxy)
  vec3 rimDir = normalize(vec3(1.2, -0.3, -1.6));
  float rimDiff = max(dot(n, rimDir), 0.0);

  // Fresnel edge emission
  float fresnel = pow(1.0 - max(dot(-rd, n), 0.0), 2.8);

  // Base metallic surface
  vec3 baseMat = vec3(0.09, 0.08, 0.14);
  vec3 col = baseMat + keyDiff * keyColor * 0.85 + rimDiff * u_warm_rim * 1.35;
  col += fresnel * u_accent_glow * 0.8;

  // Subtle interior breathing pulse
  float pulse = 0.5 + 0.5 * sin(u_time * 1.5);
  col += u_accent * pulse * 0.08;

  // Wireframe overlay fades in at 60% scroll (Section 6)
  float wireProgress = smoothstep(0.60, 0.85, u_scroll);
  if (wireProgress > 0.01) {
    vec3 gridCoord = abs(fract(p * 4.5 - 0.5) - 0.5) / (fwidth(p * 4.5) + 0.001);
    float gridLine = min(min(gridCoord.x, gridCoord.y), gridCoord.z);
    float isWire = 1.0 - min(gridLine, 1.0);
    // Add glowing violet wireframe lines
    col += u_accent_glow * isWire * wireProgress * 0.95;
  }

  // Soft edge vignette inside bounding box
  float edgeFade = 1.0 - smoothstep(1.15, 1.45, length(p));
  col *= edgeFade;

  gl_FragColor = vec4(col, 1.0);
}
`;
