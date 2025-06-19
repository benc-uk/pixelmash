#version 300 es 
precision highp float;

// Effect for solarization of images outputting is B&W monochrome

in vec2 imgCoord;
uniform sampler2D image;
out vec4 pixel;

// Effect uniforms
uniform float centerBrightness; // Range 0.2 - 0.8
uniform float powerCurve;       // Range 1-3
uniform float colorize;         // Range 0.0 - 1.0

// INCLUDE_LIB

void main() {
  vec3 outColor = rgb2hsv(texture(image, imgCoord).rgb); 

  //	Adjust the brightness curve
  outColor.b = pow(outColor.b, powerCurve);
  outColor.b = (outColor.b < centerBrightness) ? (1.0 - outColor.b / centerBrightness) : (outColor.b - centerBrightness) / centerBrightness;
  outColor.g = outColor.g * outColor.b * colorize;

  pixel = vec4(hsv2rgb(outColor), 1.0);
}