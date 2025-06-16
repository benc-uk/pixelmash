#version 300 es 
precision highp float;

// Effect for colourizing 

in vec2 imgcoord;
uniform sampler2D image;
out vec4 fragColor;

// Effect uniforms
uniform float red;
uniform float blue;
uniform float green;

void main() {
  vec4 pixel = texture(image, imgcoord);
  pixel.r = pixel.r * red;
  pixel.g = pixel.g * green;
  pixel.b = pixel.b * blue;
  fragColor = pixel;
}