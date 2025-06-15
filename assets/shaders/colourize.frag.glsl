#version 300 es 
precision highp float;

in vec2 imgcoord;
uniform float red;
uniform float blue;
uniform float green;
uniform sampler2D image;
out vec4 fragColor;

void main() {
  vec4 pixel = texture(image, imgcoord);
  pixel.r = pixel.r * red;
  pixel.g = pixel.g * green;
  pixel.b = pixel.b * blue;
  fragColor = pixel;
}