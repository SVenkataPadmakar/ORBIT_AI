/**
 * ORBIT LANDING V4 — SHADER LIBRARY: ROTATION GLSL
 */

export const rotationGLSL = /* glsl */ `
mat2 rotate2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

mat4 rotateZ(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat4(
    c, -s, 0.0, 0.0,
    s,  c, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  );
}

mat4 rotateX(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, c, -s, 0.0,
    0.0, s,  c, 0.0,
    0.0, 0.0, 0.0, 1.0
  );
}
`;
