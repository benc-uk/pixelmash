#version 300 es 
precision highp float;

// Effect for simple edge detection, with colorization of edges using hue and XOR

in vec2 imgcoord;
uniform sampler2D image;
out vec4 fragColor;

// Effect uniforms
uniform float threshold; // Range: 0 to 1
uniform float strength; // Range: 0 to 10
uniform float size; // Range: 0 to 10
uniform float hue; // Range: 0 to 1

vec3 hsv2rgb(float h, float s, float v)
{
  vec4 t = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
  return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
}

void main() {
  vec2 texSize = vec2(textureSize(image, 0));
  vec2 pixelSize = size / texSize;

  // Sample the image at the current pixel and its neighbors
  vec4 center = texture(image, imgcoord);
  vec4 left = texture(image, imgcoord - vec2(pixelSize.x, 0.0));
  vec4 right = texture(image, imgcoord + vec2(pixelSize.x, 0.0));
  vec4 up = texture(image, imgcoord - vec2(0.0, pixelSize.y));
  vec4 down = texture(image, imgcoord + vec2(0.0, pixelSize.y));

  // Calculate the edge strength using a simple Sobel-like operator
  float edgeStrength = length(center.rgb - (left.rgb + right.rgb + up.rgb + down.rgb) / 4.0);

  // Apply thresholding
  if (edgeStrength < threshold) {
    fragColor = center; // No edge detected
    return;
  }

  // Colorize the edge based on hue
  vec3 edgeColor = hsv2rgb(hue, 1.0, 1.0);
  
  // Apply strength to the edge color but XOR with the center color
  fragColor = vec4(mix(center.rgb, edgeColor, strength) * (1.0 - step(0.5, edgeStrength)), center.a);
}