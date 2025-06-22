#version 300 es 
precision highp float;

// Slices the image into horizontal bands, each with a random x-offset and slightly randomized height

in vec2 imgCoord;
uniform sampler2D image;
uniform vec2 imageRes;
out vec4 pixel;

uniform float count;  // Average number of horizontal slices
uniform float offset; // Maximum x-offset in pixels
uniform float jitter; // 0.0 to 1.0, how much to randomize slice height

// zzzINCLUDE_LIB

float random(float n) {
  return fract(sin(n * 12.9898) * 43758.5453);
}

void main() {
  float avgSliceHeight = 1.0 / count;
  float y = imgCoord.y;
  float acc = 0.0;
  float sliceIndex = 0.0;
  float sliceHeight = 0.0;
  float offsetImg = offset * imageRes.x * 0.03;

  // Find which slice this pixel belongs to, with random heights
  float maxSlices = max(count * 2.0, 100.0); // Ensure enough iterations
  for(float i = 0.0; i < maxSlices; i += 1.0) {
    float jitter = 1.0 + (random(i + offsetImg) * 2.0 - 1.0) * jitter;
    sliceHeight = avgSliceHeight * jitter;
    if(y < acc + sliceHeight) {
      sliceIndex = i;
      break;
    }
    acc += sliceHeight;
  }

  // Each slice gets a unique random x-offset
  float xOffset = (random(sliceIndex + offsetImg) * 2.0 - 1.0) * (offsetImg / imageRes.x);

  // Apply the offset only in x, keep y the same
  vec2 newCoord = vec2(imgCoord.x + xOffset, imgCoord.y);

  pixel = texture(image, newCoord);
}