/**
 * Blending block GLSL templates
 */

export const MIX_TEMPLATE = `
// Mix/blend two values
{{outputType}} mix_{{id}}({{outputType}} layer1, {{outputType}} layer2, float amount) {
  return mix(layer1, layer2, amount);
}
`;

export const MULTIPLY_TEMPLATE = `
// Multiply two values
{{outputType}} multiply_{{id}}({{outputType}} layer1, {{outputType}} layer2) {
  return layer1 * layer2;
}
`;

export const ADD_TEMPLATE = `
// Add two values
{{outputType}} add_{{id}}({{outputType}} layer1, {{outputType}} layer2) {
  return layer1 + layer2;
}
`;

export const OVERLAY_TEMPLATE = `
// Overlay blend mode
vec3 overlay_{{id}}(vec3 base, vec3 blend) {
  return mix(
    2.0 * base * blend,
    1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
    step(0.5, base)
  );
}
`;
