/**
 * Volumetric Nebula Particle Shader
 * Soft Gaussian dust particles with depth attenuation, harmonic color grading, and organic drift
 */

export const nebulaVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  
  attribute float aScale;
  attribute vec3 aColor;
  attribute float aPhase;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;

    // Organic harmonic oscillation in space
    vec3 transformed = position;
    transformed.x += sin(uTime * 0.2 + aPhase) * 0.35;
    transformed.y += cos(uTime * 0.15 + aPhase * 1.3) * 0.25;
    transformed.z += sin(uTime * 0.18 + aPhase * 0.7) * 0.35;

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Depth-based size attenuation
    float dist = -mvPosition.z;
    gl_PointSize = (uSize * aScale * 240.0) / max(dist, 1.0);

    // Fade particles that get too close or too far
    float nearFade = smoothstep(0.5, 3.0, dist);
    float farFade = 1.0 - smoothstep(25.0, 50.0, dist);
    vAlpha = nearFade * farFade * (0.35 + 0.25 * sin(uTime * 0.4 + aPhase));
  }
`;

export const nebulaFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Distance from point center [0, 1]
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord) * 2.0;

    if (dist > 1.0) {
      discard;
    }

    // Soft Gaussian radial falloff
    float radial = exp(-dist * dist * 3.5);
    float alpha = radial * vAlpha;

    gl_FragColor = vec4(vColor * 1.2, alpha);
  }
`;
