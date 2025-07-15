#version 300 es 
precision highp float;

// Edge detection effect that looks cool with colourisation of edges

in vec2 imgCoord;
uniform sampler2D image;
out vec4 pixel;

// Effect uniforms
uniform float threshold; // Range: 0 to 1
uniform float size; // Range: 0 to 10
uniform vec3 colour; // RGB colour for the edge

void main() {
  vec2 texSize = vec2(textureSize(image, 0));
  vec2 pixelSize = size / texSize;

  // Sobel X kernel
  // -1  0  1
  // -2  0  2  
  // -1  0  1

  // Sobel Y kernel
  // -1 -2 -1
  //  0  0  0
  //  1  2  1

  // Sample the 3x3 neighborhood
  vec3 tl = texture(image, imgCoord + vec2(-pixelSize.x, -pixelSize.y)).rgb; // top-left
  vec3 tm = texture(image, imgCoord + vec2(0.0, -pixelSize.y)).rgb;         // top-middle
  vec3 tr = texture(image, imgCoord + vec2(pixelSize.x, -pixelSize.y)).rgb;  // top-right

  vec3 ml = texture(image, imgCoord + vec2(-pixelSize.x, 0.0)).rgb;          // middle-left
  vec3 mm = texture(image, imgCoord).rgb;                                    // center
  vec3 mr = texture(image, imgCoord + vec2(pixelSize.x, 0.0)).rgb;           // middle-right

  vec3 bl = texture(image, imgCoord + vec2(-pixelSize.x, pixelSize.y)).rgb;  // bottom-left
  vec3 bm = texture(image, imgCoord + vec2(0.0, pixelSize.y)).rgb;           // bottom-middle
  vec3 br = texture(image, imgCoord + vec2(pixelSize.x, pixelSize.y)).rgb;   // bottom-right

  // Apply Sobel X kernel
  vec3 sobelX = (-1.0 * tl) + (0.0 * tm) + (1.0 * tr) +
    (-2.0 * ml) + (0.0 * mm) + (2.0 * mr) +
    (-1.0 * bl) + (0.0 * bm) + (1.0 * br);

  // Apply Sobel Y kernel  
  vec3 sobelY = (-1.0 * tl) + (-2.0 * tm) + (-1.0 * tr) +
    (0.0 * ml) + (0.0 * mm) + (0.0 * mr) +
    (1.0 * bl) + (2.0 * bm) + (1.0 * br);

  // Calculate edge magnitude
  float edgeMagnitude = length(sqrt(sobelX * sobelX + sobelY * sobelY));

  // Apply threshold
  if(edgeMagnitude < threshold) {
    pixel = texture(image, imgCoord); // Original pixel if below threshold
    return;
  }

  // Create cool edge effect
  vec3 edgeColor = colour * edgeMagnitude;

  // Add some spice - rainbow effect based on edge direction
  float angle = atan(length(sobelY), length(sobelX));
  vec3 rainbow = vec3(sin(angle * 2.0) * 0.5 + 0.5, sin(angle * 2.0 + 2.094) * 0.5 + 0.5,  // 2.094 ≈ 2π/3
  sin(angle * 2.0 + 4.188) * 0.5 + 0.5   // 4.188 ≈ 4π/3
  );

  // Mix the edge color with rainbow effect for extra coolness
  vec3 finalEdgeColor = mix(edgeColor, rainbow * edgeMagnitude, 0.3);

  // Blend with original image for a cool composite effect
  vec3 originalColor = texture(image, imgCoord).rgb;
  pixel = vec4(mix(originalColor, finalEdgeColor, 0.8), 1.0);
}