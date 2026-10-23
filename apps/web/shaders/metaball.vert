varying vec3 v_local_pos;
varying vec3 v_camera_local;
varying vec3 v_world_pos;

void main() {
  v_local_pos = position;
  v_world_pos = (modelMatrix * vec4(position, 1.0)).xyz;
  v_camera_local = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
