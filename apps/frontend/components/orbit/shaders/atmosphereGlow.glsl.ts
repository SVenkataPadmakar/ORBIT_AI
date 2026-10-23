/**
 * Atmospheric Fresnel Glow Shader
 * Produces cinematic planetary rim lighting against deep space
 */

export const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const atmosphereFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uCoefficient;
  uniform float uPower;

  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel factor: high at edges where normal is perpendicular to view direction
    float fresnel = dot(normal, viewDir);
    fresnel = clamp(1.0 - abs(fresnel), 0.0, 1.0);
    fresnel = uCoefficient * pow(fresnel, uPower);

    gl_FragColor = vec4(uColor, fresnel);
  }
`;
