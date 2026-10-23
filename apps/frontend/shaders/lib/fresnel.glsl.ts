/**
 * ORBIT LANDING V4 — SHADER LIBRARY: FRESNEL GLSL
 */

export const fresnelGLSL = /* glsl */ `
float getFresnel(vec3 normal, vec3 viewDir, float power, float bias) {
  float nDotV = clamp(dot(normal, viewDir), 0.0, 1.0);
  return clamp(bias + (1.0 - bias) * pow(1.0 - nDotV, power), 0.0, 1.0);
}
`;
