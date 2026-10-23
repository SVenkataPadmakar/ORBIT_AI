/**
 * Procedural GLSL Accretion Disk Shader for the Singularity / Black Hole Core
 * Features:
 * - Relativistic Doppler beaming (approaching side is brighter and bluer, receding side red-shifted)
 * - Fractal Brownian Motion (FBM) swirling noise with differential Keplerian rotation
 * - Event horizon shadow mask with razor-sharp photon ring bloom
 */

export const accretionDiskVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const accretionDiskFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorInner;
  uniform vec3 uColorMid;
  uniform vec3 uColorOuter;
  uniform float uInnerRadius;
  uniform float uOuterRadius;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  // 2D Hash function
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  // Simplex-style 2D Perlin noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // Precomputed constant rotation matrix (cos(0.5) ~ 0.87758256, sin(0.5) ~ 0.47942554)
  const mat2 ROT_FBM = mat2(0.87758256, 0.47942554, -0.47942554, 0.87758256);

  // Optimized Fractal Brownian Motion (3 octaves for high fragment throughput)
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; ++i) {
      v += a * noise(p);
      p = ROT_FBM * p * 2.0 + vec2(100.0);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Map UVs to centered radial coordinates [-1, 1]
    vec2 pos = (vUv - 0.5) * 2.0;
    float r = length(pos);
    float angle = atan(pos.y, pos.x);

    // Discard outside accretion boundary early
    if (r < uInnerRadius * 0.85 || r > uOuterRadius) {
      discard;
    }

    // Normalized radial progress between inner and outer ring
    float normR = clamp((r - uInnerRadius) / (uOuterRadius - uInnerRadius), 0.0, 1.0);

    // Keplerian rotation speed falls off with radius: omega ~ r^(-1.5)
    float speed = (1.0 / pow(max(r, 0.2), 1.2)) * 0.8;
    float swirlAngle = angle + uTime * speed;

    // Swirling noise coordinates
    vec2 noiseCoord = vec2(cos(swirlAngle), sin(swirlAngle)) * (r * 3.5);
    noiseCoord += vec2(uTime * 0.2, swirlAngle * 0.8);
    float n = fbm(noiseCoord);
    float density = clamp(0.5 + 0.7 * n, 0.0, 1.0);

    // Relativistic Doppler beaming effect:
    // When disk is tilted, matter moving towards camera (left/bottom) appears brighter and hotter
    float doppler = 1.0 + 0.45 * sin(angle + 0.35);

    // Radial intensity falloff & photon ring
    // Photon ring at inner edge: sharp bright spike (hardware-friendly x*x instead of pow)
    float dRing = (r - uInnerRadius) * 28.0;
    float photonRing = exp(-dRing * dRing) * 2.4;
    
    // Main body bell-curve envelope
    float diskEnvelope = sin(normR * 3.14159265);
    diskEnvelope = pow(diskEnvelope, 0.8);

    // Color gradient interpolation
    vec3 col = mix(uColorInner, uColorMid, smoothstep(0.0, 0.45, normR));
    col = mix(col, uColorOuter, smoothstep(0.45, 1.0, normR));

    // Shift towards blue on approaching side
    col += vec3(0.05, 0.1, 0.25) * max(0.0, doppler - 1.0);

    // Total emitted luminance
    float intensity = (diskEnvelope * density + photonRing) * doppler;

    // Alpha with smooth edge transition
    float alpha = smoothstep(uInnerRadius * 0.88, uInnerRadius, r) *
                  (1.0 - smoothstep(uOuterRadius * 0.8, uOuterRadius, r)) *
                  density * 1.5;
    alpha = clamp(alpha, 0.0, 0.95);

    gl_FragColor = vec4(col * intensity, alpha);
  }
`;
