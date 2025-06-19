#version 300 es 
precision highp float;

// Effect for adding scanlines to the image, with adjustable intensity and spacing

in vec2 imgCoord;
uniform sampler2D image;
out vec4 pixel;

// Effect uniforms
uniform vec3 colour1;
uniform vec3 colour2;
uniform float contrast;

void main() {
  vec4 inPixel = texture(image, imgCoord);

  vec3 lumFactor = vec3(0.2126, 0.7152, 0.0722);
  vec3 desat = vec3(dot(inPixel.rgb, lumFactor));

  // increase contrast
  desat = pow(desat, vec3(contrast));
  desat *= contrast;

  pixel = vec4(mix(colour1, colour2, desat), 1.0);
}