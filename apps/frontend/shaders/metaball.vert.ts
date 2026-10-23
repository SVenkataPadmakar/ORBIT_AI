// apps/frontend/shaders/metaball.vert.ts
// Vertex shader for Raymarched SDF Metaballs in Scene 3 (Product Formation)
// Passes local bounding box coordinates and object-space camera position to fragment shader

export const metaballVertexShader = /* glsl */ `
varying vec3 v_local_pos;
varying vec3 v_camera_local;
varying vec3 v_world_pos;

void main() {
  v_local_pos = position;
  v_world_pos = (modelMatrix * vec4(position, 1.0)).xyz;

  // Transform world camera position into local model coordinate space
  // This allows raymarching within local box bounds regardless of scene transform
  v_camera_local = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
