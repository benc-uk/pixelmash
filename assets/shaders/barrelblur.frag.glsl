#version 300 es
precision highp float;

// Effect for barrel distortion blur, simulating a lens effect with chromatic aberration

in vec2 imgCoord;
uniform sampler2D image;
uniform vec2 imageRes;
out vec4 pixel;

const int numIter = 16;

uniform float blur;
uniform float offset;
uniform float strength;
uniform float chromatic;

void main() {
  vec2 center = vec2(0.5, 0.5);
  vec2 uv = imgCoord;
  vec2 norm = (uv - center) / center;

  float r = length(norm);
  float theta = atan(norm.y, norm.x);

  float blurStrength = blur * strength * smoothstep(offset, 1.0, r);

  vec3 color = vec3(0.0);
  float total = 0.0;

  float ca[3];
  ca[0] = 0.012 * chromatic;
  ca[1] = 0.0;
  ca[2] = -0.012 * chromatic;

  for(int i = 0; i < numIter; ++i) {
    float t = float(i) / float(numIter - 1);
    float barrel = blurStrength * (t - 0.5);

    for(int c = 0; c < 3; ++c) {
      float rr = r + barrel + ca[c];
      vec2 sampleNorm = vec2(cos(theta), sin(theta)) * rr;
      vec2 sampleUV = center + sampleNorm * center;
      color[c] += texture(image, sampleUV).rgb[c];
    }
    total += 1.0;
  }

  color /= total;
  pixel = vec4(color, 1.0);
}