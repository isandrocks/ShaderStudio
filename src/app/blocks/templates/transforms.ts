/**
 * Transform block GLSL templates
 */

export const MOVE_TEMPLATE = `
// Move/translate coordinates
vec2 move_{{id}}(vec2 uv, float xOffset, float yOffset) {
  return uv - vec2(xOffset, yOffset);
}
`;

export const ROTATE_TEMPLATE = `
// Rotate coordinates
vec2 rotate_{{id}}(vec2 uv, vec2 center, float angle) {
  float angleRad = angle * 3.14159265359 / 180.0;
  mat2 rot = mat2(cos(angleRad), -sin(angleRad), sin(angleRad), cos(angleRad));
  return rot * (uv - center) + center;
}
`;

export const SCALE_TEMPLATE = `
// Scale coordinates
vec2 scale_{{id}}(vec2 uv, vec2 center, float scaleX, float scaleY) {
  vec2 p = uv - center;
  p /= vec2(scaleX, scaleY);
  return p + center;
}
`;

export const DISTORT_TEMPLATE = `
// Distort coordinates
vec2 distort_{{id}}(vec2 uv, float strength, float frequency) {
  vec2 distortion = vec2(
    sin(uv.y * frequency + iTime) * strength,
    cos(uv.x * frequency + iTime) * strength
  );
  return uv + distortion;
}
`;
