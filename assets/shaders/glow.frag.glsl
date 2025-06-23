#version 300 es 
precision highp float;

// Glow and bloom effect shader, it should blow out bright areas of the image with a big fuzzy glow

in vec2 imgCoord;
uniform sampler2D image;
uniform vec2 imageRes;
out vec4 pixel;

// Effect uniforms
uniform float intensity; // Range: 0 to 1
uniform float size; // Range: 0 to 1
uniform float threshold; // Range: 0 to 1 - brightness threshold for glow

void main() {
  // Get the original pixel color
  vec4 originalColor = texture(image, imgCoord);

  // Early exit if intensity is zero
  if(intensity <= 0.0) {
    pixel = originalColor;
    return;
  }

  // Optimized luminance calculation (pre-computed constant)
  const vec3 luminanceVector = vec3(0.2126, 0.7152, 0.0722);
  float brightness = dot(originalColor.rgb, luminanceVector);

  // Extract bright parts for blooming
  vec3 brightPass = smoothstep(threshold, 1.0, brightness) * originalColor.rgb;

  // Create the bloom/glow effect with optimized sampling
  vec3 bloomColor = vec3(0.0);

  // Reduce sample count dramatically and use smart sampling pattern
  float blurRadius = max(1.0, 8.0 * size); // Reduced from 20.0 to 8.0
  float invSigma2 = 1.0 / (blurRadius * blurRadius * 0.25); // Pre-compute 1/(2*sigma^2)
  vec2 texelSize = 1.0 / imageRes;

  // Use separable blur approximation with fewer samples
  float totalWeight = 0.0;

  // Horizontal pass with reduced samples
  for(float x = -blurRadius; x <= blurRadius; x += 2.0) { // Step by 2 instead of 1
    float weight = exp(-x * x * invSigma2);
    totalWeight += weight;

    vec2 offset = vec2(x * texelSize.x, 0.0);
    vec3 sampleColor = texture(image, imgCoord + offset).rgb;
    float sampleBrightness = dot(sampleColor, luminanceVector);

    // Only process if sample is bright enough
    if(sampleBrightness > threshold * 0.6) {
      vec3 sampleBrightPass = smoothstep(threshold, 1.0, sampleBrightness) * sampleColor;
      bloomColor += sampleBrightPass * weight;
    }
  }

  // Vertical contribution (simplified)
  for(float y = -blurRadius; y <= blurRadius; y += 2.0) { // Step by 2 instead of 1
    if(y == 0.0)
      continue; // Skip center (already sampled in horizontal)

    float weight = exp(-y * y * invSigma2) * 0.5; // Reduced weight for vertical
    totalWeight += weight;

    vec2 offset = vec2(0.0, y * texelSize.y);
    vec3 sampleColor = texture(image, imgCoord + offset).rgb;
    float sampleBrightness = dot(sampleColor, luminanceVector);

    // Only process if sample is bright enough
    if(sampleBrightness > threshold * 0.6) {
      vec3 sampleBrightPass = smoothstep(threshold, 1.0, sampleBrightness) * sampleColor;
      bloomColor += sampleBrightPass * weight;
    }
  }

  // Normalize by total weight
  bloomColor /= max(totalWeight, 0.001); // Prevent division by zero

  // Mix the original color with the bloom based on the intensity parameter
  vec3 finalColor = mix(originalColor.rgb, originalColor.rgb + bloomColor * 2.0, intensity);

  // Output the result
  pixel = vec4(finalColor, originalColor.a);
}