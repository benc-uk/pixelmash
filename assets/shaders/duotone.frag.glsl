#version 300 es 
precision highp float;

// Creates a duotone & mono colour effect

in vec2 imgCoord;
uniform sampler2D image;
out vec4 pixel;

// Effect uniforms
uniform vec3 colour1;
uniform vec3 colour2;
uniform float contrast;
uniform bool monotone;
uniform float monotoneThres;

void main() {
  vec4 inPixel = texture(image, imgCoord);

  vec3 lumFactor = vec3(0.2126, 0.7152, 0.0722);
  vec3 desat = vec3(dot(inPixel.rgb, lumFactor));

  // increase contrast
  desat = pow(desat, vec3(contrast));
  desat *= contrast;

  vec4 col = vec4(mix(colour1, colour2, desat), 1.0);

  if(monotone) {
    float brightness = (col.r + col.g + col.b) / 3.0;
    brightness = clamp(brightness, 0.0, 1.0);
    if(brightness < monotoneThres) {
      col = vec4(colour1, 1.0);
    } else {
      col = vec4(colour2, 1.0);
    }
  }
  pixel = col;
}