#version 300 es 
precision highp float;

// Effect for adding scanlines to the image, with adjustable intensity and spacing

in vec2 imgCoord;
in vec2 pixelCoord;
uniform sampler2D image;
out vec4 pixel;

// Effect uniforms
uniform float spacing; // Range: 0 to 1
uniform float level; // Range: 0 to 1
uniform float intensity; // Range: 0 to 1

void main() {
  vec4 inPixel = texture(image, imgCoord); 

  // Calculate the scanline effect using the y-coordinate and sine function
  float scanline = sin(pixelCoord.y * spacing);

  // Adjust the scanline effect based on darken and brightness
  float scanlineEffect = mix(1.0, 1.0 - level * scanline, intensity);
  inPixel.rgb *= scanlineEffect;

  // Ensure the pixel is within valid range
  inPixel.rgb = clamp(inPixel.rgb, 0.0, 1.0);
  pixel = inPixel;
}