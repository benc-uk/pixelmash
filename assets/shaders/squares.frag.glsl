#version 300 es
precision highp float;

// Divide image into squares and slightly displace them randomly in  random direction

in vec2 imgCoord;
uniform sampler2D image;
uniform vec2 imageRes;
out vec4 pixel;

uniform float size;
uniform float displace;
uniform float hue;
uniform float value;
uniform float seed;

// INCLUDE_LIB

void main() {
  // Calculate square size proportional to image resolution
  // size is a fraction of the smaller dimension
  float minDimension = min(imageRes.x, imageRes.y);
  vec2 squareSize = vec2(size * minDimension) / imageRes;

  // Find which square this pixel belongs to
  vec2 squareIndex = floor(imgCoord / squareSize);

  // Generate random displacement for this square
  float rndSeed = seed + squareIndex.x + seed + squareIndex.y * 1000.0;
  // amount is proportional to square size for consistent displacement
  vec2 displacement = randomDir(rndSeed) * displace * squareSize * random(rndSeed + 100.0);

  // Calculate position within the square (0.0 to 1.0)
  vec2 posInSquare = fract(imgCoord / squareSize);

  // Calculate the original position of this square before displacement
  vec2 originalSquarePos = squareIndex * squareSize;

  // Sample from the displaced square position
  vec2 sampleCoord = originalSquarePos + posInSquare * squareSize - displacement;

  vec4 originalColor = texture(image, sampleCoord);

  // Apply random hue and value modifications per square
  vec3 hsv = rgb2hsv(originalColor.rgb);

  // Generate random hue and value shifts for this square
  float hueShift = (random(rndSeed + 200.0) - 0.5) * 2.0 * hue;
  float valueShift = (random(rndSeed + 300.0) - 0.5) * 2.0 * value;

  // Apply the shifts
  hsv.x = fract(hsv.x + hueShift); // Wrap hue around [0,1]
  hsv.z = clamp(hsv.z + valueShift, 0.0, 1.0); // Clamp value to [0,1]

  // Convert back to RGB
  vec3 modifiedColor = hsv2rgb(hsv);

  pixel = vec4(modifiedColor, originalColor.a);
}