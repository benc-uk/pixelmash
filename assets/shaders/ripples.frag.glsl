#version 300 es 
precision highp float;

// A water ripple effect that distorts the image based on noise and time

in vec2 imgCoord;
uniform sampler2D image;
out vec4 pixel;

uniform float time;    // Time variable to animate the ripples
uniform float scale;   // Controls the size/frequency of ripples
uniform float amount;  // Controls the strength of the ripples

// INCLUDE_LIB

void main() {
  vec2 uv = (imgCoord - vec2(0.5, 0.5)) * scale; // Normalize UV coordinates to center around (0,0) and scale them
  float noiseValue = octaveNoise(uv + time * 0.1, 5); // Generate noise based on time and UV coordinates

  // Calculate ripple effect
  vec2 rippleOffset = vec2(sin(uv.x * 10.0 + time), cos(uv.y * 10.0 + time)) * noiseValue * amount;

  // Sample the image with the ripple offset
  vec4 color = texture(image, imgCoord + rippleOffset);

  pixel = color; // Output the final pixel color
}