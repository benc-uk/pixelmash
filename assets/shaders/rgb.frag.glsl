#version 300 es 
precision highp float;

// Effect that splits the RGB channels of an image and shift each channel by a specified distance in a random direction

in vec2 imgCoord;
uniform sampler2D image;
out vec4 pixel;

uniform float dist;
uniform float seed; 

// INCLUDE_LIB
vec2 rsotate(vec2 v, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

void main() {
  // Generate a random direction based on the seed
  vec2 dirR = randomDir(1.0 + seed * 0.7);

  // other channels are offset by 120 degrees
  vec2 dirG = rotate(dirR, 2.0943951 + random(seed)); // 120 degrees in radians
  vec2 dirB = rotate(dirR, 4.1887902 + random(seed)); // 240 degrees in radians

  // Shift each channel in a different direction by 'dist' (in texture coordinates)
  vec2 uvR = imgCoord + dirR * dist;
  vec2 uvG = imgCoord + dirG * dist;
  vec2 uvB = imgCoord + dirB * dist;

  float r = texture(image, uvR).r;
  float g = texture(image, uvG).g;
  float b = texture(image, uvB).b;
  float a = texture(image, imgCoord).a;

  pixel = vec4(r, g, b, a);
}