#version 300 es 
precision highp float;

// Effect for colourizing 

in vec2 imgCoord;
uniform sampler2D image;
out vec4 pixel;

// Effect uniforms
uniform float red;
uniform float blue;
uniform float green;
uniform float brightness;
uniform float contrast;

void main() {
  vec4 inPixel = texture(image, imgCoord);
  inPixel.r = inPixel.r * red;
  inPixel.g = inPixel.g * green;
  inPixel.b = inPixel.b * blue;
  inPixel.rgb = (inPixel.rgb - 0.5) * contrast + 0.5; // Adjust contrast
  inPixel.rgb = inPixel.rgb * brightness; // Adjust brightness
  pixel = inPixel;
}