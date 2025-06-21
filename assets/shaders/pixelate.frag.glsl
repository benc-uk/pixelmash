#version 300 es 
precision highp float;

// Effect for pixelating the image, with rounding into cool looking circular grid

in vec2 imgCoord;
uniform sampler2D image;
uniform vec2 imageRes;
uniform float aspect;
out vec4 pixel;

// Effect uniforms
uniform float cells;
uniform float radius;

void main() {
  float cellSize = (imageRes.x / cells); 

  // Adjust coordinates for aspect ratio to make cells square
  vec2 adjustedCoord = imgCoord;
  adjustedCoord.y *= aspect;

  vec2 gridPos = floor(adjustedCoord * imageRes.x / cellSize);
  vec2 center = (gridPos + 0.5) * cellSize / imageRes.x;
  center.y /= aspect; // Convert back to original coordinate space

  vec4 pixelColor = texture(image, center);

  // Calculate distance with aspect ratio correction
  vec2 diff = imgCoord - center;
  diff.y *= aspect; // Adjust y component for aspect ratio
  float dist = length(diff);

  float pixelRadius = radius * cellSize / imageRes.x;
  if(dist < pixelRadius) {
    pixel = pixelColor;
  } else {
    pixel = vec4(0.0, 0.0, 0.0, 1.0);
  }
}