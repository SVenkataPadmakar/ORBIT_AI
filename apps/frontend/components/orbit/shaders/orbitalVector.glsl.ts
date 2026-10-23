/**
 * Orbital Vector Shader
 * Renders glowing energy lines between celestial bodies with traveling data packets
 * Supports single-draw-call line segments with per-vertex activity
 */

export const orbitalVectorVertexShader = /* glsl */ `
  attribute float aActive;
  varying vec2 vUv;
  varying float vActive;

  void main() {
    vUv = uv;
    vActive = aActive;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const orbitalVectorFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uActiveColor;
  uniform float uSpeed;

  varying vec2 vUv;
  varying float vActive;

  void main() {
    // Continuous baseline subtle glow along the line
    float baseGlow = 0.22 + 0.15 * vActive;

    // Traveling energy pulses along UV coordinate x [0, 1]
    float speed = uSpeed * (1.0 + vActive * 1.5);
    float pulse1 = fract(vUv.x * 2.0 - uTime * speed * 0.4);
    float pulse2 = fract(vUv.x * 1.5 - uTime * speed * 0.65 + 0.5);

    // High intensity head with decaying tail
    float packet1 = pow(smoothstep(0.0, 0.9, pulse1), 3.0) * (1.0 - smoothstep(0.9, 1.0, pulse1));
    float packet2 = pow(smoothstep(0.0, 0.9, pulse2), 3.0) * (1.0 - smoothstep(0.9, 1.0, pulse2));

    float totalPulse = (packet1 + packet2 * 0.8) * (0.8 + 1.2 * vActive);

    vec3 col = mix(uColor, uActiveColor, vActive);
    vec3 finalColor = col * (baseGlow + totalPulse * 2.0);
    float alpha = clamp(baseGlow * 0.5 + totalPulse, 0.0, 0.95);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

