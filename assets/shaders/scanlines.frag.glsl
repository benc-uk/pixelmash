#version 300 es 
precision highp float;

// Effect for adding scanlines to the image, with adjustable intensity and spacing

in vec2 imgcoord;
uniform sampler2D image;
uniform vec2 imageRes;
out vec4 fragColor;

// Effect uniforms
uniform float spacing; // Range: 0 to 1
uniform float intensity; // Range: 0 to 1

void main() {
  vec4 pixel = texture(image, imgcoord);
  
  // Calculate the scanline effect using the y-coordinate and sine function
  float scanline = sin(gl_FragCoord.y * spacing);
  pixel.rgb *= scanline * intensity; 
  fragColor = pixel;
}