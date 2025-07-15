#version 300 es 
precision highp float;

// Effect for simple edge detection, with colourisation of edges using hue and XOR

in vec2 imgCoord;
uniform sampler2D image;
out vec4 pixel;

// Effect uniforms
uniform float threshold; // Range: 0 to 1
uniform float strength; // Range: 0 to 1
uniform float size; // Range: 0 to 10
uniform vec3 colour; // RGB colour for the edge
uniform bool xor; // Apply XOR effect

void main() {
  vec2 texSize = vec2(textureSize(image, 0));
  vec2 pixelSize = size / texSize;

  // Sample the image at the current pixel and its neighbors
  vec4 center = texture(image, imgCoord);
  vec4 left = texture(image, imgCoord - vec2(pixelSize.x, 0.0));
  vec4 right = texture(image, imgCoord + vec2(pixelSize.x, 0.0));
  vec4 up = texture(image, imgCoord - vec2(0.0, pixelSize.y));
  vec4 down = texture(image, imgCoord + vec2(0.0, pixelSize.y));

  // Calculate the edge strength using a simple Sobel-like operator
  float edgeStrength = length(center.rgb - (left.rgb + right.rgb + up.rgb + down.rgb) / 4.0);

  // Apply thresholding 
  if(edgeStrength < threshold) {
    pixel = center; // No edge detected 
    return;
  }

  if(xor) {
    // Apply XOR effect using all the sampled pixels
    vec4 xorColor = vec4(0.0);
    xorColor += left;
    xorColor += right;
    xorColor += up;
    xorColor += down;
    xorColor /= 4.0; // Average the colors of the neighbors
    xorColor = vec4(xorColor.rgb * colour, 1.0) * strength + center * (1.0 - strength);
    pixel = xorColor;
  } else {
    // Colourise the edge
    pixel = vec4(colour, 1.0) * strength + center * (1.0 - strength);
  }
}