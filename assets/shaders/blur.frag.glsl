#version 300 es
precision highp float;

// A fast Gaussian blur shader,
// Taken from https://www.shadertoy.com/view/ltScRG

in vec2 imgCoord;
uniform sampler2D image;
uniform vec2 imageRes;
out vec4 pixel;

uniform int samples;

const int LOD = 2;
const int sLOD = 1 << LOD;

float gaussian(vec2 i, float sigma) {
  return exp(-.5 * dot(i /= sigma, i)) / (6.28 * sigma * sigma);
}

vec4 blur(sampler2D sp, vec2 U, vec2 scale, float sigma) {
  vec4 O = vec4(0);
  int s = samples / sLOD;

  for(int i = 0; i < s * s; i++) {
    vec2 d = vec2(i % s, i / s) * float(sLOD) - float(samples) / 2.;
    O += gaussian(d, sigma) * textureLod(sp, U + scale * d, float(LOD));
  }

  return O / O.a;
}

void main() {
  float sigma = float(samples) * 0.25;

  vec2 scale = vec2(1.0) / imageRes;
  pixel = blur(image, imgCoord, scale, sigma);
}