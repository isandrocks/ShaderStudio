/**
 * Shader management utilities
 */

import type { DynamicUniform, UniformType, UniformValue } from "../types";

/**
 * Ensure backward compatibility by defaulting type to 'float' if missing
 */
export const ensureUniformTypes = (
  uniforms: DynamicUniform[]
): DynamicUniform[] => {
  return uniforms.map((u) => ({
    ...u,
    type: u.type || ("float" as UniformType),
  }));
};

/**
 * Generate unique uniform name by auto-incrementing if exists
 */
export const generateUniqueUniformName = (
  baseName: string,
  existingUniforms: DynamicUniform[]
): string => {
  const existingNames = new Set(existingUniforms.map((u) => u.name));

  if (!existingNames.has(baseName)) {
    return baseName;
  }

  let counter = 2;
  while (existingNames.has(`${baseName}${counter}`)) {
    counter++;
  }
  return `${baseName}${counter}`;
};

/**
 * Create a new dynamic uniform with generated ID
 */
export const createDynamicUniform = (config: {
  name: string;
  type: UniformType;
  value: UniformValue;
  min: number;
  max: number;
  step: number;
}): DynamicUniform => {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...config,
  };
};

/**
 * Validate uniform configuration
 */
export const validateUniformConfig = (config: {
  name: string;
  min: number;
  max: number;
  step: number;
  value: UniformValue;
}): { valid: boolean; error?: string } => {
  if (!config.name || config.name.trim() === "") {
    return { valid: false, error: "Uniform name cannot be empty" };
  }

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(config.name)) {
    return {
      valid: false,
      error: "Uniform name must be a valid GLSL identifier",
    };
  }

  if (config.min >= config.max) {
    return { valid: false, error: "Min must be less than max" };
  }

  if (config.step <= 0) {
    return { valid: false, error: "Step must be positive" };
  }

  return { valid: true };
};

/**
 * Calculate capture canvas dimensions with supersampling
 */
export const calculateCaptureResolution = (
  targetWidth: number,
  targetHeight: number,
  supersampleMultiplier: number = 3,
  maxRenderSize: number = 4096,
  minRenderSize: number = 512
): { width: number; height: number } => {
  // Calculate target render size with supersampling
  let captureWidth = targetWidth * supersampleMultiplier;
  let captureHeight = targetHeight * supersampleMultiplier;

  // Cap at maximum to prevent performance issues
  const maxDimension = Math.max(captureWidth, captureHeight);
  if (maxDimension > maxRenderSize) {
    const scale = maxRenderSize / maxDimension;
    captureWidth = Math.round(captureWidth * scale);
    captureHeight = Math.round(captureHeight * scale);
  }

  // Ensure minimum quality for small objects
  if (captureWidth < minRenderSize) captureWidth = minRenderSize;
  if (captureHeight < minRenderSize) captureHeight = minRenderSize;

  return { width: captureWidth, height: captureHeight };
};
