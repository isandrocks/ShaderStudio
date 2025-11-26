import React from "react";
import { EffectLayer } from "../../types";
import PlusIcon from "../icons/PlusIcon";
import DeleteIcon from "../icons/DeleteIcon";
import EyeIcon from "../icons/EyeIcon";
import EyeOffIcon from "../icons/EyeOffIcon";
import ChevronDownIcon from "../icons/ChevronDownIcon";
import CodeIcon from "../icons/CodeIcon";

interface LayerPanelProps {
  layers: EffectLayer[];
  selectedLayerId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onToggleCodeMode: () => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  selectedLayerId,
  onSelect,
  onAdd,
  onRemove,
  onToggleVisibility,
  onReorder,
  onToggleCodeMode,
}) => {
  return (
    <div
      className="flex flex-col h-full w-52 bg-[#1e1e1e] border-r
        border-[#3c3c3c]"
    >
      <div
        className="p-3 border-b border-[#3c3c3c] flex justify-between
          items-center"
      >
        <h2 className="text-xs font-bold text-white uppercase tracking-wider">
          Layers
        </h2>
        <button
          onClick={onAdd}
          className="p-1 hover:bg-[#3c3c3c] rounded text-white"
          title="Add Layer"
        >
          <PlusIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {layers.length === 0 && (
          <div className="text-center text-[#999] text-xs py-8">
            No layers. Click + to add one.
          </div>
        )}

        {/* Render in reverse order so top layer is at top of list */}
        {[...layers].reverse().map((layer, reverseIndex) => {
          const index = layers.length - 1 - reverseIndex;
          const isSelected = layer.id === selectedLayerId;

          return (
            <div
              key={layer.id}
              className={` group flex items-center p-2 rounded cursor-pointer
              select-none
              ${isSelected ? "bg-primary text-white" : "hover:bg-[#2a2a2a] text-[#e0e0e0]"}
              `}
              onClick={() => onSelect(layer.id)}
            >
              {/* Visibility Toggle */}
              <button
                className={`mr-2 text-xs
                ${layer.visible ? "opacity-100" : "opacity-30"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(layer.id);
                }}
                title={layer.visible ? "Hide Layer" : "Show Layer"}
              >
                {layer.visible ? (
                  <EyeIcon className="w-3 h-3" />
                ) : (
                  <EyeOffIcon className="w-3 h-3" />
                )}
              </button>

              {/* Layer Name */}
              <div className="flex-1 text-xs truncate font-medium">
                {layer.name}
              </div>

              {/* Actions (visible on hover or selected) */}
              <div
                className={`flex items-center gap-1
                ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              >
                {/* Simple Reorder Buttons */}
                <div className="flex flex-col mr-1">
                  <button
                    className="text-[8px] leading-none hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index < layers.length - 1)
                        onReorder(index, index + 1);
                    }}
                    disabled={index === layers.length - 1}
                    title="Move Up"
                  >
                    <ChevronDownIcon className="w-2 h-2 rotate-180" />
                  </button>
                  <button
                    className="text-[8px] leading-none hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index > 0) onReorder(index, index - 1);
                    }}
                    disabled={index === 0}
                    title="Move Down"
                  >
                    <ChevronDownIcon className="w-2 h-2" />
                  </button>
                </div>

                <button
                  className="p-1 hover:bg-black/20 rounded w-4 h-4 flex
                    items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(layer.id);
                  }}
                  title="Delete Layer"
                >
                  <DeleteIcon className="w-4 h-4 fill-white" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-[#3c3c3c]">
        <button
          onClick={onToggleCodeMode}
          className="w-full h-7 px-3 text-xs font-medium bg-[#3c3c3c]
            text-gray-300 rounded cursor-pointer hover:bg-[#454545] flex
            items-center justify-center gap-2"
        >
          <CodeIcon className="w-3.5 h-3.5" />
          <span>Switch to Code Mode</span>
        </button>
      </div>
    </div>
  );
};
