#version 300 es 
precision highp float;

// Null effect, simply passes through the image without modification

in vec2 imgCoord;
uniform sampler2D image;
out vec4 pixel;

void main() {
  pixel = texture(image, imgCoord);
}