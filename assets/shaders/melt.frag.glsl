#version 300 es
precision highp float;

// A liquid melt effect that looks a little like dripping or melting of an image

in vec2 imgCoord;
uniform sampler2D image;
uniform vec2 pixelCoord;
out vec4 pixel;

uniform float strength; // 0.0 to 1.0, how much to melt
uniform float progress;   // time or animation offset
uniform int drips;   // number of drips
uniform float offset; // normalized horizontal offset [0.0, 1.0]

// INCLUDE_LIB

void main() {
  float x = imgCoord.x;
  float y = imgCoord.y;
  float dripOffset = 0.0;

  for(int i = 0; i < 64; ++i) {
    if(i >= drips)
      break;
    // Use xOffset directly (and invert sign if needed for direction)
    float dripCenter = float(i) / float(drips - 1);
    float dripWidth = 0.04 + 0.06 * random(float(i) * 1.23);
    float wrappedX = mod(x - offset + 1.0, 1.0); // ensures value stays in [0,1)
    float dist = min(abs(wrappedX - dripCenter), 1.0 - abs(wrappedX - dripCenter));

    if(dist < dripWidth) {
      float dripSpeed = 0.3 + 0.7 * random(float(i) * 2.17);
      float dripProgress = mod(progress * dripSpeed + random(float(i) * 3.14), 1.0);
      float local = 1.0 - smoothstep(0.0, dripWidth, dist);
      float dripShape = pow(local, 1.5);
      float thisDrip = strength * dripShape * dripProgress * 0.5;
      dripOffset = max(dripOffset, thisDrip);
    }
  }

  vec2 uv = imgCoord;
  uv.y = mod(uv.y + dripOffset, 1.0); // Wrap vertically
  uv = clamp(uv, vec2(0.0), vec2(1.0));
  vec4 col = texture(image, uv);
  col.rgb = mix(col.rgb, col.rgb * vec3(1.1, 0.95, 0.85), dripOffset * 0.8);
  pixel = col;
}