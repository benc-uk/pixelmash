#version 300 es 
precision highp float;

// A blur effect that averages the color of surrounding pixels 

in vec2 imgCoord;
uniform sampler2D image;
out vec4 pixel;

uniform float size;

// INCLUDE_LIB

void main() {

  vec2 texelSize = 1.0 / vec2(textureSize(image, 0)); // Get the size of a single texel
 // Size of the blur kernel
  vec4 color = vec4(0.0); // Initialize color accumulator
  int count = 0; // Count of samples taken

  // Loop through a square kernel centered at the current pixel
  for(int x = -int(size); x <= int(size); ++x) {
    for(int y = -int(size); y <= int(size); ++y) {
      vec2 offset = vec2(x, y) * texelSize; // Calculate offset in texture coordinates
      color += texture(image, imgCoord + offset); // Sample the texture at the offset position
      count++; // Increment sample count
    }
  }

  pixel = color / float(count); // Average the accumulated color and output it

}