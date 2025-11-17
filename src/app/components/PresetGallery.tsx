import React, { useState } from "react";
import { ShaderPreset, SHADER_PRESETS, ShaderCategory, getCategories } from "../presets";
import { PresetCard } from "./PresetCard";

interface PresetGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: ShaderPreset) => void;
}

export const PresetGallery: React.FC<PresetGalleryProps> = ({ isOpen, onClose, onSelectPreset }) => {
  const [selectedCategory, setSelectedCategory] = useState<ShaderCategory | "all">("all");
  const categories = getCategories();

  if (!isOpen) return null;

  const filteredPresets =
    selectedCategory === "all"
      ? SHADER_PRESETS
      : SHADER_PRESETS.filter((preset) => preset.category === selectedCategory);

  const handleSelectPreset = (preset: ShaderPreset) => {
    onSelectPreset(preset);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#1e1e1e] rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
          <h2 className="text-xl font-bold text-white">Shader Presets</h2>
          <button
            onClick={onClose}
            className="text-[#999999] hover:text-white transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 p-4 border-b border-[#3c3c3c] flex-wrap">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded transition-colors ${
              selectedCategory === "all"
                ? "bg-[#3c3c3c] text-white border border-[#4c4c4c]"
                : "bg-[#2c2c2c] text-[#999999] hover:bg-[#333333] hover:text-white"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded transition-colors capitalize ${
                selectedCategory === category
                  ? "bg-[#3c3c3c] text-white border border-[#4c4c4c]"
                  : "bg-[#2c2c2c] text-[#999999] hover:bg-[#333333] hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Preset grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPresets.map((preset) => (
              <PresetCard key={preset.id} preset={preset} onSelect={handleSelectPreset} />
            ))}
          </div>
          {filteredPresets.length === 0 && (
            <div className="text-center text-[#666666] py-12">No presets found in this category.</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#3c3c3c] text-sm text-[#999999] text-center">
          Select a preset to load it into the editor
        </div>
      </div>
    </div>
  );
};
