/**
 * Color block GLSL templates
 */

export const SOLID_COLOR_TEMPLATE = `
// Solid color
vec4 solidColor_{{id}}(vec3 color, float alpha) {
  return vec4(color, alpha);
}
`;

export const GRADIENT_TEMPLATE = `
// Linear gradient
vec3 gradient_{{id}}(vec2 uv, vec3 color1, vec3 color2, float angle, float position) {
  float angleRad = angle * 3.14159265359 / 180.0;
  vec2 dir = vec2(cos(angleRad), sin(angleRad));
  float d = dot(uv - vec2(0.5), dir) + 0.5 + position;
  return mix(color1, color2, clamp(d, 0.0, 1.0));
}
`;

export const RAINBOW_TEMPLATE = `
// Rainbow color
vec3 rainbow_{{id}}(vec2 uv, float speed, float saturation) {
  float hue = fract(length(uv - 0.5) + iTime * speed);
  vec3 c = abs(hue * 6.0 - vec3(3.0, 2.0, 4.0)) - 1.0;
  return clamp(c, 0.0, 1.0) * saturation + (1.0 - saturation);
}
`;

export const HSV_ADJUST_TEMPLATE = `
// HSV adjustment
vec3 rgb2hsv_{{id}}(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb_{{id}}(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 hsvAdjust_{{id}}(vec3 color, float hueShift, float saturation, float brightness) {
  vec3 hsv = rgb2hsv_{{id}}(color);
  hsv.x = fract(hsv.x + hueShift);
  hsv.y = clamp(hsv.y * saturation, 0.0, 1.0);
  hsv.z = clamp(hsv.z * brightness, 0.0, 1.0);
  return hsv2rgb_{{id}}(hsv);
}
`;
