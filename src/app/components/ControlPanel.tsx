import React from "react";
import SliderControl from "./SliderControl";
import { ColorControl } from "./ColorControl";
import PlusIcon from "./PlusIcon";
import SaveIcon from "./SaveIcon";
import type { DynamicUniform, UniformValue } from "../types";

interface ControlPanelProps {
  onCreateClick: () => void;
  onAdvancedEditorClick: () => void;
  onPresetsClick: () => void;
  onSaveShader: () => void;
  onOpenSavedShaders: () => void;
  onBlockBuilderClick: () => void;
  dynamicUniforms: DynamicUniform[];
  onAddUniform: () => void;
  onUpdateUniform: (id: string, value: UniformValue) => void;
  onRemoveUniform: (id: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onCreateClick,
  onAdvancedEditorClick,
  onPresetsClick,
  onSaveShader,
  onOpenSavedShaders,
  onBlockBuilderClick,
  dynamicUniforms,
  onAddUniform,
  onUpdateUniform,
  onRemoveUniform,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const handleAdvancedEditorClick = () => {
    setIsDropdownOpen(false);
    onAdvancedEditorClick();
  };

  const handlePresetClick = () => {
    setIsDropdownOpen(false);
    onPresetsClick();
  };

  const handleMyShadersClick = () => {
    setIsDropdownOpen(false);
    onOpenSavedShaders();
  };

  return (
    <div
      className="w-64 bg-[#2a2a2a] rounded-sm flex flex-col border
        border-[#3c3c3c] max-h-canvas overflow-hidden"
    >
      {/* Header with Add Button */}
      <div className="flex items-center justify-between p-3 pb-2 shrink-0">
        <span className="text-xs font-medium text-gray-300">Parameters</span>
        <PlusIcon onClick={onAddUniform} title="Add parameter" />
      </div>

      {/* Scrollable Dynamic Uniforms */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 flex flex-col gap-3">
      {dynamicUniforms.map((u) => {
        const uniformType = u.type || "float";

        // Render appropriate control based on type
        if (uniformType === "float") {
          const decimals = u.step >= 1 ? 0 : u.step >= 0.1 ? 1 : 2;
          return (
            <SliderControl
              key={u.id}
              id={u.id}
              label={`${u.name}:`}
              value={u.value as number}
              min={u.min}
              max={u.max}
              step={u.step}
              format={(v) => v.toFixed(decimals)}
              onChange={(value) => onUpdateUniform(u.id, value)}
              onDelete={() => onRemoveUniform(u.id)}
            />
          );
        } else if (uniformType === "vec3" || uniformType === "vec4") {
          return (
            <ColorControl
              key={u.id}
              id={u.id}
              label={`${u.name}:`}
              value={
                u.value as
                  | [number, number, number]
                  | [number, number, number, number]
              }
              type={uniformType}
              onChange={(value) => onUpdateUniform(u.id, value)}
              onDelete={() => onRemoveUniform(u.id)}
            />
          );
        }
        return null;
      })}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 pb-3 px-3 flex flex-col gap-3 shrink-0 border-t border-[#3c3c3c]">
        {/* Primary Actions */}
        <div className="flex gap-2 w-full">
          <button
            onClick={onCreateClick}
            className="flex-1 h-7 px-4 text-[13px] font-medium bg-primary
              text-white rounded-md cursor-pointer transition-all
              duration-150 outline-none border-none hover:bg-primary-hover
              active:bg-primary-active active:scale-[0.98]"
          >
            Add to canvas
          </button>

          <button
            onClick={onSaveShader}
            className="w-9 h-7 flex items-center justify-center
              bg-[#3c3c3c] text-gray-300 rounded-md cursor-pointer
              transition-all duration-150 outline-none border
              border-[#4c4c4c] hover:bg-[#454545]
              hover:border-[#5c5c5c] active:bg-[#2a2a2a]
              active:scale-[0.98]"
            title="Save shader"
          >
            <SaveIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="relative">
          <div className="flex gap-0 w-full">
            <button
              onClick={handleAdvancedEditorClick}
              className="flex-1 h-7 px-3 text-xs font-medium bg-[#3c3c3c]
                text-gray-300 rounded-l-md cursor-pointer transition-all
                duration-150 outline-none border border-[#4c4c4c]
                hover:bg-[#454545] hover:border-[#5c5c5c]"
            >
              📝 Advanced Editor
            </button>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-7 h-7 flex items-center justify-center text-gray-300
                bg-[#3c3c3c] rounded-r-md cursor-pointer transition-all
                duration-150 outline-none border border-l-0 border-[#4c4c4c]
                hover:bg-[#454545] hover:border-[#5c5c5c]"
            >
              <span className="text-[10px]">▼</span>
            </button>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              className="absolute bottom-full mb-1 left-0 right-0 z-10 bg-[#3c3c3c]
                border border-[#4c4c4c] rounded-sm overflow-hidden shadow-lg"
            >
              <button
                onClick={handlePresetClick}
                className="w-full h-7 px-3 text-xs font-medium text-left
                  bg-[#3c3c3c] text-gray-300 cursor-pointer transition-all
                  duration-150 outline-none border-none hover:bg-[#454545]"
              >
                🎨 Load Preset
              </button>
              <button
                onClick={onBlockBuilderClick}
                className="w-full h-7 px-3 text-xs font-medium text-left
                  bg-[#3c3c3c] text-gray-300 cursor-pointer transition-all
                  duration-150 outline-none border-none hover:bg-[#454545]"
              >
                🧩 Block Builder
              </button>
              <button
                onClick={handleMyShadersClick}
                className="w-full h-7 px-3 text-xs font-medium text-left
                  bg-[#3c3c3c] text-gray-300 cursor-pointer transition-all
                  duration-150 outline-none border-none hover:bg-[#454545]"
              >
                📂 My Shaders
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
