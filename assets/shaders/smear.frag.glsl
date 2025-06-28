#version 300 es 
precision highp float;

// Smear based on RG channel displaced from center & rotated

in vec2 imgCoord;
uniform sampler2D image;
out vec4 pixel;

// Effect uniforms
uniform float amount;
uniform float time;
uniform bool style;

// INCLUDE_LIB

void main() {
  vec2 pixelPos = imgCoord;
  vec2 smearPos = imgCoord;

  vec2 off = texture(image, smearPos).rg; // RG channel offset from center

  if(style) {
    off -= 0.5;
  } else {
    off *= 0.5;
  }

  off = rotate(off, time * TWO_PI);
  pixelPos += off * amount;

  pixel = texture(image, pixelPos);
}