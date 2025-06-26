#version 300 es 
precision highp float;

// A simple hue and saturation adjustment shader

in vec2 imgCoord;
uniform sampler2D image;
out vec4 pixel;

// Effect uniforms
uniform float saturation; // Range: 0 to 1
uniform float hue;

// INCLUDE_LIB

void main() {
  vec4 inPixel = texture(image, imgCoord);

  // Convert RGB to HSV
  vec3 hsv = rgb2hsv(inPixel.rgb);

  // Adjust hue and saturation
  hsv.x += hue; // Adjust hue
  hsv.y *= saturation; // Adjust saturation

  // Ensure hue is wrapped around [0, 1]
  if(hsv.x > 1.0)
    hsv.x -= 1.0;
  if(hsv.x < 0.0)
    hsv.x += 1.0;

  // Convert back to RGB
  vec3 adjustedColor = hsv2rgb(hsv);

  // Set the pixel color
  pixel = vec4(adjustedColor, inPixel.a);
}