/**
 * Shape block GLSL templates
 */

export const CIRCLE_TEMPLATE = `
// Circle shape
float circle_{{id}}(vec2 uv, vec2 center, float radius, float softness) {
  float d = length(uv - center);
  return 1.0 - smoothstep(radius - softness, radius + softness, d);
}
`;

export const RECTANGLE_TEMPLATE = `
// Rectangle shape
float rectangle_{{id}}(vec2 uv, vec2 center, vec2 size, float cornerRadius) {
  vec2 d = abs(uv - center) - size * 0.5;
  float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - cornerRadius;
  return 1.0 - smoothstep(-0.01, 0.01, dist);
}
`;

export const RING_TEMPLATE = `
// Ring shape
float ring_{{id}}(vec2 uv, vec2 center, float innerRadius, float outerRadius, float softness) {
  float d = length(uv - center);
  float outer = 1.0 - smoothstep(outerRadius - softness, outerRadius + softness, d);
  float inner = smoothstep(innerRadius - softness, innerRadius + softness, d);
  return outer * inner;
}
`;

export const STAR_TEMPLATE = `
// Star shape
float star_{{id}}(vec2 uv, vec2 center, int points, float size, float softness) {
  vec2 p = uv - center;
  float a = atan(p.y, p.x);
  float r = length(p);
  float n = float(points);
  float m = 3.14159265359 / n;
  float d = cos(floor(0.5 + a / (2.0 * m)) * 2.0 * m - a) * r;
  return 1.0 - smoothstep(size - softness, size + softness, d);
}
`;
