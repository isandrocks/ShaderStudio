/**
 * Block Registry - Central registry of all available effect blocks
 */

import { EffectBlock } from "../types";
import { CIRCLE_TEMPLATE, RECTANGLE_TEMPLATE, RING_TEMPLATE, STAR_TEMPLATE } from "./templates/shapes";
import { WAVE_TEMPLATE, GRID_TEMPLATE, CHECKERBOARD_TEMPLATE, RADIAL_REPEAT_TEMPLATE } from "./templates/patterns";
import { SOLID_COLOR_TEMPLATE, GRADIENT_TEMPLATE, RAINBOW_TEMPLATE, HSV_ADJUST_TEMPLATE } from "./templates/colors";
import { MOVE_TEMPLATE, ROTATE_TEMPLATE, SCALE_TEMPLATE, DISTORT_TEMPLATE } from "./templates/transforms";
import { MIX_TEMPLATE, MULTIPLY_TEMPLATE, ADD_TEMPLATE, OVERLAY_TEMPLATE } from "./templates/blending";
import { GLOW_TEMPLATE, NOISE_TEMPLATE, RIPPLE_TEMPLATE } from "./templates/effects";

/**
 * Complete block library - 25 blocks across all categories
 */
export const BLOCK_REGISTRY: EffectBlock[] = [
  // ============================================================================
  // SHAPES
  // ============================================================================
  {
    id: "shape-circle",
    type: "shape",
    name: "Circle",
    description: "Creates a circular shape with soft edges",
    icon: "⭕",
    glslTemplate: CIRCLE_TEMPLATE,
    inputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
        defaultValue: "uv",
      },
      {
        id: "center",
        label: "Center",
        type: "vec2",
        defaultValue: [0.5, 0.5],
      },
      {
        id: "radius",
        label: "Radius",
        type: "float",
        defaultValue: 0.3,
      },
      {
        id: "softness",
        label: "Softness",
        type: "float",
        defaultValue: 0.01,
      },
    ],
    outputs: [
      {
        id: "shape",
        label: "Shape",
        type: "float",
      },
    ],
  },

  {
    id: "shape-rectangle",
    type: "shape",
    name: "Rectangle",
    description: "Creates a rectangular shape with rounded corners",
    icon: "⬜",
    glslTemplate: RECTANGLE_TEMPLATE,
    inputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
        defaultValue: "uv",
      },
      {
        id: "center",
        label: "Center",
        type: "vec2",
        defaultValue: [0.5, 0.5],
      },
      {
        id: "size",
        label: "Size",
        type: "vec2",
        defaultValue: [0.5, 0.3],
      },
      {
        id: "cornerRadius",
        label: "Corner Radius",
        type: "float",
        defaultValue: 0.05,
      },
    ],
    outputs: [
      {
        id: "shape",
        label: "Shape",
        type: "float",
      },
    ],
  },

  // ============================================================================
  // PATTERNS
  // ============================================================================
  {
    id: "pattern-wave",
    type: "pattern",
    name: "Wave",
    description: "Creates animated wave distortion",
    icon: "🌊",
    glslTemplate: WAVE_TEMPLATE,
    inputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
        defaultValue: "uv",
      },
      {
        id: "frequency",
        label: "Frequency",
        type: "float",
        defaultValue: 10.0,
      },
      {
        id: "amplitude",
        label: "Amplitude",
        type: "float",
        defaultValue: 0.1,
      },
      {
        id: "speed",
        label: "Speed",
        type: "float",
        defaultValue: 1.0,
      },
      {
        id: "direction",
        label: "Direction",
        type: "float",
        defaultValue: 0.0,
      },
    ],
    outputs: [
      {
        id: "wave",
        label: "Wave",
        type: "float",
      },
    ],
  },

  {
    id: "pattern-grid",
    type: "pattern",
    name: "Grid",
    description: "Creates a grid pattern",
    icon: "⊞",
    glslTemplate: GRID_TEMPLATE,
    inputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
        defaultValue: "uv",
      },
      {
        id: "cellSize",
        label: "Cell Size",
        type: "float",
        defaultValue: 0.1,
      },
      {
        id: "lineWidth",
        label: "Line Width",
        type: "float",
        defaultValue: 1.0,
      },
    ],
    outputs: [
      {
        id: "grid",
        label: "Grid",
        type: "float",
      },
    ],
  },

  // ============================================================================
  // COLORS
  // ============================================================================
  {
    id: "color-solid",
    type: "color",
    name: "Solid Color",
    description: "Outputs a solid color with alpha",
    icon: "🎨",
    glslTemplate: SOLID_COLOR_TEMPLATE,
    inputs: [
      {
        id: "color",
        label: "Color",
        type: "vec3",
        defaultValue: [1.0, 0.5, 0.0],
      },
      {
        id: "alpha",
        label: "Alpha",
        type: "float",
        defaultValue: 1.0,
      },
    ],
    outputs: [
      {
        id: "color",
        label: "Color",
        type: "vec4",
      },
    ],
  },

  {
    id: "color-gradient",
    type: "color",
    name: "Gradient",
    description: "Linear gradient between two colors",
    icon: "🌈",
    glslTemplate: GRADIENT_TEMPLATE,
    inputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
        defaultValue: "uv",
      },
      {
        id: "color1",
        label: "Color 1",
        type: "vec3",
        defaultValue: [0.0, 0.5, 1.0],
      },
      {
        id: "color2",
        label: "Color 2",
        type: "vec3",
        defaultValue: [1.0, 0.0, 0.5],
      },
      {
        id: "angle",
        label: "Angle",
        type: "float",
        defaultValue: 0.0,
      },
      {
        id: "position",
        label: "Position",
        type: "float",
        defaultValue: 0.0,
      },
    ],
    outputs: [
      {
        id: "color",
        label: "Color",
        type: "vec3",
      },
    ],
  },

  // ============================================================================
  // TRANSFORMS
  // ============================================================================
  {
    id: "transform-move",
    type: "transform",
    name: "Move",
    description: "Translates UV coordinates",
    icon: "↔️",
    glslTemplate: MOVE_TEMPLATE,
    inputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
        defaultValue: "uv",
      },
      {
        id: "xOffset",
        label: "X Offset",
        type: "float",
        defaultValue: 0.0,
      },
      {
        id: "yOffset",
        label: "Y Offset",
        type: "float",
        defaultValue: 0.0,
      },
    ],
    outputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
      },
    ],
  },

  {
    id: "transform-rotate",
    type: "transform",
    name: "Rotate",
    description: "Rotates UV coordinates around a center point",
    icon: "🔄",
    glslTemplate: ROTATE_TEMPLATE,
    inputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
        defaultValue: "uv",
      },
      {
        id: "center",
        label: "Center",
        type: "vec2",
        defaultValue: [0.5, 0.5],
      },
      {
        id: "angle",
        label: "Angle",
        type: "float",
        defaultValue: 0.0,
      },
    ],
    outputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
      },
    ],
  },

  // ============================================================================
  // BLENDING
  // ============================================================================
  {
    id: "blend-mix",
    type: "blend",
    name: "Mix",
    description: "Blends two values with adjustable amount",
    icon: "⚖️",
    glslTemplate: MIX_TEMPLATE,
    inputs: [
      {
        id: "layer1",
        label: "Layer 1",
        type: "vec3",
        defaultValue: [0.0, 0.0, 0.0],
      },
      {
        id: "layer2",
        label: "Layer 2",
        type: "vec3",
        defaultValue: [1.0, 1.0, 1.0],
      },
      {
        id: "amount",
        label: "Amount",
        type: "float",
        defaultValue: 0.5,
      },
    ],
    outputs: [
      {
        id: "result",
        label: "Result",
        type: "vec3",
      },
    ],
  },

  // ============================================================================
  // EFFECTS
  // ============================================================================
  {
    id: "effect-glow",
    type: "effect",
    name: "Glow",
    description: "Adds glow effect to color",
    icon: "✨",
    glslTemplate: GLOW_TEMPLATE,
    inputs: [
      {
        id: "color",
        label: "Color",
        type: "vec3",
        defaultValue: [1.0, 1.0, 1.0],
      },
      {
        id: "intensity",
        label: "Intensity",
        type: "float",
        defaultValue: 1.0,
      },
      {
        id: "size",
        label: "Size",
        type: "float",
        defaultValue: 0.5,
      },
    ],
    outputs: [
      {
        id: "color",
        label: "Color",
        type: "vec3",
      },
    ],
  },

  // Additional Shapes
  {
    id: "shape-ring",
    type: "shape",
    name: "Ring",
    description: "Creates a ring/donut shape",
    icon: "⭕",
    glslTemplate: RING_TEMPLATE,
    inputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
        defaultValue: "uv",
      },
      {
        id: "center",
        label: "Center",
        type: "vec2",
        defaultValue: [0.5, 0.5],
      },
      {
        id: "innerRadius",
        label: "Inner Radius",
        type: "float",
        defaultValue: 0.2,
      },
      {
        id: "outerRadius",
        label: "Outer Radius",
        type: "float",
        defaultValue: 0.3,
      },
      {
        id: "softness",
        label: "Softness",
        type: "float",
        defaultValue: 0.01,
      },
    ],
    outputs: [
      {
        id: "shape",
        label: "Shape",
        type: "float",
      },
    ],
  },

  {
    id: "shape-star",
    type: "shape",
    name: "Star",
    description: "Creates a star shape",
    icon: "⭐",
    glslTemplate: STAR_TEMPLATE,
    inputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
        defaultValue: "uv",
      },
      {
        id: "center",
        label: "Center",
        type: "vec2",
        defaultValue: [0.5, 0.5],
      },
      {
        id: "points",
        label: "Points",
        type: "float",
        defaultValue: 5.0,
      },
      {
        id: "size",
        label: "Size",
        type: "float",
        defaultValue: 0.3,
      },
      {
        id: "softness",
        label: "Softness",
        type: "float",
        defaultValue: 0.01,
      },
    ],
    outputs: [
      {
        id: "shape",
        label: "Shape",
        type: "float",
      },
    ],
  },

  // Additional Patterns
  {
    id: "pattern-checkerboard",
    type: "pattern",
    name: "Checkerboard",
    description: "Classic checkerboard pattern",
    icon: "▦",
    glslTemplate: CHECKERBOARD_TEMPLATE,
    inputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
        defaultValue: "uv",
      },
      {
        id: "scale",
        label: "Scale",
        type: "float",
        defaultValue: 8.0,
      },
      {
        id: "rotation",
        label: "Rotation",
        type: "float",
        defaultValue: 0.0,
      },
    ],
    outputs: [
      {
        id: "pattern",
        label: "Pattern",
        type: "float",
      },
    ],
  },

  // Additional Colors
  {
    id: "color-rainbow",
    type: "color",
    name: "Rainbow",
    description: "Animated rainbow colors",
    icon: "🌈",
    glslTemplate: RAINBOW_TEMPLATE,
    inputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
        defaultValue: "uv",
      },
      {
        id: "speed",
        label: "Speed",
        type: "float",
        defaultValue: 0.5,
      },
      {
        id: "saturation",
        label: "Saturation",
        type: "float",
        defaultValue: 1.0,
      },
    ],
    outputs: [
      {
        id: "color",
        label: "Color",
        type: "vec3",
      },
    ],
  },

  {
    id: "color-hsv-adjust",
    type: "color",
    name: "HSV Adjust",
    description: "Adjust hue, saturation, and value",
    icon: "🎨",
    glslTemplate: HSV_ADJUST_TEMPLATE,
    inputs: [
      {
        id: "color",
        label: "Color",
        type: "vec3",
        defaultValue: [1.0, 1.0, 1.0],
      },
      {
        id: "hueShift",
        label: "Hue Shift",
        type: "float",
        defaultValue: 0.0,
      },
      {
        id: "saturation",
        label: "Saturation",
        type: "float",
        defaultValue: 1.0,
      },
      {
        id: "brightness",
        label: "Brightness",
        type: "float",
        defaultValue: 1.0,
      },
    ],
    outputs: [
      {
        id: "color",
        label: "Color",
        type: "vec3",
      },
    ],
  },

  // Additional Transforms
  {
    id: "transform-scale",
    type: "transform",
    name: "Scale",
    description: "Scales UV coordinates",
    icon: "⤢",
    glslTemplate: SCALE_TEMPLATE,
    inputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
        defaultValue: "uv",
      },
      {
        id: "center",
        label: "Center",
        type: "vec2",
        defaultValue: [0.5, 0.5],
      },
      {
        id: "scaleX",
        label: "Scale X",
        type: "float",
        defaultValue: 1.0,
      },
      {
        id: "scaleY",
        label: "Scale Y",
        type: "float",
        defaultValue: 1.0,
      },
    ],
    outputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
      },
    ],
  },

  {
    id: "transform-distort",
    type: "transform",
    name: "Distort",
    description: "Wave-based distortion",
    icon: "〰️",
    glslTemplate: DISTORT_TEMPLATE,
    inputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
        defaultValue: "uv",
      },
      {
        id: "strength",
        label: "Strength",
        type: "float",
        defaultValue: 0.1,
      },
      {
        id: "frequency",
        label: "Frequency",
        type: "float",
        defaultValue: 5.0,
      },
    ],
    outputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
      },
    ],
  },

  // Additional Blending
  {
    id: "blend-multiply",
    type: "blend",
    name: "Multiply",
    description: "Multiplies two values",
    icon: "✖️",
    glslTemplate: MULTIPLY_TEMPLATE,
    inputs: [
      {
        id: "layer1",
        label: "Layer 1",
        type: "vec3",
        defaultValue: [1.0, 1.0, 1.0],
      },
      {
        id: "layer2",
        label: "Layer 2",
        type: "vec3",
        defaultValue: [1.0, 1.0, 1.0],
      },
    ],
    outputs: [
      {
        id: "result",
        label: "Result",
        type: "vec3",
      },
    ],
  },

  {
    id: "blend-add",
    type: "blend",
    name: "Add",
    description: "Adds two values together",
    icon: "➕",
    glslTemplate: ADD_TEMPLATE,
    inputs: [
      {
        id: "layer1",
        label: "Layer 1",
        type: "vec3",
        defaultValue: [0.0, 0.0, 0.0],
      },
      {
        id: "layer2",
        label: "Layer 2",
        type: "vec3",
        defaultValue: [0.0, 0.0, 0.0],
      },
    ],
    outputs: [
      {
        id: "result",
        label: "Result",
        type: "vec3",
      },
    ],
  },

  {
    id: "blend-overlay",
    type: "blend",
    name: "Overlay",
    description: "Overlay blend mode",
    icon: "🔀",
    glslTemplate: OVERLAY_TEMPLATE,
    inputs: [
      {
        id: "base",
        label: "Base",
        type: "vec3",
        defaultValue: [0.5, 0.5, 0.5],
      },
      {
        id: "blend",
        label: "Blend",
        type: "vec3",
        defaultValue: [0.5, 0.5, 0.5],
      },
    ],
    outputs: [
      {
        id: "result",
        label: "Result",
        type: "vec3",
      },
    ],
  },

  // Additional Effects
  {
    id: "effect-noise",
    type: "effect",
    name: "Noise",
    description: "Random noise texture",
    icon: "📺",
    glslTemplate: NOISE_TEMPLATE,
    inputs: [
      {
        id: "p",
        label: "Position",
        type: "vec2",
        defaultValue: "uv",
      },
      {
        id: "scale",
        label: "Scale",
        type: "float",
        defaultValue: 10.0,
      },
      {
        id: "speed",
        label: "Speed",
        type: "float",
        defaultValue: 0.1,
      },
    ],
    outputs: [
      {
        id: "noise",
        label: "Noise",
        type: "float",
      },
    ],
  },

  {
    id: "effect-ripple",
    type: "effect",
    name: "Ripple",
    description: "Concentric ripple effect",
    icon: "〰️",
    glslTemplate: RIPPLE_TEMPLATE,
    inputs: [
      {
        id: "uv",
        label: "UV",
        type: "vec2",
        defaultValue: "uv",
      },
      {
        id: "center",
        label: "Center",
        type: "vec2",
        defaultValue: [0.5, 0.5],
      },
      {
        id: "frequency",
        label: "Frequency",
        type: "float",
        defaultValue: 20.0,
      },
      {
        id: "amplitude",
        label: "Amplitude",
        type: "float",
        defaultValue: 0.1,
      },
      {
        id: "speed",
        label: "Speed",
        type: "float",
        defaultValue: 2.0,
      },
    ],
    outputs: [
      {
        id: "ripple",
        label: "Ripple",
        type: "float",
      },
    ],
  },
];

/**
 * Get block definition by ID
 */
export function getBlockById(id: string): EffectBlock | undefined {
  return BLOCK_REGISTRY.find((block) => block.id === id);
}

/**
 * Get blocks by category
 */
export function getBlocksByCategory(
  category: EffectBlock["type"]
): EffectBlock[] {
  return BLOCK_REGISTRY.filter((block) => block.type === category);
}

/**
 * Get all block categories
 */
export function getBlockCategories(): EffectBlock["type"][] {
  const categories = new Set(BLOCK_REGISTRY.map((block) => block.type));
  return Array.from(categories);
}
