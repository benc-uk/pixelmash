#version 300 es 
precision highp float;

// Effect for pixelating the image

in vec2 imgcoord;
uniform sampler2D image;
out vec4 fragColor;

// Effect uniforms
uniform float pixelSize;

void main() {
  vec2 pixelCoord = floor(gl_FragCoord.xy / pixelSize) * pixelSize;
  pixelCoord /= vec2(textureSize(image, 0));
  vec4 pixel = texture(image, pixelCoord);
  fragColor = pixel;
}