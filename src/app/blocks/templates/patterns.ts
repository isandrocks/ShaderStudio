/**
 * Pattern block GLSL templates
 */

export const WAVE_TEMPLATE = `
// Wave pattern
float wave_{{id}}(vec2 uv, float frequency, float amplitude, float speed, float direction) {
  float angle = direction * 3.14159265359 / 180.0;
  vec2 dir = vec2(cos(angle), sin(angle));
  float d = dot(uv, dir);
  return sin(d * frequency + iTime * speed) * amplitude;
}
`;

export const GRID_TEMPLATE = `
// Grid pattern
float grid_{{id}}(vec2 uv, float cellSize, float lineWidth) {
  vec2 grid = abs(fract(uv / cellSize - 0.5) - 0.5) / fwidth(uv / cellSize);
  float line = min(grid.x, grid.y);
  return 1.0 - min(line * lineWidth, 1.0);
}
`;

export const CHECKERBOARD_TEMPLATE = `
// Checkerboard pattern
float checkerboard_{{id}}(vec2 uv, float scale, float rotation) {
  float angle = rotation * 3.14159265359 / 180.0;
  mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 rotUV = rot * (uv - 0.5) + 0.5;
  vec2 checker = floor(rotUV * scale);
  return mod(checker.x + checker.y, 2.0);
}
`;

export const RADIAL_REPEAT_TEMPLATE = `
// Radial repeat pattern
vec2 radialRepeat_{{id}}(vec2 uv, vec2 center, float count) {
  vec2 p = uv - center;
  float angle = atan(p.y, p.x);
  float radius = length(p);
  float sector = 6.28318530718 / count;
  angle = mod(angle, sector) - sector * 0.5;
  return vec2(cos(angle), sin(angle)) * radius + center;
}
`;
