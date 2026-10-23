/**
 * SCENE 1: THE SPARK — VERTEX SHADER
 * Displaces sphere vertices along normals using 3D noise + 6s breath
 */
import { noiseGLSL } from "./lib/noise.glsl";

export const sparkVertexShader = /* glsl */ `
uniform float u_time;
uniform float u_scroll;
uniform float u_reduced_motion;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vPosition;
varying float vNoise;

${noiseGLSL}

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vViewDir = normalize(cameraPosition - worldPos.xyz);
  vPosition = position;

  // 6s breathing cycle (scale 0.98 ↔ 1.02)
  float breathRate = (2.0 * 3.14159265) / 6.0;
  float breath = u_reduced_motion > 0.5 ? 1.0 : 1.0 + 0.02 * sin(u_time * breathRate);

  // Noise displacement along normal
  float noise = 0.0;
  if (u_reduced_motion < 0.5) {
    vec3 noiseCoord = position * 3.0 + vec3(0.0, u_time * 0.15, 0.0);
    noise = fbm3D(noiseCoord) * 0.04;
  }
  vNoise = noise;

  vec3 displacedPosition = position * breath + normal * noise;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}
`;
