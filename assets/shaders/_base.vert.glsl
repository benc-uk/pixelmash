#version 300 es
precision highp float;

// Most basic vertex shader for rendering a full-screen quad

in vec4 position;
out vec2 imgCoord;   // Normalized image coordinates [0, 1]
out vec2 pixelCoord; // Pixel coordinates in the image

uniform vec2 imageRes;

void main() {
  gl_Position = position;
  imgCoord = position.xy * 0.5 + 0.5; // Convert from [-1, 1] to [0, 1]
  pixelCoord = imgCoord * imageRes;
}