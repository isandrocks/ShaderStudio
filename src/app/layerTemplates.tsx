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
vec4 linearGradient(vec2 uv, vec3 color1, vec3 color2, float angle, float alpha) {
    float rad = radians(angle);
    vec2 dir = vec2(cos(rad), sin(rad));
    float t = dot(uv - 0.5, dir) + 0.5;
    vec3 col = mix(color1, color2, clamp(t, 0.0, 1.0));
    return vec4(col, alpha);
}
`,
    glslCall: "linearGradient(uv, {color1}, {color2}, {angle}, {alpha})",
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
      alpha: {
        value: 1.0,
        type: "float",
        min: 0,
        max: 1,
        step: 0.01,
        label: "Alpha",
      },
    },
  },
  {
    id: "linear-gradient-3",
    name: "Linear Gradient (3)",
    type: "gradient",
    icon: <LinearGradientIcon className="w-6 h-6" />,
    description: "Three-color linear gradient",
    glslFunction: `
vec4 linearGradient3(vec2 uv, vec3 color1, vec3 color2, vec3 color3, float angle, float alpha) {
    float rad = radians(angle);
    vec2 dir = vec2(cos(rad), sin(rad));
    float t = dot(uv - 0.5, dir) + 0.5;
    t = clamp(t, 0.0, 1.0);
    
    vec3 col;
    if (t < 0.5) {
        col = mix(color1, color2, t * 2.0);
    } else {
        col = mix(color2, color3, (t - 0.5) * 2.0);
    }
    return vec4(col, alpha);
}
`,
    glslCall: "linearGradient3(uv, {color1}, {color2}, {color3}, {angle}, {alpha})",
    defaultProperties: {
      color1: {
        value: [0.1, 0.3, 0.8],
        type: "vec3",
        label: "Start Color",
      },
      color2: {
        value: [0.5, 0.8, 0.3],
        type: "vec3",
        label: "Middle Color",
      },
      color3: {
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
      alpha: {
        value: 1.0,
        type: "float",
        min: 0,
        max: 1,
        step: 0.01,
        label: "Alpha",
      },
    },
  },
  {
    id: "linear-gradient-4",
    name: "Linear Gradient (4)",
    type: "gradient",
    icon: <LinearGradientIcon className="w-6 h-6" />,
    description: "Four-color linear gradient",
    glslFunction: `
vec4 linearGradient4(vec2 uv, vec3 color1, vec3 color2, vec3 color3, vec3 color4, float angle, float alpha) {
    float rad = radians(angle);
    vec2 dir = vec2(cos(rad), sin(rad));
    float t = dot(uv - 0.5, dir) + 0.5;
    t = clamp(t, 0.0, 1.0);
    
    vec3 col;
    if (t < 0.333) {
        col = mix(color1, color2, t * 3.0);
    } else if (t < 0.666) {
        col = mix(color2, color3, (t - 0.333) * 3.0);
    } else {
        col = mix(color3, color4, (t - 0.666) * 3.0);
    }
    return vec4(col, alpha);
}
`,
    glslCall: "linearGradient4(uv, {color1}, {color2}, {color3}, {color4}, {angle}, {alpha})",
    defaultProperties: {
      color1: {
        value: [0.1, 0.3, 0.8],
        type: "vec3",
        label: "Color 1",
      },
      color2: {
        value: [0.3, 0.7, 0.9],
        type: "vec3",
        label: "Color 2",
      },
      color3: {
        value: [0.9, 0.7, 0.3],
        type: "vec3",
        label: "Color 3",
      },
      color4: {
        value: [0.9, 0.2, 0.5],
        type: "vec3",
        label: "Color 4",
      },
      angle: {
        value: 45.0,
        type: "float",
        min: 0,
        max: 360,
        step: 1,
        label: "Angle",
      },
      alpha: {
        value: 1.0,
        type: "float",
        min: 0,
        max: 1,
        step: 0.01,
        label: "Alpha",
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
vec4 radialGradient(vec2 uv, vec3 centerColor, vec3 outerColor, float radius, vec2 center, float alpha) {
    float d = distance(uv, center);
    float t = smoothstep(0.0, radius, d);
    vec3 col = mix(centerColor, outerColor, clamp(t, 0.0, 1.0));
    return vec4(col, alpha);
}
`,
    glslCall:
      "radialGradient(uv, {centerColor}, {outerColor}, {radius}, {center}.xy, {alpha})",
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
      alpha: {
        value: 1.0,
        type: "float",
        min: 0,
        max: 1,
        step: 0.01,
        label: "Alpha",
      },
    },
  },
  {
    id: "radial-gradient-3",
    name: "Radial Gradient (3)",
    type: "gradient",
    icon: <RadialGradientIcon className="w-6 h-6" />,
    description: "Three-color circular gradient",
    glslFunction: `
vec4 radialGradient3(vec2 uv, vec3 centerColor, vec3 midColor, vec3 outerColor, float radius, vec2 center, float alpha) {
    float d = distance(uv, center);
    float t = smoothstep(0.0, radius, d);
    t = clamp(t, 0.0, 1.0);
    
    vec3 col;
    if (t < 0.5) {
        col = mix(centerColor, midColor, t * 2.0);
    } else {
        col = mix(midColor, outerColor, (t - 0.5) * 2.0);
    }
    return vec4(col, alpha);
}
`,
    glslCall: "radialGradient3(uv, {centerColor}, {midColor}, {outerColor}, {radius}, {center}.xy, {alpha})",
    defaultProperties: {
      centerColor: {
        value: [1.0, 0.8, 0.2],
        type: "vec3",
        label: "Center Color",
      },
      midColor: {
        value: [0.9, 0.4, 0.6],
        type: "vec3",
        label: "Mid Color",
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
      alpha: {
        value: 1.0,
        type: "float",
        min: 0,
        max: 1,
        step: 0.01,
        label: "Alpha",
      },
    },
  },
  {
    id: "radial-gradient-4",
    name: "Radial Gradient (4)",
    type: "gradient",
    icon: <RadialGradientIcon className="w-6 h-6" />,
    description: "Four-color circular gradient",
    glslFunction: `
vec4 radialGradient4(vec2 uv, vec3 color1, vec3 color2, vec3 color3, vec3 color4, float radius, vec2 center, float alpha) {
    float d = distance(uv, center);
    float t = smoothstep(0.0, radius, d);
    t = clamp(t, 0.0, 1.0);
    
    vec3 col;
    if (t < 0.333) {
        col = mix(color1, color2, t * 3.0);
    } else if (t < 0.666) {
        col = mix(color2, color3, (t - 0.333) * 3.0);
    } else {
        col = mix(color3, color4, (t - 0.666) * 3.0);
    }
    return vec4(col, alpha);
}
`,
    glslCall: "radialGradient4(uv, {color1}, {color2}, {color3}, {color4}, {radius}, {center}.xy, {alpha})",
    defaultProperties: {
      color1: {
        value: [1.0, 0.8, 0.2],
        type: "vec3",
        label: "Color 1",
      },
      color2: {
        value: [0.9, 0.5, 0.3],
        type: "vec3",
        label: "Color 2",
      },
      color3: {
        value: [0.5, 0.3, 0.7],
        type: "vec3",
        label: "Color 3",
      },
      color4: {
        value: [0.2, 0.1, 0.4],
        type: "vec3",
        label: "Color 4",
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
      alpha: {
        value: 1.0,
        type: "float",
        min: 0,
        max: 1,
        step: 0.01,
        label: "Alpha",
      },
    },
  },
  {
    id: "reflected-gradient",
    name: "Reflected Gradient",
    type: "gradient",
    icon: <LinearGradientIcon className="w-6 h-6" />,
    description: "Mirrored linear gradient from center",
    glslFunction: `
vec4 reflectedGradient(vec2 uv, vec3 color1, vec3 color2, float angle, vec2 offset, float spread, float alpha) {
    vec2 adjustedUv = uv - (offset * 2.0 - 1.0);
    float rad = radians(angle);
    vec2 dir = vec2(cos(rad), sin(rad));
    float t = dot(adjustedUv - 0.5, dir) + 0.5;
    t = abs(t - 0.5) * 2.0;
    t = t / (1.0 - spread);
    vec3 col = mix(color1, color2, clamp(t, 0.0, 1.0));
    return vec4(col, alpha);
}
`,
    glslCall: "reflectedGradient(uv, {color1}, {color2}, {angle}, {offset}, {spread}, {alpha})",
    defaultProperties: {
      color1: {
        value: [0.2, 0.6, 1.0],
        type: "vec3",
        label: "Center Color",
      },
      color2: {
        value: [0.8, 0.1, 0.3],
        type: "vec3",
        label: "Edge Color",
      },
      angle: {
        value: 0.0,
        type: "float",
        min: 0,
        max: 360,
        step: 1,
        label: "Angle",
      },
      offset: {
        value: [0.5, 0.5],
        type: "vec2",
        label: "Offset",
      },
      spread: {
        value: 0.0,
        type: "float",
        min: -0.9,
        max: 0.95,
        step: 0.01,
        label: "Spread",
      },
      alpha: {
        value: 1.0,
        type: "float",
        min: 0,
        max: 1,
        step: 0.01,
        label: "Alpha",
      },
    },
  },
  {
    id: "reflected-gradient-3",
    name: "Reflected Gradient (3)",
    type: "gradient",
    icon: <LinearGradientIcon className="w-6 h-6" />,
    description: "Three-color mirrored gradient",
    glslFunction: `
vec4 reflectedGradient3(vec2 uv, vec3 color1, vec3 color2, vec3 color3, float angle, vec2 offset, float spread, float alpha) {
    vec2 adjustedUv = uv - (offset * 2.0 - 1.0);
    float rad = radians(angle);
    vec2 dir = vec2(cos(rad), sin(rad));
    float t = dot(adjustedUv - 0.5, dir) + 0.5;
    t = abs(t - 0.5) * 2.0;
    t = t / (1.0 - spread);
    t = clamp(t, 0.0, 1.0);
    
    vec3 col;
    if (t < 0.5) {
        col = mix(color1, color2, t * 2.0);
    } else {
        col = mix(color2, color3, (t - 0.5) * 2.0);
    }
    return vec4(col, alpha);
}
`,
    glslCall: "reflectedGradient3(uv, {color1}, {color2}, {color3}, {angle}, {offset}, {spread}, {alpha})",
    defaultProperties: {
      color1: {
        value: [0.2, 0.6, 1.0],
        type: "vec3",
        label: "Center Color",
      },
      color2: {
        value: [0.9, 0.5, 0.2],
        type: "vec3",
        label: "Mid Color",
      },
      color3: {
        value: [0.8, 0.1, 0.3],
        type: "vec3",
        label: "Edge Color",
      },
      angle: {
        value: 0.0,
        type: "float",
        min: 0,
        max: 360,
        step: 1,
        label: "Angle",
      },
      offset: {
        value: [0.5, 0.5],
        type: "vec2",
        label: "Offset",
      },
      spread: {
        value: 0.0,
        type: "float",
        min: -0.9,
        max: 0.95,
        step: 0.01,
        label: "Spread",
      },
      alpha: {
        value: 1.0,
        type: "float",
        min: 0,
        max: 1,
        step: 0.01,
        label: "Alpha",
      },
    },
  },
  {
    id: "reflected-gradient-4",
    name: "Reflected Gradient (4)",
    type: "gradient",
    icon: <LinearGradientIcon className="w-6 h-6" />,
    description: "Four-color mirrored gradient",
    glslFunction: `
vec4 reflectedGradient4(vec2 uv, vec3 color1, vec3 color2, vec3 color3, vec3 color4, float angle, vec2 offset, float spread, float alpha) {
    vec2 adjustedUv = uv - (offset * 2.0 - 1.0);
    float rad = radians(angle);
    vec2 dir = vec2(cos(rad), sin(rad));
    float t = dot(adjustedUv - 0.5, dir) + 0.5;
    t = abs(t - 0.5) * 2.0;
    t = t / (1.0 - spread);
    t = clamp(t, 0.0, 1.0);
    
    vec3 col;
    if (t < 0.333) {
        col = mix(color1, color2, t * 3.0);
    } else if (t < 0.666) {
        col = mix(color2, color3, (t - 0.333) * 3.0);
    } else {
        col = mix(color3, color4, (t - 0.666) * 3.0);
    }
    return vec4(col, alpha);
}
`,
    glslCall: "reflectedGradient4(uv, {color1}, {color2}, {color3}, {color4}, {angle}, {offset}, {spread}, {alpha})",
    defaultProperties: {
      color1: {
        value: [0.2, 0.6, 1.0],
        type: "vec3",
        label: "Color 1",
      },
      color2: {
        value: [0.5, 0.9, 0.7],
        type: "vec3",
        label: "Color 2",
      },
      color3: {
        value: [0.9, 0.7, 0.3],
        type: "vec3",
        label: "Color 3",
      },
      color4: {
        value: [0.8, 0.1, 0.3],
        type: "vec3",
        label: "Color 4",
      },
      angle: {
        value: 0.0,
        type: "float",
        min: 0,
        max: 360,
        step: 1,
        label: "Angle",
      },
      offset: {
        value: [0.5, 0.5],
        type: "vec2",
        label: "Offset",
      },
      spread: {
        value: 0.0,
        type: "float",
        min: -0.9,
        max: 0.95,
        step: 0.01,
        label: "Spread",
      },
      alpha: {
        value: 1.0,
        type: "float",
        min: 0,
        max: 1,
        step: 0.01,
        label: "Alpha",
      },
    },
  },
  {
    id: "diamond-gradient",
    name: "Diamond Gradient",
    type: "gradient",
    icon: <RadialGradientIcon className="w-6 h-6" />,
    description: "Star/polygon gradient with adjustable points",
    glslFunction: `
vec4 diamondGradient(vec2 uv, vec3 centerColor, vec3 edgeColor, vec2 center, float size, float rotation, float points, float softness, float alpha) {
    vec2 pos = uv - center;
    
    float rad = radians(rotation);
    float s = sin(rad);
    float c = cos(rad);
    pos = mat2(c, -s, s, c) * pos;
    
    float angle = atan(pos.y, pos.x);
    float radius = length(pos);
    
    float n = floor(points + 0.5);
    
    float angleSegment = 6.283185307 / n;
    float a = mod(angle + angleSegment / 2.0, angleSegment) - angleSegment / 2.0;
    
    float d = radius * cos(a * n / 2.0) / size;
    
    float t = smoothstep(0.0, 1.0 + softness, d);
    
    vec3 col = mix(centerColor, edgeColor, clamp(t, 0.0, 1.0));
    return vec4(col, alpha);
}
`,
    glslCall: "diamondGradient(uv, {centerColor}, {edgeColor}, {center}, {size}, {rotation}, {points}, {softness}, {alpha})",
    defaultProperties: {
      centerColor: {
        value: [1.0, 0.9, 0.2],
        type: "vec3",
        label: "Center Color",
      },
      edgeColor: {
        value: [0.3, 0.1, 0.6],
        type: "vec3",
        label: "Edge Color",
      },
      center: {
        value: [0.5, 0.5],
        type: "vec2",
        label: "Center",
      },
      size: {
        value: 0.7,
        type: "float",
        min: 0.1,
        max: 2.0,
        step: 0.01,
        label: "Size",
      },
      rotation: {
        value: 0.0,
        type: "float",
        min: 0,
        max: 360,
        step: 1,
        label: "Rotation",
      },
      points: {
        value: 4.0,
        type: "float",
        min: 3.0,
        max: 10.0,
        step: 1.0,
        label: "Points",
      },
      softness: {
        value: 0.3,
        type: "float",
        min: 0.0,
        max: 2.0,
        step: 0.01,
        label: "Softness",
      },
      alpha: {
        value: 1.0,
        type: "float",
        min: 0,
        max: 1,
        step: 0.01,
        label: "Alpha",
      },
    },
  },
  {
    id: "diamond-gradient-3",
    name: "Diamond Gradient (3)",
    type: "gradient",
    icon: <RadialGradientIcon className="w-6 h-6" />,
    description: "Three-color star/polygon gradient",
    glslFunction: `
vec4 diamondGradient3(vec2 uv, vec3 centerColor, vec3 midColor, vec3 edgeColor, vec2 center, float size, float rotation, float points, float softness, float alpha) {
    vec2 pos = uv - center;
    
    float rad = radians(rotation);
    float s = sin(rad);
    float c = cos(rad);
    pos = mat2(c, -s, s, c) * pos;
    
    float angle = atan(pos.y, pos.x);
    float radius = length(pos);
    float n = floor(points + 0.5);
    float angleSegment = 6.283185307 / n;
    float a = mod(angle + angleSegment / 2.0, angleSegment) - angleSegment / 2.0;
    float d = radius * cos(a * n / 2.0) / size;
    float t = smoothstep(0.0, 1.0 + softness, d);
    
    vec3 col;
    if (t < 0.5) {
        col = mix(centerColor, midColor, t * 2.0);
    } else {
        col = mix(midColor, edgeColor, (t - 0.5) * 2.0);
    }
    return vec4(col, alpha);
}
`,
    glslCall: "diamondGradient3(uv, {centerColor}, {midColor}, {edgeColor}, {center}, {size}, {rotation}, {points}, {softness}, {alpha})",
    defaultProperties: {
      centerColor: {
        value: [1.0, 0.9, 0.2],
        type: "vec3",
        label: "Center Color",
      },
      midColor: {
        value: [0.9, 0.4, 0.5],
        type: "vec3",
        label: "Mid Color",
      },
      edgeColor: {
        value: [0.3, 0.1, 0.6],
        type: "vec3",
        label: "Edge Color",
      },
      center: {
        value: [0.5, 0.5],
        type: "vec2",
        label: "Center",
      },
      size: {
        value: 0.7,
        type: "float",
        min: 0.1,
        max: 2.0,
        step: 0.01,
        label: "Size",
      },
      rotation: {
        value: 0.0,
        type: "float",
        min: 0,
        max: 360,
        step: 1,
        label: "Rotation",
      },
      points: {
        value: 4.0,
        type: "float",
        min: 3.0,
        max: 10.0,
        step: 1.0,
        label: "Points",
      },
      softness: {
        value: 0.3,
        type: "float",
        min: 0.0,
        max: 2.0,
        step: 0.01,
        label: "Softness",
      },
      alpha: {
        value: 1.0,
        type: "float",
        min: 0,
        max: 1,
        step: 0.01,
        label: "Alpha",
      },
    },
  },
  {
    id: "diamond-gradient-4",
    name: "Diamond Gradient (4)",
    type: "gradient",
    icon: <RadialGradientIcon className="w-6 h-6" />,
    description: "Four-color star/polygon gradient",
    glslFunction: `
vec4 diamondGradient4(vec2 uv, vec3 color1, vec3 color2, vec3 color3, vec3 color4, vec2 center, float size, float rotation, float points, float softness, float alpha) {
    vec2 pos = uv - center;
    
    float rad = radians(rotation);
    float s = sin(rad);
    float c = cos(rad);
    pos = mat2(c, -s, s, c) * pos;
    
    float angle = atan(pos.y, pos.x);
    float radius = length(pos);
    float n = floor(points + 0.5);
    float angleSegment = 6.283185307 / n;
    float a = mod(angle + angleSegment / 2.0, angleSegment) - angleSegment / 2.0;
    float d = radius * cos(a * n / 2.0) / size;
    float t = smoothstep(0.0, 1.0 + softness, d);
    
    vec3 col;
    if (t < 0.333) {
        col = mix(color1, color2, t * 3.0);
    } else if (t < 0.666) {
        col = mix(color2, color3, (t - 0.333) * 3.0);
    } else {
        col = mix(color3, color4, (t - 0.666) * 3.0);
    }
    return vec4(col, alpha);
}
`,
    glslCall: "diamondGradient4(uv, {color1}, {color2}, {color3}, {color4}, {center}, {size}, {rotation}, {points}, {softness}, {alpha})",
    defaultProperties: {
      color1: {
        value: [1.0, 0.9, 0.2],
        type: "vec3",
        label: "Color 1",
      },
      color2: {
        value: [0.9, 0.5, 0.3],
        type: "vec3",
        label: "Color 2",
      },
      color3: {
        value: [0.7, 0.3, 0.8],
        type: "vec3",
        label: "Color 3",
      },
      color4: {
        value: [0.3, 0.1, 0.6],
        type: "vec3",
        label: "Color 4",
      },
      center: {
        value: [0.5, 0.5],
        type: "vec2",
        label: "Center",
      },
      size: {
        value: 0.7,
        type: "float",
        min: 0.1,
        max: 2.0,
        step: 0.01,
        label: "Size",
      },
      rotation: {
        value: 0.0,
        type: "float",
        min: 0,
        max: 360,
        step: 1,
        label: "Rotation",
      },
      points: {
        value: 4.0,
        type: "float",
        min: 3.0,
        max: 10.0,
        step: 1.0,
        label: "Points",
      },
      softness: {
        value: 0.3,
        type: "float",
        min: 0.0,
        max: 2.0,
        step: 0.01,
        label: "Softness",
      },
      alpha: {
        value: 1.0,
        type: "float",
        min: 0,
        max: 1,
        step: 0.01,
        label: "Alpha",
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
vec4 circleShape(vec2 uv, vec3 color, float radius, vec2 center, float softness) {
    float d = distance(uv, center);
    float alpha = 1.0 - smoothstep(radius - softness, radius, d);
    return vec4(color, alpha);
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
  {
    id: "inverted-circle",
    name: "Inverted Circle",
    type: "shape",
    icon: <CircleIcon className="w-6 h-6" />,
    description: "Circle punch-out / frame effect",
    glslFunction: `
vec4 invertedCircleShape(vec2 uv, vec3 color, float radius, vec2 center, float softness) {
    float d = distance(uv, center);
    float alpha = smoothstep(radius - softness, radius, d);
    return vec4(color, alpha);
}
`,
    glslCall: "invertedCircleShape(uv, {color}, {radius}, {center}, {softness})",
    defaultProperties: {
      color: {
        value: [0.0, 0.0, 0.0],
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
  {
    id: "polygon",
    name: "Polygon",
    type: "shape",
    icon: <RectangleIcon className="w-6 h-6" />,
    description: "Polygon shape with adjustable sides",
    glslFunction: `
vec4 polygonShape(vec2 uv, vec3 color, float sides, float radius, vec2 center, float rotation, float softness) {
    vec2 pos = uv - center;
    
    float rad = radians(rotation);
    float s = sin(rad);
    float c = cos(rad);
    pos = mat2(c, -s, s, c) * pos;
    
    float angle = atan(pos.y, pos.x);
    float dist = length(pos);
    
    float n = floor(sides + 0.5);
    float angleStep = 6.283185307 / n;
    float a = mod(angle + angleStep / 2.0, angleStep) - angleStep / 2.0;
    
    float r = radius * cos(angleStep / 2.0) / cos(a);
    
    float alpha = 1.0 - smoothstep(r - softness, r, dist);
    return vec4(color, alpha);
}
`,
    glslCall: "polygonShape(uv, {color}, {sides}, {radius}, {center}, {rotation}, {softness})",
    defaultProperties: {
      color: {
        value: [1.0, 1.0, 1.0],
        type: "vec3",
        label: "Color",
      },
      sides: {
        value: 3.0,
        type: "float",
        min: 3.0,
        max: 12.0,
        step: 1.0,
        label: "Sides",
      },
      radius: {
        value: 0.3,
        type: "float",
        min: 0.0,
        max: 1.0,
        step: 0.01,
        label: "Radius",
      },
      center: {
        value: [0.5, 0.5],
        type: "vec2",
        label: "Center",
      },
      rotation: {
        value: 0.0,
        type: "float",
        min: 0,
        max: 360,
        step: 1,
        label: "Rotation",
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
  {
    id: "inverted-polygon",
    name: "Inverted Polygon",
    type: "shape",
    icon: <RectangleIcon className="w-6 h-6" />,
    description: "Polygon punch-out / frame effect",
    glslFunction: `
vec4 invertedPolygonShape(vec2 uv, vec3 color, float sides, float radius, vec2 center, float rotation, float softness) {
    vec2 pos = uv - center;
    
    float rad = radians(rotation);
    float s = sin(rad);
    float c = cos(rad);
    pos = mat2(c, -s, s, c) * pos;
    
    float angle = atan(pos.y, pos.x);
    float dist = length(pos);
    
    float n = floor(sides + 0.5);
    float angleStep = 6.283185307 / n;
    float a = mod(angle + angleStep / 2.0, angleStep) - angleStep / 2.0;
    
    float r = radius * cos(angleStep / 2.0) / cos(a);
    
    float alpha = smoothstep(r - softness, r, dist);
    return vec4(color, alpha);
}
`,
    glslCall: "invertedPolygonShape(uv, {color}, {sides}, {radius}, {center}, {rotation}, {softness})",
    defaultProperties: {
      color: {
        value: [0.0, 0.0, 0.0],
        type: "vec3",
        label: "Color",
      },
      sides: {
        value: 3.0,
        type: "float",
        min: 3.0,
        max: 12.0,
        step: 1.0,
        label: "Sides",
      },
      radius: {
        value: 0.3,
        type: "float",
        min: 0.0,
        max: 1.0,
        step: 0.01,
        label: "Radius",
      },
      center: {
        value: [0.5, 0.5],
        type: "vec2",
        label: "Center",
      },
      rotation: {
        value: 0.0,
        type: "float",
        min: 0,
        max: 360,
        step: 1,
        label: "Rotation",
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
vec4 checkerboard(vec2 uv, vec3 color1, vec3 color2, float scale, float alpha) {
    vec2 pos = floor(uv * scale);
    float pattern = mod(pos.x + pos.y, 2.0);
    vec3 col = mix(color1, color2, pattern);
    return vec4(col, alpha);
}
`,
    glslCall: "checkerboard(uv, {color1}, {color2}, {scale}, {alpha})",
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
      alpha: {
        value: 1.0,
        type: "float",
        min: 0,
        max: 1,
        step: 0.01,
        label: "Alpha",
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

vec4 noisePattern(vec2 uv, vec3 color, float scale, float time, float alpha) {
    vec2 pos = uv * scale;
    float n = random(floor(pos) + time * 0.1); 
    return vec4(color * n, alpha);
}
`,
    glslCall: "noisePattern(uv, {color}, {scale}, iTime, {alpha})",
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
      alpha: {
        value: 1.0,
        type: "float",
        min: 0,
        max: 1,
        step: 0.01,
        label: "Alpha",
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
vec4 plasmaPattern(vec2 uv, vec3 color, float scale, float spin, float time, float alpha) {
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
    return vec4(rColor, alpha);
}
`,
    glslCall: "plasmaPattern(uv, {color}, {scale}, {spin}, iTime, {alpha})",
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
      alpha: {
        value: 1.0,
        type: "float",
        min: 0,
        max: 1,
        step: 0.01,
        label: "Alpha",
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
vec4 gridPattern(vec2 uv, vec3 color1, vec3 color2, float scale, float thickness, float alpha) {
    vec2 grid = fract(uv * scale);
    float line = step(thickness, grid.x) * step(thickness, grid.y);
    vec3 col = mix(color1, color2, line);
    return vec4(col, alpha);
}
`,
    glslCall: "gridPattern(uv, {color1}, {color2}, {scale}, {thickness}, {alpha})",
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
      alpha: {
        value: 1.0,
        type: "float",
        min: 0,
        max: 1,
        step: 0.01,
        label: "Alpha",
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
vec4 scanlines(vec2 uv, vec3 color1, vec3 color2, float count, float alpha) {
    float s = sin(uv.y * count * 3.14159 * 2.0);
    s = s * 0.5 + 0.5;
    vec3 col = mix(color1, color2, s);
    return vec4(col, alpha);
}
`,
    glslCall: "scanlines(uv, {color1}, {color2}, {count}, {alpha})",
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
      alpha: {
        value: 1.0,
        type: "float",
        min: 0,
        max: 1,
        step: 0.01,
        label: "Alpha",
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
vec4 vignette(vec2 uv, vec3 color, float radius, float softness) {
    float d = distance(uv, vec2(0.5));
    float alpha = 1.0 - smoothstep(radius, radius - softness, d);
    return vec4(color, alpha);
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
