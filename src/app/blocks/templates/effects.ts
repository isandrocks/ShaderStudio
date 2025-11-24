/**
 * Effect block GLSL templates
 */

export const GLOW_TEMPLATE = `
// Glow effect
vec3 glow_{{id}}(vec3 color, float intensity, float size) {
  float luminance = dot(color, vec3(0.299, 0.587, 0.114));
  return color + color * luminance * intensity * size;
}
`;

export const NOISE_TEMPLATE = `
// Noise function
float noise_{{id}}(vec2 p, float scale, float speed) {
  vec2 scaled = p * scale + iTime * speed;
  return fract(sin(dot(scaled, vec2(12.9898, 78.233))) * 43758.5453);
}
`;

export const RIPPLE_TEMPLATE = `
// Ripple effect
float ripple_{{id}}(vec2 uv, vec2 center, float frequency, float amplitude, float speed) {
  float d = length(uv - center);
  return sin(d * frequency - iTime * speed) * amplitude * (1.0 - d);
}
`;

export const BLUR_TEMPLATE = `
// Simple blur approximation
vec3 blur_{{id}}(vec2 uv, float amount, int samples) {
  vec3 color = vec3(0.0);
  float total = 0.0;
  
  for (int x = -samples; x <= samples; x++) {
    for (int y = -samples; y <= samples; y++) {
      vec2 offset = vec2(float(x), float(y)) * amount;
      // Note: This would need a texture sample in real implementation
      // For procedural shaders, blur is less applicable
      color += vec3(0.5); // Placeholder
      total += 1.0;
    }
  }
  
  return color / total;
}
`;
