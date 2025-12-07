import { EffectLayer, EffectTemplate } from "../types";

const BLEND_MODES_GLSL = `
vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
    return mix(base, blend, opacity);
}

vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
    return mix(base, base * blend, opacity);
}

vec3 blendScreen(vec3 base, vec3 blend, float opacity) {
    return mix(base, 1.0 - (1.0 - base) * (1.0 - blend), opacity);
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
    return mix(base, mix(2.0 * base * blend, 1.0 - 2.0 * (1.0 - base) * (1.0 - blend), step(0.5, base)), opacity);
}

vec3 blendAdd(vec3 base, vec3 blend, float opacity) {
    return mix(base, min(base + blend, vec3(1.0)), opacity);
}
`;

export const generateLayeredShader = (
  layers: EffectLayer[],
  templates: EffectTemplate[],
  baseShaderCode?: string,
): string => {
  // 1. Header & Uniforms
  // Note: Dynamic uniforms are injected by the WebGL engine,
  // but we need standard ones here.

  // Default to a basic black background if no base provided
  let base =
    baseShaderCode ||
    `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    // Correct aspect ratio
    uv.x *= iResolution.x / iResolution.y;
    
    vec4 col = vec4(0.0, 0.0, 0.0, 1.0);
    gl_FragColor = col;
}
`;

  // --- CLEANUP STEP ---
  // Remove any previously injected Layer System code to prevent duplication errors
  // 1. Strip Globals (from marker to void main)
  if (base.includes("// --- End Layer System Globals ---")) {
    base = base.replace(
      /\/\/ --- Layer System Globals ---[\s\S]*?\/\/ --- End Layer System Globals ---\n?/g,
      "",
    );
  } else {
    base = base.replace(
      /\/\/ --- Layer System Globals ---[\s\S]*?(?=void main\(\))/g,
      "",
    );
  }

  // 2. Strip Composition (from marker to gl_FragColor)
  // We need to be careful not to delete the gl_FragColor line itself, just the block before it.
  if (base.includes("// --- End Layer System Composition ---")) {
    base = base.replace(
      /\s*\/\/ --- Layer System Composition ---[\s\S]*?\/\/ --- End Layer System Composition ---\n?/g,
      "",
    );
  } else {
    base = base.replace(
      /\s*\/\/ --- Layer System Composition ---[\s\S]*?(?=\s*gl_FragColor\s*=)/g,
      "",
    );
  }

  // 3. Strip Layer Uniforms
  // Matches both new short IDs (u_LXXXX_...) and old long IDs (u_layer_...)
  // Removes the entire line including the newline to prevent empty gaps
  base = base.replace(
    /^\s*uniform\s+(float|vec3|vec4)\s+u_(?:L[A-Z0-9]{4}|layer_\w+)_\w+;\s*(\r\n|\n|\r)?/gm,
    "",
  );

  // 4. Clean up multiple empty lines
  base = base.replace(/\n{3,}/g, "\n\n");

  // If no layers, return the cleaned base shader
  if (layers.length === 0) {
    return base;
  }

  // 2. Inject Globals (Blend Modes + Templates)
  // We need to insert these before `void main()`.
  const mainIndex = base.indexOf("void main()");
  if (mainIndex === -1) return base; // Fail safe

  let headerInjection = `\n// --- Layer System Globals ---\n${BLEND_MODES_GLSL}\n`;

  const usedTemplateIds = new Set(layers.map((l) => l.effectId));
  const usedTemplates = templates.filter((t) => usedTemplateIds.has(t.id));

  usedTemplates.forEach((t) => {
    headerInjection += `\n// ${t.name}\n${t.glslFunction}\n`;
  });
  headerInjection += `// --- End Layer System Globals ---\n`;

  // Insert headers before main
  let newShader =
    base.slice(0, mainIndex) + headerInjection + base.slice(mainIndex);

  // 3. Inject Layer Logic inside main()
  // Find the end of main() or the assignment to gl_FragColor.
  // The user specifically mentioned `gl_FragColor = col;`.
  // Let's look for `gl_FragColor =`.

  const fragColorRegex = /gl_FragColor\s*=\s*([^;]+);/g;
  let match;
  let lastMatch;
  while ((match = fragColorRegex.exec(newShader)) !== null) {
    lastMatch = match;
  }

  if (lastMatch) {
    const insertionPoint = lastMatch.index;
    const outputVar = lastMatch[1].trim(); // e.g. "col" or "vec4(1.0)"

    let layerLogic = `\n    // --- Layer System Composition ---\n`;
    layerLogic += `    vec3 finalColor_LS = ${outputVar}.xyz;\n`; // Start with current color

    layers.forEach((layer, index) => {
      if (!layer.visible) return;
      const template = templates.find((t) => t.id === layer.effectId);
      if (!template) return;

      let call = template.glslCall;
      Object.keys(template.defaultProperties).forEach((propKey) => {
        const uniformName = `u_${layer.id}_${propKey}`;
        const regex = new RegExp(`{${propKey}}`, "g");
        call = call.replace(regex, uniformName);
      });

      layerLogic += `    // Layer ${index}: ${layer.name}\n`;
      layerLogic += `    vec3 layer${index} = ${call};\n`;

      const opacityUniform = `u_${layer.id}_opacity`;
      const blendModeCapitalized =
        layer.blendMode.charAt(0).toUpperCase() + layer.blendMode.slice(1);
      const blendFunc = `blend${blendModeCapitalized}`;

      layerLogic += `    finalColor_LS = ${blendFunc}(finalColor_LS, layer${index}, ${opacityUniform});\n\n`;
    });

    // Update the output variable if it's a variable (like 'col')
    // If it's an expression (like 'vec4(1.0)'), we can't assign to it.
    // The user said "set col = vec4(finalColor_LS, 1.0);"
    // So we assume the output var is 'col'.

    if (outputVar === "col") {
      layerLogic += `    col = vec4(finalColor_LS, 1.0);\n`;
    } else {
      // Fallback: redefine gl_FragColor assignment?
      // Or create 'col' if it doesn't exist?
      // If the user code is `gl_FragColor = vec4(0.0);`, we can't do `vec4(0.0) = ...`
      // We should probably just replace the assignment value.

      // But the user specifically asked for:
      // "add its code directly able above that line and set 'col = vec4(finalColor_LS, 1.0);' at the end"

      // Let's assume the target is `col`.
      layerLogic += `    col = vec4(finalColor_LS, 1.0);\n`;
    }
    layerLogic += `    // --- End Layer System Composition ---\n`;

    newShader =
      newShader.slice(0, insertionPoint) +
      layerLogic +
      newShader.slice(insertionPoint);
  } else {
    // Fallback if no gl_FragColor found (unlikely)
    return base;
  }

  return newShader;
};
