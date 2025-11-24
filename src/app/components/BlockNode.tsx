/**
 * Block Node - Individual block instance on canvas
 */

import React from "react";
import { BlockInstance } from "../types";
import { getBlockById } from "../blocks/registry";

interface BlockNodeProps {
  block: BlockInstance;
  isSelected: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDelete: () => void;
  onOutputMouseDown: (blockId: string, outputId: string, e: React.MouseEvent<HTMLDivElement>) => void;
}

export const BlockNode: React.FC<BlockNodeProps> = ({
  block,
  isSelected,
  onClick,
  onDelete,
  onOutputMouseDown,
}) => {
  const blockDef = getBlockById(block.blockType);
  
  if (!blockDef) {
    return null;
  }

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg shadow-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? "border-primary shadow-primary/50"
          : "border-gray-700 hover:border-gray-600"
      }`}
      style={{
        width: "200px",
      }}
      onClick={onClick}
    >
      {/* Header */}
      <div
        className={`px-3 py-2 rounded-t-lg border-b ${
          isSelected ? "bg-primary/20 border-primary/50" : "bg-gray-700/50 border-gray-600"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">{blockDef.icon}</span>
            <span className="text-sm font-medium text-white truncate">
              {blockDef.name}
            </span>
          </div>
          <button
            onClick={handleDelete}
            className="shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors"
            title="Delete block"
          >
            ×
          </button>
        </div>
      </div>

      {/* Inputs */}
      {blockDef.inputs.length > 0 && (
        <div className="px-3 py-2 space-y-1">
          {blockDef.inputs.map((input) => {
            const hasConnection = typeof block.inputValues[input.id] === 'string' && 
                                 (block.inputValues[input.id] as string).includes(':');
            return (
              <div key={input.id} className="flex items-center gap-2 text-xs">
                <div 
                  className="input-port w-3 h-3 rounded-full bg-blue-500 shrink-0 cursor-pointer hover:bg-blue-400 transition-colors"
                  data-block-id={block.id}
                  data-input-id={input.id}
                  title={hasConnection ? "Connected" : "Drop connection here"}
                  style={{
                    boxShadow: hasConnection ? '0 0 8px rgba(59, 130, 246, 0.8)' : 'none',
                  }}
                />
                <span className="text-gray-300">{input.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Outputs */}
      {blockDef.outputs.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-700 space-y-1">
          {blockDef.outputs.map((output) => (
            <div key={output.id} className="flex items-center justify-end gap-2 text-xs">
              <span className="text-gray-300">{output.label}</span>
              <div 
                className="w-3 h-3 rounded-full bg-green-500 shrink-0 cursor-pointer hover:bg-green-400 transition-colors"
                title="Drag to connect"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onOutputMouseDown(block.id, output.id, e);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
