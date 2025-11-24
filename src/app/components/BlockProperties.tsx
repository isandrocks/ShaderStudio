/**
 * Block Properties Panel - Configure block inputs and link to uniforms
 */

import React from "react";
import { BlockInstance, DynamicUniform, UniformValue } from "../types";
import { getBlockById } from "../blocks/registry";

interface BlockPropertiesProps {
  selectedBlock: BlockInstance | null;
  dynamicUniforms: DynamicUniform[];
  onUpdateInput: (inputId: string, value: UniformValue | string) => void;
}

export const BlockProperties: React.FC<BlockPropertiesProps> = ({
  selectedBlock,
  dynamicUniforms,
  onUpdateInput,
}) => {
  if (!selectedBlock) {
    return (
      <div className="h-full flex flex-col bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Properties</h3>
        <p className="text-gray-500 text-sm">Select a block to edit properties</p>
      </div>
    );
  }

  const blockDef = getBlockById(selectedBlock.blockType);
  if (!blockDef) {
    return (
      <div className="h-full flex flex-col bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Properties</h3>
        <p className="text-red-400 text-sm">Invalid block type</p>
      </div>
    );
  }

  const handleUniformChange = (inputId: string, uniformName: string) => {
    // Uniform selected from dropdown
    onUpdateInput(inputId, uniformName || "");
  };

  const handleManualValueChange = (inputId: string, value: string) => {
    // Manual value entered
    if (value === "") {
      onUpdateInput(inputId, "");
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onUpdateInput(inputId, numValue);
      } else {
        onUpdateInput(inputId, value);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-1">Properties</h3>
        <div className="flex items-center gap-2">
          <span className="text-xl">{blockDef.icon}</span>
          <span className="text-sm text-gray-300">{blockDef.name}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{blockDef.description}</p>
      </div>

      {/* Inputs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {blockDef.inputs.map((input) => {
          const currentValue = selectedBlock.inputValues[input.id];
          const isConnected =
            typeof currentValue === "string" && currentValue.includes(":");

          return (
            <div key={input.id} className="space-y-2">
              <label className="text-xs font-medium text-gray-300 block">
                {input.label}
                <span className="text-gray-500 ml-1">({input.type})</span>
              </label>

              {isConnected ? (
                <div className="px-3 py-2 bg-blue-900/30 border border-blue-700 rounded text-xs text-blue-300">
                  Connected to block output
                  <button
                    onClick={() => onUpdateInput(input.id, "")}
                    className="ml-2 text-blue-400 hover:text-blue-300"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <>
                  {/* Uniform binding dropdown */}
                  <select
                    title={`Select uniform for ${input.label}`}
                    value={
                      typeof currentValue === "string" && !currentValue.includes(":")
                        ? currentValue
                        : ""
                    }
                    onChange={(e) => handleUniformChange(input.id, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 text-white text-xs rounded border border-gray-700 focus:border-primary focus:outline-none"
                  >
                    <option value="">Use default or enter value</option>
                    <option disabled>── Uniforms ──</option>
                    {dynamicUniforms
                      .filter((u) => {
                        // Basic type compatibility
                        if (input.type === "float" && u.type === "float") return true;
                        if (
                          input.type === "vec3" &&
                          (u.type === "vec3" || u.type === "vec4")
                        )
                          return true;
                        if (
                          input.type === "color" &&
                          (u.type === "vec3" || u.type === "vec4")
                        )
                          return true;
                        return false;
                      })
                      .map((uniform) => (
                        <option key={uniform.id} value={uniform.name}>
                          {uniform.name} ({uniform.type})
                        </option>
                      ))}
                  </select>

                  {/* Manual value input */}
                  {(!currentValue ||
                    (typeof currentValue === "string" && !currentValue.includes(":"))) && (
                    <input
                      type="text"
                      placeholder={`Default: ${JSON.stringify(input.defaultValue)}`}
                      value={
                        typeof currentValue === "string" && !currentValue.includes(":")
                          ? currentValue
                          : typeof currentValue === "number"
                            ? currentValue.toString()
                            : ""
                      }
                      onChange={(e) => handleManualValueChange(input.id, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 text-white text-xs rounded border border-gray-700 focus:border-primary focus:outline-none"
                    />
                  )}
                </>
              )}

              <p className="text-xs text-gray-500">
                {isConnected
                  ? "Connected to another block's output"
                  : currentValue && typeof currentValue === "string" && !currentValue.includes(":")
                    ? `Linked to uniform: ${currentValue}`
                    : typeof currentValue === "number"
                      ? `Value: ${currentValue}`
                      : "Using default value"}
              </p>
            </div>
          );
        })}

        {blockDef.inputs.length === 0 && (
          <p className="text-gray-500 text-sm">This block has no configurable inputs</p>
        )}
      </div>

      {/* Help */}
      <div className="p-3 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          💡 Tip: Link inputs to uniforms for real-time control
        </p>
      </div>
    </div>
  );
};
