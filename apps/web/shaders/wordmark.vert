// apps/web/shaders/wordmark.vert
// Scene 6: Orbit Core — 3D extruded wordmark vertex shader
// Section 6 & Section 10 of .antigravity/rules.md
#define LOW_QUALITY 0

uniform float u_time;
uniform float u_scroll;
uniform float u_reveal;

varying vec3 v_normal;
varying vec3 v_viewDir;
varying vec3 v_worldPos;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  v_worldPos = worldPosition.xyz;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  v_viewDir = normalize(-mvPosition.xyz);
  v_normal = normalize(normalMatrix * normal);

  gl_Position = projectionMatrix * mvPosition;
}
