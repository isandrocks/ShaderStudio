/**
 * Block Palette - Draggable library of effect blocks
 */

import React, { useState } from "react";
import { BLOCK_REGISTRY, getBlockCategories } from "../blocks/registry";
import { BlockCategory } from "../types";

interface BlockPaletteProps {
  onAddBlock: (blockType: string, position?: { x: number; y: number }) => void;
}

export const BlockPalette: React.FC<BlockPaletteProps> = ({ onAddBlock }) => {
  const [selectedCategory, setSelectedCategory] = useState<BlockCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = getBlockCategories();

  // Filter blocks by category and search
  const filteredBlocks = BLOCK_REGISTRY.filter((block) => {
    const matchesCategory = selectedCategory === "all" || block.type === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBlockClick = (blockType: string) => {
    onAddBlock(blockType);
  };

  return (
    <div className="h-full flex flex-col bg-gray-800 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3">Blocks</h3>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search blocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 text-white text-sm rounded border border-gray-700 focus:border-primary focus:outline-none"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-700">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            selectedCategory === "all"
              ? "bg-primary text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-2 py-1 text-xs rounded transition-colors capitalize ${
              selectedCategory === category
                ? "bg-primary text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Block List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredBlocks.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-4">No blocks found</p>
        ) : (
          <div className="space-y-1">
            {filteredBlocks.map((block) => (
              <button
                key={block.id}
                onClick={() => handleBlockClick(block.id)}
                className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded text-left transition-colors group"
                title={block.description}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl">{block.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {block.name}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {block.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="p-3 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Click a block to add it to the canvas
        </p>
      </div>
    </div>
  );
};
