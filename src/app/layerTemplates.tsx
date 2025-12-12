import React from "react";
import { EffectTemplate } from "./types";
import LinearGradientIcon from "./components/icons/LinearGradientIcon";
import RadialGradientIcon from "./components/icons/RadialGradientIcon";
import CircleIcon from "./components/icons/CircleIcon";
import CheckerboardIcon from "./components/icons/CheckerboardIcon";
import NoiseIcon from "./components/icons/NoiseIcon";
import RectangleIcon from "./components/icons/RectangleIcon";
import VideoIcon from "./components/icons/VideoIcon";

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
    glslCall:
      "radialGradient(uv, {centerColor}, {outerColor}, {radius}, {center}.xy)",
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
        value: [0.5, 0.5],
        type: "vec2",
        label: "Center",
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
    glslCall: "circleShape(uv, {color}, {radius}, {center}, {softness})",
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
      center: {
        value: [0.5, 0.5],
        type: "vec2",
        label: "Center",
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
  {
    id: "plasma",
    name: "Plasma",
    type: "pattern",
    icon: <NoiseIcon className="w-6 h-6" />,
    description: "Colorful plasma pattern",
    glslFunction: `
vec3 plasmaPattern(vec2 uv, vec3 color, float scale, float spin, float time) {
    vec2 pos = uv;

    float angle = spin * time * 0.1;
    float s = sin(angle);
    float c = cos(angle);
    pos = mat2(c, -s, s, c) * pos;

    pos *= scale;

    pos.x += sin(pos.y * 0.5 + spin);
    pos.y += sin(pos.x * 0.5 + spin * 1.5);

    float v1 = sin(pos.x + time);
    float v2 = sin(pos.y + time);
    float v3 = sin((pos.x + pos.y) + time);
    float v4 = sin(sqrt(pos.x * pos.x + pos.y * pos.y) + time);

    float plasma = (v1 + v2 + v3 + v4) / 4.0;
    float intensity = plasma * 0.5 + 0.5;
    vec3 rColor = color * intensity;
    return rColor;
}
`,
    glslCall: "plasmaPattern(uv, {color}, {scale}, {spin}, iTime)",
    defaultProperties: {
      color: {
        value: [1.0, 1.0, 1.0],
        type: "vec3",
        label: "Color",
      },
      scale: {
        value: 15.0,
        type: "float",
        min: 1.0,
        max: 50.0,
        step: 1.0,
        label: "Scale",
      },
      spin: {
        value: 0.3,
        type: "float",
        min: 0.0,
        max: 10.0,
        step: 0.1,
        label: "Spin",
      },
    },
  },
  // ==========================================================================
  // NEW TEMPLATES
  // ==========================================================================
  {
    id: "grid",
    name: "Grid",
    type: "pattern",
    icon: <RectangleIcon className="w-6 h-6" />,
    description: "Grid lines pattern",
    glslFunction: `
vec3 gridPattern(vec2 uv, vec3 color1, vec3 color2, float scale, float thickness) {
    vec2 grid = fract(uv * scale);
    float line = step(thickness, grid.x) * step(thickness, grid.y);
    return mix(color1, color2, line);
}
`,
    glslCall: "gridPattern(uv, {color1}, {color2}, {scale}, {thickness})",
    defaultProperties: {
      color1: {
        value: [0.5, 0.5, 0.5],
        type: "vec3",
        label: "Line Color",
      },
      color2: {
        value: [0.0, 0.0, 0.0],
        type: "vec3",
        label: "Cell Color",
      },
      scale: {
        value: 10.0,
        type: "float",
        min: 1.0,
        max: 50.0,
        step: 1.0,
        label: "Scale",
      },
      thickness: {
        value: 0.1,
        type: "float",
        min: 0.01,
        max: 0.5,
        step: 0.01,
        label: "Thickness",
      },
    },
  },
  {
    id: "scanlines",
    name: "Scanlines",
    type: "pattern",
    icon: <VideoIcon className="w-6 h-6" />,
    description: "Horizontal scanlines",
    glslFunction: `
vec3 scanlines(vec2 uv, vec3 color1, vec3 color2, float count) {
    float s = sin(uv.y * count * 3.14159 * 2.0);
    s = s * 0.5 + 0.5;
    return mix(color1, color2, s);
}
`,
    glslCall: "scanlines(uv, {color1}, {color2}, {count})",
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
      count: {
        value: 50.0,
        type: "float",
        min: 10.0,
        max: 200.0,
        step: 1.0,
        label: "Count",
      },
    },
  },
  {
    id: "vignette",
    name: "Vignette",
    type: "shape",
    icon: <RadialGradientIcon className="w-6 h-6" />,
    description: "Vignette frame",
    glslFunction: `
vec3 vignette(vec2 uv, vec3 color, float radius, float softness) {
    float d = distance(uv, vec2(0.5));
    float v = smoothstep(radius, radius - softness, d);
    return color * (1.0 - v);
}
`,
    glslCall: "vignette(uv, {color}, {radius}, {softness})",
    defaultProperties: {
      color: {
        value: [0.0, 0.0, 0.0],
        type: "vec3",
        label: "Color",
      },
      radius: {
        value: 0.8,
        type: "float",
        min: 0.1,
        max: 1.5,
        step: 0.01,
        label: "Radius",
      },
      softness: {
        value: 0.4,
        type: "float",
        min: 0.0,
        max: 1.0,
        step: 0.01,
        label: "Softness",
      },
    },
  },
];
