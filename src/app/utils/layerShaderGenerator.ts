import { EffectLayer, EffectTemplate } from "../types";

const BLEND_MODES_GLSL = `
vec3 blendNormal(vec3 base, vec3 blend, float opacity, float alpha) {
    return mix(base, blend, opacity * alpha);
}

vec3 blendMultiply(vec3 base, vec3 blend, float opacity, float alpha) {
    return mix(base, base * blend, opacity * alpha);
}

vec3 blendScreen(vec3 base, vec3 blend, float opacity, float alpha) {
    return mix(base, 1.0 - (1.0 - base) * (1.0 - blend), opacity * alpha);
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity, float alpha) {
    return mix(base, mix(2.0 * base * blend, 1.0 - 2.0 * (1.0 - base) * (1.0 - blend), step(0.5, base)), opacity * alpha);
}

vec3 blendAdd(vec3 base, vec3 blend, float opacity, float alpha) {
    return mix(base, min(base + blend, vec3(1.0)), opacity * alpha);
}
`;

const DEFAULT_BASE_SHADER = `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv.x *= iResolution.x / iResolution.y;
    
    vec4 col = vec4(0.0, 0.0, 0.0, 1.0);
    gl_FragColor = col;
}
`;

const LAYER_SYSTEM_START = "// --- Layer System Globals ---";
const LAYER_SYSTEM_END = "// --- End Layer System Globals ---";
const COMPOSITION_START = "// --- Layer System Composition ---";
const COMPOSITION_END = "// --- End Layer System Composition ---";

export const generateLayeredShader = (
  layers: EffectLayer[],
  templates: EffectTemplate[],
  baseShaderCode?: string,
): string => {
  let shader = baseShaderCode || DEFAULT_BASE_SHADER;

  shader = cleanupPreviousInjections(shader);

  if (layers.length === 0) {
    return shader;
  }

  const mainIndex = shader.indexOf("void main()");
  if (mainIndex === -1) return shader;

  const globalsInjection = buildGlobalsInjection(layers, templates);
  shader = shader.slice(0, mainIndex) + globalsInjection + shader.slice(mainIndex);

  const fragColorMatch = findLastFragColorAssignment(shader);
  if (!fragColorMatch) return shader;

  const compositionInjection = buildCompositionInjection(
    layers,
    templates,
    fragColorMatch.outputVar,
  );
  
  shader =
    shader.slice(0, fragColorMatch.index) +
    compositionInjection +
    shader.slice(fragColorMatch.index);

  return shader;
};

function cleanupPreviousInjections(shader: string): string {
  if (shader.includes(LAYER_SYSTEM_END)) {
    shader = shader.replace(
      new RegExp(`${escapeRegex(LAYER_SYSTEM_START)}[\\s\\S]*?${escapeRegex(LAYER_SYSTEM_END)}\\n?`, "g"),
      "",
    );
  } else {
    shader = shader.replace(
      new RegExp(`${escapeRegex(LAYER_SYSTEM_START)}[\\s\\S]*?(?=void main\\(\\))`, "g"),
      "",
    );
  }

  if (shader.includes(COMPOSITION_END)) {
    shader = shader.replace(
      new RegExp(`\\s*${escapeRegex(COMPOSITION_START)}[\\s\\S]*?${escapeRegex(COMPOSITION_END)}\\n?`, "g"),
      "",
    );
  } else {
    shader = shader.replace(
      new RegExp(`\\s*${escapeRegex(COMPOSITION_START)}[\\s\\S]*?(?=\\s*gl_FragColor\\s*=)`, "g"),
      "",
    );
  }

  shader = shader.replace(
    /^\s*uniform\s+(float|vec3|vec4)\s+u_(?:L[A-Z0-9]{4}|layer_\w+)_\w+;\s*(\r\n|\n|\r)?/gm,
    "",
  );

  return shader.replace(/\n{3,}/g, "\n\n");
}

function buildGlobalsInjection(
  layers: EffectLayer[],
  templates: EffectTemplate[],
): string {
  const usedTemplateIds = new Set(layers.map((l) => l.effectId));
  const usedTemplates = templates.filter((t) => usedTemplateIds.has(t.id));

  let injection = `\n${LAYER_SYSTEM_START}\n`;
  injection += `// WARNING: Code between these markers will be OVERWRITTEN when using Layer Builder!\n`;
  injection += `// Move any custom shader code OUTSIDE of these markers to preserve it.\n\n`;
  injection += `${BLEND_MODES_GLSL}\n`;

  usedTemplates.forEach((template) => {
    injection += `\n${template.glslFunction}\n`;
  });

  injection += `${LAYER_SYSTEM_END}\n`;

  return injection;
}

function findLastFragColorAssignment(shader: string): {
  index: number;
  outputVar: string;
} | null {
  const fragColorRegex = /gl_FragColor\s*=\s*([^;]+);/g;
  let match;
  let lastMatch;

  while ((match = fragColorRegex.exec(shader)) !== null) {
    lastMatch = match;
  }

  if (!lastMatch) return null;

  return {
    index: lastMatch.index,
    outputVar: lastMatch[1].trim(),
  };
}

function buildCompositionInjection(
  layers: EffectLayer[],
  templates: EffectTemplate[],
  outputVar: string,
): string {
  let injection = `\n    ${COMPOSITION_START}\n`;
  injection += `    if (uv != gl_FragCoord.xy / iResolution.xy) {\n`;
  injection += `        uv = gl_FragCoord.xy / iResolution.xy;\n`;
  injection += `    }\n\n`;
  injection += `    vec3 finalColor_LS = ${outputVar}.xyz;\n`;

  layers.forEach((layer, index) => {
    if (!layer.visible) return;
    
    const template = templates.find((t) => t.id === layer.effectId);
    if (!template) return;

    let call = template.glslCall;
    Object.keys(template.defaultProperties).forEach((propKey) => {
      const uniformName = `u_${layer.id}_${propKey}`;
      call = call.replace(new RegExp(`{${propKey}}`, "g"), uniformName);
    });

    const opacityUniform = `u_${layer.id}_opacity`;
    const blendFunc = `blend${capitalizeFirst(layer.blendMode)}`;

    injection += `    vec4 layer${index} = ${call};\n`;
    injection += `    finalColor_LS = ${blendFunc}(finalColor_LS, layer${index}.rgb, ${opacityUniform}, layer${index}.a);\n\n`;
  });

  const alphaValue = outputVar === "col" ? "col.w" : "1.0";
  injection += `    col = vec4(finalColor_LS, ${alphaValue});\n`;
  injection += `    ${COMPOSITION_END}\n`;

  return injection;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
