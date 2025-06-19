#version 300 es 
precision highp float;

// Effect for posterizing the image, w ith adjustable number of levels

in vec2 imgCoord;
in vec2 pixelCoord;
uniform sampler2D image;
out vec4 pixel;

// Effect uniforms
uniform float levels; // Number of posterization levels, must be greater than 1

void main() {
  vec4 inPixel = texture(image, imgCoord);

  // Calculate the posterization effect
  float step = 1.0 / levels;
  inPixel.rgb = floor(inPixel.rgb / step) * step;
  inPixel.rgb = clamp(inPixel.rgb, 0.0, 1.0);
  pixel = inPixel;
}