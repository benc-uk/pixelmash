#version 300 es 
precision highp float;

// Effect for solarization of images outputting is B&W monochrome

in vec2 imgCoord;
uniform sampler2D image;
out vec4 pixel;

// Effect uniforms
uniform float center;
uniform float power;
uniform float colorize;

// INCLUDE_LIB

void main() {
  vec3 outColor = rgb2hsv(texture(image, imgCoord).rgb); 

  //	Adjust the brightness curve
  outColor.b = pow(outColor.b, power);
  outColor.b = (outColor.b < center) ? (1.0 - outColor.b / center) : (outColor.b - center) / center;
  outColor.g = outColor.g * outColor.b * colorize;

  pixel = vec4(hsv2rgb(outColor), 1.0);
}