/**
 * Validation and sanitization utilities for imported shader data
 */

import type {
  SavedShader,
  DynamicUniform,
  UniformType,
  EffectLayer,
  BlendMode,
} from "../types";

// Maximum allowed values to prevent resource exhaustion
const MAX_SHADER_SIZE = 1024 * 100; // 100KB for shader code
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_UNIFORMS = 50;
const MAX_LAYERS = 20;
const MAX_THUMBNAIL_SIZE = 1024 * 500; // 500KB for thumbnail

// Valid uniform types
const VALID_UNIFORM_TYPES: UniformType[] = ["float", "vec2", "vec3", "vec4"];

// Valid blend modes
const VALID_BLEND_MODES: BlendMode[] = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "add",
];

// GLSL identifier regex - must start with letter or underscore, followed by alphanumeric or underscore
const GLSL_IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Validates and sanitizes a string
 */
function sanitizeString(
  value: unknown,
  maxLength: number,
  fieldName: string,
): string {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }

  if (value.length > maxLength) {
    throw new Error(`${fieldName} exceeds maximum length of ${maxLength}`);
  }

  // Remove any null bytes and other control characters except newlines/tabs
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

/**
 * Validates a GLSL uniform name
 */
function validateUniformName(name: string): void {
  if (!GLSL_IDENTIFIER_REGEX.test(name)) {
    throw new Error(
      `Invalid uniform name: ${name}. Must be a valid GLSL identifier.`,
    );
  }

  // Check for reserved GLSL keywords
  const reservedKeywords = [
    "if",
    "else",
    "for",
    "while",
    "do",
    "return",
    "break",
    "continue",
    "float",
    "int",
    "bool",
    "vec2",
    "vec3",
    "vec4",
    "mat2",
    "mat3",
    "mat4",
    "sampler2D",
    "void",
    "true",
    "false",
    "uniform",
    "attribute",
    "varying",
  ];

  if (reservedKeywords.includes(name)) {
    throw new Error(`Uniform name "${name}" is a reserved GLSL keyword`);
  }
}

/**
 * Validates a number is finite and within reasonable bounds
 */
function validateNumber(value: unknown, fieldName: string): number {
  if (typeof value !== "number") {
    throw new Error(`${fieldName} must be a number`);
  }

  if (!Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a finite number`);
  }

  return value;
}

/**
 * Validates uniform value matches its type
 */
function validateUniformValue(value: unknown, type: UniformType): void {
  if (type === "float") {
    if (typeof value !== "number") {
      throw new Error("float uniform value must be a number");
    }
    validateNumber(value, "uniform value");
  } else if (type === "vec2") {
    if (!Array.isArray(value) || value.length !== 2) {
      throw new Error("vec2 uniform value must be an array of 2 numbers");
    }
    value.forEach((v, i) => validateNumber(v, `vec2[${i}]`));
  } else if (type === "vec3") {
    if (!Array.isArray(value) || value.length !== 3) {
      throw new Error("vec3 uniform value must be an array of 3 numbers");
    }
    value.forEach((v, i) => validateNumber(v, `vec3[${i}]`));
  } else if (type === "vec4") {
    if (!Array.isArray(value) || value.length !== 4) {
      throw new Error("vec4 uniform value must be an array of 4 numbers");
    }
    value.forEach((v, i) => validateNumber(v, `vec4[${i}]`));
  }
}

/**
 * Validates and sanitizes a dynamic uniform
 */
function validateDynamicUniform(uniform: unknown): DynamicUniform {
  if (typeof uniform !== "object" || uniform === null) {
    throw new Error("Uniform must be an object");
  }

  const u = uniform as Record<string, unknown>;

  // Validate ID
  const id = sanitizeString(u.id, 100, "uniform.id");

  // Validate name
  const name = sanitizeString(u.name, 50, "uniform.name");
  validateUniformName(name);

  // Validate type
  if (!VALID_UNIFORM_TYPES.includes(u.type as UniformType)) {
    throw new Error(`Invalid uniform type: ${u.type}`);
  }
  const type = u.type as UniformType;

  // Validate value
  validateUniformValue(u.value, type);

  // Validate numeric constraints
  const min = validateNumber(u.min, "uniform.min");
  const max = validateNumber(u.max, "uniform.max");
  const step = validateNumber(u.step, "uniform.step");

  if (min >= max) {
    throw new Error("uniform.min must be less than uniform.max");
  }

  if (step <= 0) {
    throw new Error("uniform.step must be positive");
  }

  return {
    id,
    name,
    type,
    value: u.value as DynamicUniform["value"],
    min,
    max,
    step,
  };
}

/**
 * Validates and sanitizes an effect layer
 */
function validateEffectLayer(layer: unknown): EffectLayer {
  if (typeof layer !== "object" || layer === null) {
    throw new Error("Layer must be an object");
  }

  const l = layer as Record<string, unknown>;

  const id = sanitizeString(l.id, 100, "layer.id");
  const name = sanitizeString(l.name, 100, "layer.name");
  const effectId = sanitizeString(l.effectId, 100, "layer.effectId");

  // Validate type
  const type = l.type;
  if (!["shape", "pattern", "gradient", "effect"].includes(type as string)) {
    throw new Error(`Invalid layer type: ${type}`);
  }

  // Validate boolean
  if (typeof l.visible !== "boolean") {
    throw new Error("layer.visible must be a boolean");
  }

  // Validate opacity (0-1)
  const opacity = validateNumber(l.opacity, "layer.opacity");
  if (opacity < 0 || opacity > 1) {
    throw new Error("layer.opacity must be between 0 and 1");
  }

  // Validate blend mode
  if (!VALID_BLEND_MODES.includes(l.blendMode as BlendMode)) {
    throw new Error(`Invalid blend mode: ${l.blendMode}`);
  }

  // Validate properties object
  if (typeof l.properties !== "object" || l.properties === null) {
    throw new Error("layer.properties must be an object");
  }

  // Validate each property value
  const properties: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(
    l.properties as Record<string, unknown>,
  )) {
    const sanitizedKey = sanitizeString(key, 50, "property key");
    validateUniformName(sanitizedKey);

    // Property values can be number or arrays
    if (typeof value === "number") {
      properties[sanitizedKey] = validateNumber(
        value,
        `property.${sanitizedKey}`,
      );
    } else if (Array.isArray(value)) {
      if (value.length < 2 || value.length > 4) {
        throw new Error(
          `Property ${sanitizedKey} array must have 2-4 elements`,
        );
      }
      properties[sanitizedKey] = value.map((v, i) =>
        validateNumber(v, `property.${sanitizedKey}[${i}]`),
      );
    } else {
      throw new Error(`Property ${sanitizedKey} must be a number or array`);
    }
  }

  return {
    id,
    name,
    type: type as EffectLayer["type"],
    effectId,
    visible: l.visible as boolean,
    opacity,
    blendMode: l.blendMode as BlendMode,
    properties: properties as EffectLayer["properties"],
  };
}

/**
 * Validates and sanitizes an imported shader
 * Throws an error if validation fails
 */
export function validateImportedShader(data: unknown): SavedShader {
  // Check if data is an object
  if (typeof data !== "object" || data === null) {
    throw new Error("Shader data must be an object");
  }

  const shader = data as Record<string, unknown>;

  // Validate required fields
  if (!shader.fragmentShader) {
    throw new Error("Missing required field: fragmentShader");
  }

  if (!shader.dynamicUniforms) {
    throw new Error("Missing required field: dynamicUniforms");
  }

  // Validate fragment shader
  const fragmentShader = sanitizeString(
    shader.fragmentShader,
    MAX_SHADER_SIZE,
    "fragmentShader",
  );

  // Basic GLSL syntax check - must contain void main()
  if (!fragmentShader.includes("void main()")) {
    throw new Error("Fragment shader must contain a main() function");
  }

  // Validate name
  const name = sanitizeString(
    shader.name || "Unnamed Shader",
    MAX_NAME_LENGTH,
    "name",
  );

  // Validate description (optional)
  let description: string | undefined;
  if (shader.description !== undefined) {
    description = sanitizeString(
      shader.description,
      MAX_DESCRIPTION_LENGTH,
      "description",
    );
  }

  // Validate dynamic uniforms array
  if (!Array.isArray(shader.dynamicUniforms)) {
    throw new Error("dynamicUniforms must be an array");
  }

  if (shader.dynamicUniforms.length > MAX_UNIFORMS) {
    throw new Error(`Too many uniforms (max: ${MAX_UNIFORMS})`);
  }

  const dynamicUniforms = shader.dynamicUniforms.map((u, i) => {
    try {
      return validateDynamicUniform(u);
    } catch (err) {
      throw new Error(
        `Invalid uniform at index ${i}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  });

  // Validate layers (optional)
  let layers: EffectLayer[] | undefined;
  if (shader.layers !== undefined) {
    if (!Array.isArray(shader.layers)) {
      throw new Error("layers must be an array");
    }

    if (shader.layers.length > MAX_LAYERS) {
      throw new Error(`Too many layers (max: ${MAX_LAYERS})`);
    }

    layers = shader.layers.map((l, i) => {
      try {
        return validateEffectLayer(l);
      } catch (err) {
        throw new Error(
          `Invalid layer at index ${i}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    });
  }

  // Validate timestamps
  const createdAt =
    typeof shader.createdAt === "number"
      ? validateNumber(shader.createdAt, "createdAt")
      : Date.now();

  const updatedAt =
    typeof shader.updatedAt === "number"
      ? validateNumber(shader.updatedAt, "updatedAt")
      : Date.now();

  // Validate thumbnail (optional)
  let thumbnail: string | undefined;
  if (shader.thumbnail !== undefined) {
    thumbnail = sanitizeString(
      shader.thumbnail,
      MAX_THUMBNAIL_SIZE,
      "thumbnail",
    );

    // Validate it's a data URL
    if (!thumbnail.startsWith("data:image/")) {
      throw new Error("thumbnail must be a data URL (data:image/...)");
    }
  }

  // Generate new ID (ignore imported ID to prevent conflicts)
  const id = `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    name,
    description,
    fragmentShader,
    dynamicUniforms,
    layers,
    createdAt,
    updatedAt,
    thumbnail,
  };
}

/**
 * Validates file size before reading
 */
export function validateFileSize(file: File): void {
  const MAX_FILE_SIZE = 1024 * 1024; // 1MB

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large (max: ${MAX_FILE_SIZE / 1024}KB)`);
  }

  if (file.size === 0) {
    throw new Error("File is empty");
  }
}
