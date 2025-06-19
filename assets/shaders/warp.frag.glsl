#version 300 es 
precision highp float;

// This shader is a weird smear effect that distorts the image based on distance from the center and time

in vec2 imgCoord;
uniform sampler2D image;
out vec4 pixel;

// Effect uniforms
uniform float amount;
uniform float time;
uniform float count;

void main() {
  vec2 uv = imgCoord;

  // Calculate the angle and distance from the center
  float angle = atan(uv.y - 0.5, uv.x - 0.5);
  float dist = length(uv - vec2(0.5, 0.5));

  // Create a smear effect based on distance and time, using frequency
  float smear = sin(dist * amount + time) * 0.1 * count;

  // Adjust the UV coordinates based on the smear effect
  uv.x += smear * cos(angle);
  uv.y += smear * sin(angle);

  // Sample the texture with the adjusted UV coordinates
  pixel = texture(image, uv);
}