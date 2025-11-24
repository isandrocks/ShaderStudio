/**
 * Block Graph Generator - Converts block instances into GLSL code
 */

import { BlockInstance, DynamicUniform } from "../types";
import { getBlockById } from "./registry";

/**
 * Topologically sort blocks based on dependencies
 */
export function topologicalSort(blocks: BlockInstance[]): BlockInstance[] {
  const sorted: BlockInstance[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  // Build dependency graph
  const dependencies = new Map<string, Set<string>>();
  blocks.forEach((block) => {
    dependencies.set(block.id, new Set());
  });

  // Find connections between blocks
  blocks.forEach((block) => {
    const blockDef = getBlockById(block.blockType);
    if (!blockDef) return;

    blockDef.inputs.forEach((input) => {
      const connectedTo = block.inputValues[input.id];
      if (typeof connectedTo === "string" && connectedTo.includes(":")) {
        // This is a connection to another block (format: "blockId:outputId")
        const [sourceBlockId] = connectedTo.split(":");
        dependencies.get(block.id)?.add(sourceBlockId);
      }
    });
  });

  function visit(blockId: string): void {
    if (visited.has(blockId)) return;
    if (visiting.has(blockId)) {
      throw new Error(
        `Circular dependency detected involving block ${blockId}`
      );
    }

    visiting.add(blockId);

    const deps = dependencies.get(blockId);
    if (deps) {
      deps.forEach((depId) => visit(depId));
    }

    visiting.delete(blockId);
    visited.add(blockId);

    const block = blocks.find((b) => b.id === blockId);
    if (block) {
      sorted.push(block);
    }
  }

  blocks.forEach((block) => visit(block.id));

  return sorted;
}

/**
 * Generate GLSL function code from a block instance
 */
export function generateBlockCode(
  block: BlockInstance,
  _dynamicUniforms: DynamicUniform[]
): string {
  const blockDef = getBlockById(block.blockType);
  if (!blockDef) {
    throw new Error(`Block type not found: ${block.blockType}`);
  }

  let code = blockDef.glslTemplate;

  // Replace {{id}} placeholder with block instance ID
  code = code.replace(/\{\{id\}\}/g, block.id.replace(/-/g, "_"));

  // Determine output type for templates that need it (like mix/multiply)
  const outputType = blockDef.outputs[0]?.type || "vec3";
  code = code.replace(/\{\{outputType\}\}/g, outputType);

  return code;
}

/**
 * Generate function call for a block instance
 */
export function generateBlockCall(
  block: BlockInstance,
  _dynamicUniforms: DynamicUniform[]
): string {
  const blockDef = getBlockById(block.blockType);
  if (!blockDef) {
    throw new Error(`Block type not found: ${block.blockType}`);
  }

  const functionName = `${blockDef.name.toLowerCase().replace(/\s+/g, "")}${
    "_" + block.id.replace(/-/g, "_")
  }`;

  const outputType = blockDef.outputs[0]?.type || "vec3";
  const outputVar = `${blockDef.name.toLowerCase().replace(/\s+/g, "_")}_${block.id.replace(/-/g, "_")}_result`;

  // Build parameter list
  const params: string[] = [];

  blockDef.inputs.forEach((input) => {
    const value = block.inputValues[input.id];

    if (value === undefined) {
      // Use default value
      if (typeof input.defaultValue === "string") {
        params.push(input.defaultValue);
      } else if (typeof input.defaultValue === "number") {
        params.push(input.defaultValue.toFixed(2));
      } else if (Array.isArray(input.defaultValue)) {
        if (input.defaultValue.length === 2) {
          params.push(
            `vec2(${input.defaultValue[0].toFixed(2)}, ${input.defaultValue[1].toFixed(2)})`
          );
        } else if (input.defaultValue.length === 3) {
          params.push(
            `vec3(${input.defaultValue[0].toFixed(2)}, ${input.defaultValue[1].toFixed(2)}, ${input.defaultValue[2].toFixed(2)})`
          );
        } else if (input.defaultValue.length === 4) {
          params.push(
            `vec4(${input.defaultValue[0].toFixed(2)}, ${input.defaultValue[1].toFixed(2)}, ${input.defaultValue[2].toFixed(2)}, ${input.defaultValue[3].toFixed(2)})`
          );
        }
      }
    } else if (typeof value === "string") {
      // Check if it's a connection to another block
      if (value.includes(":")) {
        const [sourceBlockId, _outputId] = value.split(":");
        const sourceBlock = getBlockById(sourceBlockId);
        const outputVar = `${sourceBlock?.name.toLowerCase().replace(/\s+/g, "_")}_${sourceBlockId.replace(/-/g, "_")}_result`;
        params.push(outputVar);
      } else {
        // It's a reference to a uniform or variable
        params.push(value);
      }
    } else if (typeof value === "number") {
      params.push(value.toFixed(2));
    } else if (Array.isArray(value)) {
      if (value.length === 2) {
        params.push(`vec2(${value[0].toFixed(2)}, ${value[1].toFixed(2)})`);
      } else if (value.length === 3) {
        params.push(
          `vec3(${value[0].toFixed(2)}, ${value[1].toFixed(2)}, ${value[2].toFixed(2)})`
        );
      } else if (value.length === 4) {
        params.push(
          `vec4(${value[0].toFixed(2)}, ${value[1].toFixed(2)}, ${value[2].toFixed(2)}, ${value[3].toFixed(2)})`
        );
      }
    }
  });

  return `  ${outputType} ${outputVar} = ${functionName}(${params.join(", ")});\n`;
}

/**
 * Generate complete GLSL shader code from block graph
 */
export function generateShaderFromBlocks(
  blocks: BlockInstance[],
  dynamicUniforms: DynamicUniform[]
): string {
  if (blocks.length === 0) {
    throw new Error("No blocks to generate code from");
  }

  // Sort blocks topologically
  const sortedBlocks = topologicalSort(blocks);

  // Generate function definitions
  const functions = sortedBlocks
    .map((block) => generateBlockCode(block, dynamicUniforms))
    .join("\n");

  // Generate function calls in main
  const calls = sortedBlocks
    .map((block) => generateBlockCall(block, dynamicUniforms))
    .join("");

  // Find the last block's output variable
  const lastBlock = sortedBlocks[sortedBlocks.length - 1];
  const lastBlockDef = getBlockById(lastBlock.blockType);
  const lastOutputVar = `${lastBlockDef?.name.toLowerCase().replace(/\s+/g, "_")}_${lastBlock.id.replace(/-/g, "_")}_result`;
  const lastOutputType = lastBlockDef?.outputs[0]?.type || "vec3";

  // Assemble complete shader
  let shader = `precision mediump float;

uniform vec2 iResolution;
uniform float iTime;

${functions}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  
${calls}
`;

  // Convert final result to gl_FragColor based on type
  if (lastOutputType === "vec4") {
    shader += `  gl_FragColor = ${lastOutputVar};\n`;
  } else if (lastOutputType === "vec3") {
    shader += `  gl_FragColor = vec4(${lastOutputVar}, 1.0);\n`;
  } else if (lastOutputType === "float") {
    shader += `  gl_FragColor = vec4(vec3(${lastOutputVar}), 1.0);\n`;
  } else if (lastOutputType === "vec2") {
    shader += `  gl_FragColor = vec4(${lastOutputVar}, 0.0, 1.0);\n`;
  }

  shader += `}\n`;

  return shader;
}

/**
 * Validate block connections
 */
export function validateBlockGraph(blocks: BlockInstance[]): string[] {
  const errors: string[] = [];

  // Check for circular dependencies
  try {
    topologicalSort(blocks);
  } catch (error) {
    errors.push((error as Error).message);
  }

  // Validate each block
  blocks.forEach((block) => {
    const blockDef = getBlockById(block.blockType);
    if (!blockDef) {
      errors.push(`Invalid block type: ${block.blockType}`);
      return;
    }

    // Check that connections reference valid blocks
    blockDef.inputs.forEach((input) => {
      const value = block.inputValues[input.id];
      if (typeof value === "string" && value.includes(":")) {
        const [sourceBlockId, outputId] = value.split(":");
        const sourceBlock = blocks.find((b) => b.id === sourceBlockId);
        if (!sourceBlock) {
          errors.push(
            `Block ${block.id} references non-existent block ${sourceBlockId}`
          );
          return;
        }

        const sourceBlockDef = getBlockById(sourceBlock.blockType);
        const sourceOutput = sourceBlockDef?.outputs.find(
          (o) => o.id === outputId
        );
        if (!sourceOutput) {
          errors.push(
            `Block ${block.id} references non-existent output ${outputId} on block ${sourceBlockId}`
          );
        }

        // Type compatibility check (basic)
        // TODO: Implement more sophisticated type checking
      }
    });
  });

  return errors;
}
