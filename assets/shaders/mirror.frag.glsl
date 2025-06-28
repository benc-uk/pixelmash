#version 300 es 
precision highp float;

// Reflect the image across a specified axis in the center of the image.

in vec2 imgCoord;
uniform sampler2D image;
uniform vec2 imageRes; // Size of the input image
out vec4 pixel;

// Effect uniforms
uniform int axis; 

// INCLUDE_LIB

void main() {
  vec2 coord = imgCoord;
  
  // Extended mirroring modes:
  // 0 = horizontal mirror (left half mirrored to right)
  // 1 = vertical mirror (top half mirrored to bottom)
  // 2 = both axes (top-left quadrant mirrored to all quadrants)
  // 3 = diagonal mirror (main diagonal - top-left to bottom-right)
  // 4 = anti-diagonal mirror (anti-diagonal - top-right to bottom-left)
  // 5 = kaleidoscope (4-way radial symmetry)
  // 6 = horizontal flip (right half mirrored to left)
  // 7 = vertical flip (bottom half mirrored to top)
  // 8 = center radial (8-way symmetry)
  
  if (axis == 0) {
    // Horizontal mirror: left half to right
    if (coord.x > 0.5) {
      coord.x = 1.0 - coord.x;
    }
  }
  else if (axis == 1) {
    // Vertical mirror: top half to bottom
    if (coord.y > 0.5) {
      coord.y = 1.0 - coord.y;
    }
  }
  else if (axis == 2) {
    // Both axes: top-left quadrant to all
    if (coord.x > 0.5) {
      coord.x = 1.0 - coord.x;
    }
    if (coord.y > 0.5) {
      coord.y = 1.0 - coord.y;
    }
  }
  else if (axis == 3) {
    // Diagonal mirror (main diagonal)
    if (coord.x + coord.y > 1.0) {
      float temp = coord.x;
      coord.x = 1.0 - coord.y;
      coord.y = 1.0 - temp;
    }
  }
  else if (axis == 4) {
    // Anti-diagonal mirror
    if (coord.x > coord.y) {
      float temp = coord.x;
      coord.x = coord.y;
      coord.y = temp;
    }
  }
  else if (axis == 5) {
    // Kaleidoscope (4-way radial symmetry)
    vec2 center = vec2(0.5);
    vec2 fromCenter = coord - center;
    float angle = atan(fromCenter.y, fromCenter.x);
    float dist = length(fromCenter);
    
    // Map to first quadrant
    angle = mod(abs(angle), PI * 0.5);
    coord = center + dist * vec2(cos(angle), sin(angle));
  }
  else if (axis == 6) {
    // Horizontal flip: right half to left
    if (coord.x < 0.5) {
      coord.x = 1.0 - coord.x;
    }
  }
  else if (axis == 7) {
    // Vertical flip: bottom half to top
    if (coord.y < 0.5) {
      coord.y = 1.0 - coord.y;
    }
  }
  else if (axis == 8) {
    // Center radial (8-way symmetry)
    vec2 center = vec2(0.5);
    vec2 fromCenter = coord - center;
    float angle = atan(fromCenter.y, fromCenter.x);
    float dist = length(fromCenter);
    
    // Map to first octant
    angle = mod(abs(angle), PI * 0.25);
    coord = center + dist * vec2(cos(angle), sin(angle));
  }
  
  // Clamp coordinates to ensure they stay in bounds
  coord = clamp(coord, 0.0, 1.0);
  
  // Sample the texture with the (potentially) mirrored coordinates
  pixel = texture(image, coord);
}