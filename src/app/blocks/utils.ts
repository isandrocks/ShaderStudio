/**
 * Block utility functions
 */

import { BlockInstance, BlockConnection } from "../types";

/**
 * Generate unique block ID
 */
export function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique connection ID
 */
export function generateConnectionId(): string {
  return `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new block instance from a block type
 */
export function createBlockInstance(
  blockType: string,
  position: { x: number; y: number }
): BlockInstance {
  return {
    id: generateBlockId(),
    blockType,
    position,
    inputValues: {},
  };
}

/**
 * Extract connections from block instances
 */
export function extractConnections(blocks: BlockInstance[]): BlockConnection[] {
  const connections: BlockConnection[] = [];

  blocks.forEach((block) => {
    Object.entries(block.inputValues).forEach(([inputId, value]) => {
      if (typeof value === "string" && value.includes(":")) {
        const [sourceBlockId, sourceOutputId] = value.split(":");
        connections.push({
          id: generateConnectionId(),
          from: `${sourceBlockId}:${sourceOutputId}`,
          to: `${block.id}:${inputId}`,
          type: "vec3", // TODO: Determine actual type from block definitions
        });
      }
    });
  });

  return connections;
}

/**
 * Check if a value is a connection reference
 */
export function isConnectionReference(value: unknown): boolean {
  return typeof value === "string" && value.includes(":");
}

/**
 * Parse connection reference
 */
export function parseConnectionReference(
  ref: string
): { blockId: string; outputId: string } | null {
  if (!ref.includes(":")) return null;
  const [blockId, outputId] = ref.split(":");
  return { blockId, outputId };
}

/**
 * Find block by ID
 */
export function findBlockById(
  blocks: BlockInstance[],
  blockId: string
): BlockInstance | undefined {
  return blocks.find((b) => b.id === blockId);
}

/**
 * Get blocks that depend on a given block
 */
export function getDependentBlocks(
  blocks: BlockInstance[],
  targetBlockId: string
): BlockInstance[] {
  return blocks.filter((block) => {
    return Object.values(block.inputValues).some((value) => {
      if (typeof value === "string" && value.includes(":")) {
        const [sourceBlockId] = value.split(":");
        return sourceBlockId === targetBlockId;
      }
      return false;
    });
  });
}

/**
 * Remove block and update connections
 */
export function removeBlock(
  blocks: BlockInstance[],
  blockId: string
): BlockInstance[] {
  // Remove the block
  const filtered = blocks.filter((b) => b.id !== blockId);

  // Remove connections to this block
  return filtered.map((block) => {
    const newInputValues = { ...block.inputValues };
    Object.keys(newInputValues).forEach((inputId) => {
      const value = newInputValues[inputId];
      if (typeof value === "string" && value.includes(":")) {
        const [sourceBlockId] = value.split(":");
        if (sourceBlockId === blockId) {
          delete newInputValues[inputId];
        }
      }
    });
    return { ...block, inputValues: newInputValues };
  });
}

/**
 * Clone a block instance
 */
export function cloneBlock(
  block: BlockInstance,
  offset: { x: number; y: number } = { x: 20, y: 20 }
): BlockInstance {
  return {
    ...block,
    id: generateBlockId(),
    position: {
      x: block.position.x + offset.x,
      y: block.position.y + offset.y,
    },
    inputValues: { ...block.inputValues },
  };
}
