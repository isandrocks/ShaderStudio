import React from "react";
import { EffectTemplate } from "./types";
import LinearGradientIcon from "./components/icons/LinearGradientIcon";
import RadialGradientIcon from "./components/icons/RadialGradientIcon";
import CircleIcon from "./components/icons/CircleIcon";
import CheckerboardIcon from "./components/icons/CheckerboardIcon";
import NoiseIcon from "./components/icons/NoiseIcon";

export const LAYER_TEMPLATES: EffectTemplate[] = [
  // ==========================================================================
  // GRADIENTS
  // ==========================================================================
  {
    id: "linear-gradient",
    name: "Linear Gradient",
    type: "gradient",
    icon: <LinearGradientIcon className="w-6 h-6" />,
    description: "Simple two-color linear gradient",
    glslFunction: `
vec3 linearGradient(vec2 uv, vec3 color1, vec3 color2, float angle) {
    float rad = radians(angle);
    vec2 dir = vec2(cos(rad), sin(rad));
    float t = dot(uv - 0.5, dir) + 0.5;
    return mix(color1, color2, clamp(t, 0.0, 1.0));
}
`,
    glslCall: "linearGradient(uv, {color1}, {color2}, {angle})",
    defaultProperties: {
      color1: {
        value: [0.1, 0.3, 0.8],
        type: "vec3",
        label: "Start Color",
      },
      color2: {
        value: [0.9, 0.2, 0.5],
        type: "vec3",
        label: "End Color",
      },
      angle: {
        value: 45.0,
        type: "float",
        min: 0,
        max: 360,
        step: 1,
        label: "Angle",
      },
    },
  },
  {
    id: "radial-gradient",
    name: "Radial Gradient",
    type: "gradient",
    icon: <RadialGradientIcon className="w-6 h-6" />,
    description: "Circular gradient from center",
    glslFunction: `
vec3 radialGradient(vec2 uv, vec3 centerColor, vec3 outerColor, float radius, vec2 center) {
    float d = distance(uv, center);
    float t = smoothstep(0.0, radius, d);
    return mix(centerColor, outerColor, clamp(t, 0.0, 1.0));
}
`,
    glslCall: "radialGradient(uv, {centerColor}, {outerColor}, {radius}, {center}.xy)",
    defaultProperties: {
      centerColor: {
        value: [1.0, 0.8, 0.2],
        type: "vec3",
        label: "Center Color",
      },
      outerColor: {
        value: [0.2, 0.1, 0.4],
        type: "vec3",
        label: "Outer Color",
      },
      radius: {
        value: 0.8,
        type: "float",
        min: 0.1,
        max: 2.0,
        step: 0.1,
        label: "Radius",
      },
      center: {
        value: [0.5, 0.5, 0.0], // vec3 used as vec2 + padding
        type: "vec3", // Using vec3 for position to reuse color picker/inputs if needed, or we can add vec2 support later
        label: "Center", // For now we might treat this as just X/Y sliders if we had vec2 support
      },
    },
  },

  // ==========================================================================
  // SHAPES
  // ==========================================================================
  {
    id: "circle",
    name: "Circle",
    type: "shape",
    icon: <CircleIcon className="w-6 h-6" />,
    description: "Basic circle shape",
    glslFunction: `
vec3 circleShape(vec2 uv, vec3 color, float radius, vec2 center, float softness) {
    float d = distance(uv, center);
    float alpha = 1.0 - smoothstep(radius - softness, radius, d);
    return color * alpha;
}
`,
    glslCall: "circleShape(uv, {color}, {radius}, vec2(0.5), {softness})",
    defaultProperties: {
      color: {
        value: [1.0, 1.0, 1.0],
        type: "vec3",
        label: "Color",
      },
      radius: {
        value: 0.3,
        type: "float",
        min: 0.0,
        max: 1.0,
        step: 0.01,
        label: "Radius",
      },
      softness: {
        value: 0.02,
        type: "float",
        min: 0.0,
        max: 0.5,
        step: 0.01,
        label: "Softness",
      },
    },
  },

  // ==========================================================================
  // PATTERNS
  // ==========================================================================
  {
    id: "checkerboard",
    name: "Checkerboard",
    type: "pattern",
    icon: <CheckerboardIcon className="w-6 h-6" />,
    description: "Tiled checkerboard pattern",
    glslFunction: `
vec3 checkerboard(vec2 uv, vec3 color1, vec3 color2, float scale) {
    vec2 pos = floor(uv * scale);
    float pattern = mod(pos.x + pos.y, 2.0);
    return mix(color1, color2, pattern);
}
`,
    glslCall: "checkerboard(uv, {color1}, {color2}, {scale})",
    defaultProperties: {
      color1: {
        value: [0.0, 0.0, 0.0],
        type: "vec3",
        label: "Color 1",
      },
      color2: {
        value: [1.0, 1.0, 1.0],
        type: "vec3",
        label: "Color 2",
      },
      scale: {
        value: 10.0,
        type: "float",
        min: 1.0,
        max: 50.0,
        step: 1.0,
        label: "Scale",
      },
    },
  },
  {
    id: "noise",
    name: "Simple Noise",
    type: "pattern",
    icon: <NoiseIcon className="w-6 h-6" />,
    description: "Random noise pattern",
    glslFunction: `
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec3 noisePattern(vec2 uv, vec3 color, float scale, float time) {
    vec2 pos = uv * scale;
    // Animate noise by adding time to position
    float n = random(floor(pos) + time * 0.1); 
    return color * n;
}
`,
    glslCall: "noisePattern(uv, {color}, {scale}, iTime)",
    defaultProperties: {
      color: {
        value: [1.0, 1.0, 1.0],
        type: "vec3",
        label: "Color",
      },
      scale: {
        value: 50.0,
        type: "float",
        min: 1.0,
        max: 200.0,
        step: 1.0,
        label: "Scale",
      },
    },
  },
];
