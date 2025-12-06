/**
 * Shared type definitions for the GLSL Shader Plugin
 */

// ============================================================================
// Uniform Types
// ============================================================================

export type UniformType = "float" | "vec2" | "vec3" | "vec4";

export type UniformValue =
  | number // float
  | [number, number] // vec2
  | [number, number, number] // vec3 (RGB)
  | [number, number, number, number]; // vec4 (RGBA)

export interface DynamicUniform {
  id: string;
  name: string;
  type: UniformType;
  value: UniformValue;
  min: number;
  max: number;
  step: number;
}

// ============================================================================
// Shader State
// ============================================================================

export interface ShaderState {
  gl: WebGLRenderingContext | null;
  program: WebGLProgram | null;
  uniforms: {
    position?: number;
    resolution?: WebGLUniformLocation | null;
    time?: WebGLUniformLocation | null;
  };
  dynamicUniforms: Record<string, WebGLUniformLocation | null>;
}

export interface ShaderParams {
  paused: boolean;
  pausedTime: number;
  dynamicUniforms?: DynamicUniform[];
}

// ============================================================================
// Saved Shader
// ============================================================================

export interface SavedShader {
  id: string;
  name: string;
  description?: string;
  fragmentShader: string;
  dynamicUniforms: DynamicUniform[];
  layers?: EffectLayer[];
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
}

// ============================================================================
// Modal Types
// ============================================================================

export type ModalType =
  | "none"
  | "shader"
  | "config"
  | "presets"
  | "save"
  | "saved-shaders"
  | "ai-generation";

// ============================================================================
// Layer-Based Builder Types
// ============================================================================

export type BlendMode = "normal" | "multiply" | "screen" | "overlay" | "add";

export type EffectType = "shape" | "pattern" | "gradient" | "effect";

export interface EffectLayer {
  id: string;
  name: string;
  type: EffectType;
  effectId: string; // ID of the template used (e.g., "circle", "wave")
  visible: boolean;
  opacity: number; // 0-1
  blendMode: BlendMode;
  // Properties specific to this effect instance
  // These map to uniforms but are stored here for the UI
  properties: Record<string, UniformValue>;
}

export interface EffectTemplate {
  id: string;
  name: string;
  type: EffectType;
  icon: React.ReactNode; // Icon component
  description: string;
  // GLSL function definition to inject
  glslFunction: string;
  // How to call the function: "myEffect(uv, {prop1}, {prop2})"
  glslCall: string;
  // Default properties for this effect
  defaultProperties: Record<
    string,
    {
      value: UniformValue;
      type: UniformType;
      min?: number;
      max?: number;
      step?: number;
      label: string;
    }
  >;
}
