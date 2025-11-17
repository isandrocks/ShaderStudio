import React from "react";
import { ShaderPreset } from "../presets";

interface PresetCardProps {
  preset: ShaderPreset;
  onSelect: (preset: ShaderPreset) => void;
}

export const PresetCard: React.FC<PresetCardProps> = ({ preset, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(preset)}
      className="cursor-pointer rounded-lg border border-[#3c3c3c] bg-[#2c2c2c] p-4 transition-all hover:border-[#4c4c4c] hover:bg-[#333333]"
    >
      {/* Preview placeholder - could be enhanced with actual canvas preview */}
      <div className="mb-3 h-32 w-full rounded bg-[#1e1e1e] flex items-center justify-center text-[#666666] text-xs">
        {preset.thumbnail ? (
          <img src={preset.thumbnail} alt={preset.name} className="w-full h-full object-cover rounded" />
        ) : (
          "Preview"
        )}
      </div>

      {/* Preset name */}
      <h3 className="font-semibold text-white mb-1">{preset.name}</h3>

      {/* Category badge */}
      <div className="mb-2">
        <span className="inline-block px-2 py-1 text-xs rounded bg-[#3c3c3c] text-gray-300">
          {preset.category}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-[#999999] line-clamp-2">{preset.description}</p>
    </div>
  );
};
