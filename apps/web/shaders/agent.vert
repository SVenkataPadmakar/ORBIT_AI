// apps/web/shaders/agent.vert
// Vertex shader for Agent Nodes in Scene 4 (Agent Awakening)
// Computes view direction and normal vectors for emissive core and fresnel shell

varying vec3 v_normal;
varying vec3 v_view_dir;
varying vec3 v_world_pos;
varying vec2 v_uv;

void main() {
  v_uv = uv;
  v_world_pos = (modelMatrix * vec4(position, 1.0)).xyz;
  v_normal = normalize(normalMatrix * normal);
  v_view_dir = normalize(cameraPosition - v_world_pos);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
