#version 300 es
precision highp float;

// A Guassian blur shader
// This shader applies a Gaussian blur to an image based on the specified radius.

in vec2 imgCoord;
uniform sampler2D image;
uniform vec2 imageRes;
out vec4 pixel;

uniform float radius; // Blur radius in pixels

void main() {
  vec2 texelSize = 1.0 / imageRes;
  vec4 color = vec4(0.0);
  float totalWeight = 0.0;

  // Loop through a square area around the current pixel
  for(int x = -int(radius); x <= int(radius); ++x) {
    for(int y = -int(radius); y <= int(radius); ++y) {
      float weight = exp(-(float(x * x + y * y) / (2.0 * radius * radius)));
      vec2 offset = vec2(float(x), float(y)) * texelSize;
      color += texture(image, imgCoord + offset) * weight;
      totalWeight += weight;
    }
  }

  // Normalize the color by the total weight
  pixel = color / totalWeight;
}