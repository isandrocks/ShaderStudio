/**
 * Shared type definitions for the GLSL Shader Plugin
 */

// ============================================================================
// Uniform Types
// ============================================================================

export type UniformType = "float" | "vec3" | "vec4";

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
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  blockGraph?: BlockInstance[]; // Optional: stores visual block builder state
}

// ============================================================================
// Block System Types
// ============================================================================

export type BlockCategory = "shape" | "pattern" | "transform" | "color" | "blend" | "effect";

export type BlockValueType = "float" | "vec2" | "vec3" | "vec4" | "coordinate" | "color";

export interface BlockInput {
  id: string;
  label: string;
  type: BlockValueType;
  defaultValue: UniformValue | string; // Constant value or uniform reference
  connectedTo?: string; // ID of connected output (blockId:outputId)
}

export interface BlockOutput {
  id: string;
  label: string;
  type: BlockValueType;
}

export interface EffectBlock {
  id: string;
  type: BlockCategory;
  name: string;
  description: string;
  icon: string;
  glslTemplate: string; // Template with {{placeholder}} syntax
  inputs: BlockInput[];
  outputs: BlockOutput[];
}

export interface BlockInstance {
  id: string;
  blockType: string; // References EffectBlock.id
  position: { x: number; y: number };
  inputValues: Record<string, UniformValue | string>; // Input overrides and connections
}

export interface BlockConnection {
  id: string;
  from: string; // blockId:outputId
  to: string; // blockId:inputId
  type: BlockValueType;
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
  | "block-builder";
