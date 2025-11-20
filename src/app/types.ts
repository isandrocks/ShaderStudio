/**
 * Shared type definitions for the GLSL Shader Plugin
 */

// ============================================================================
// Uniform Types
// ============================================================================

export type UniformType = "float" | "vec3" | "vec4";

export type UniformValue =
  | number // float
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
  | "saved-shaders";
