#version 300 es

// Most basic vertex shader for rendering a full-screen quad

precision highp float;

in vec4 position;
out vec2 imgcoord;

void main() {
  gl_Position = position;
  imgcoord = position.xy * 0.5 + 0.5; // Convert from [-1, 1] to [0, 1]
}