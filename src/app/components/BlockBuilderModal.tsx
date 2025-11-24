/**
 * Block Builder Modal - Main visual shader builder interface
 */

import React, { useState } from "react";
import { BaseModal } from "./BaseModal";
import { BlockPalette } from "./BlockPalette";
import { BlockCanvas } from "./BlockCanvas";
import { BlockProperties } from "./BlockProperties";
import { BlockInstance, DynamicUniform, UniformValue } from "../types";
import { createBlockInstance } from "../blocks/utils";

interface BlockBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (blocks: BlockInstance[]) => void;
  initialBlocks?: BlockInstance[];
  dynamicUniforms: DynamicUniform[];
}

const BlockBuilderModal: React.FC<BlockBuilderModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialBlocks = [],
  dynamicUniforms,
}) => {
  const [blocks, setBlocks] = useState<BlockInstance[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [history, setHistory] = useState<BlockInstance[][]>([initialBlocks]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const saveToHistory = (newBlocks: BlockInstance[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleAddBlock = (blockType: string) => {
    const newBlock = createBlockInstance(
      blockType,
      { x: 0, y: 0 } // Position doesn't matter since we're not using absolute positioning
    );
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    saveToHistory(newBlocks);
  };

  const handleRemoveBlock = (blockId: string) => {
    const newBlocks = blocks.filter((block) => block.id !== blockId);
    setBlocks(newBlocks);
    saveToHistory(newBlocks);
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const handleUpdateInput = (inputId: string, value: UniformValue | string) => {
    if (!selectedBlockId) return;
    
    const newBlocks = blocks.map((block) => {
      if (block.id === selectedBlockId) {
        const newInputValues = { ...block.inputValues };
        if (value === "") {
          delete newInputValues[inputId];
        } else {
          newInputValues[inputId] = value;
        }
        return { ...block, inputValues: newInputValues };
      }
      return block;
    });
    
    setBlocks(newBlocks);
    saveToHistory(newBlocks);
  };

  const handleConnect = (
    fromBlockId: string,
    outputId: string,
    toBlockId: string,
    inputId: string
  ) => {
    const newBlocks = blocks.map((block) => {
      if (block.id === toBlockId) {
        const newInputValues = { ...block.inputValues };
        newInputValues[inputId] = `${fromBlockId}:${outputId}`;
        return { ...block, inputValues: newInputValues };
      }
      return block;
    });
    
    setBlocks(newBlocks);
    saveToHistory(newBlocks);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBlocks(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBlocks(history[newIndex]);
    }
  };

  const handleApply = () => {
    onApply(blocks);
    onClose();
  };

  const handleReset = () => {
    const resetBlocks = initialBlocks;
    setBlocks(resetBlocks);
    setSelectedBlockId(null);
    setHistory([resetBlocks]);
    setHistoryIndex(0);
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Block-Based Shader Builder"
      maxWidth="1400px"
    >
      <div className="flex gap-4 h-[700px]">
        {/* Left Panel: Block Palette */}
        <div className="w-64 shrink-0">
          <BlockPalette onAddBlock={handleAddBlock} />
        </div>

        {/* Center Panel: Canvas */}
        <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden relative">
          <BlockCanvas
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
            onRemoveBlock={handleRemoveBlock}
            onConnect={handleConnect}
          />
        </div>

        {/* Right Panel: Properties */}
        <div className="w-64 shrink-0">
          <BlockProperties
            selectedBlock={selectedBlock}
            dynamicUniforms={dynamicUniforms}
            onUpdateInput={handleUpdateInput}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            {blocks.length} block{blocks.length !== 1 ? "s" : ""}
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              title="Undo (Ctrl+Z)"
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
            >
              ↶ Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              title="Redo (Ctrl+Y)"
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
            >
              ↷ Redo
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={blocks.length === 0}
            className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            Generate Shader
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default BlockBuilderModal;
