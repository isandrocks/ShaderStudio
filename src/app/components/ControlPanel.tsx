import React from "react";
import SliderControl from "./SliderControl";
import PlusIcon from "./PlusIcon";
import type { DynamicUniform } from "../webgl";

interface ControlPanelProps {
  onCreateClick: () => void;
  onCancelClick: () => void;
  onAdvancedEditorClick: () => void;
  onPresetsClick: () => void;
  onSaveShader: () => void;
  onOpenSavedShaders: () => void;
  dynamicUniforms: DynamicUniform[];
  onAddUniform: () => void;
  onUpdateUniform: (id: string, value: number) => void;
  onRemoveUniform: (id: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onCreateClick,
  onCancelClick,
  onAdvancedEditorClick,
  onPresetsClick,
  onSaveShader,
  onOpenSavedShaders,
  dynamicUniforms,
  onAddUniform,
  onUpdateUniform,
  onRemoveUniform,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isCanvasDropdownOpen, setIsCanvasDropdownOpen] = React.useState(false);

  const handlePresetClick = () => {
    setIsDropdownOpen(false);
    onPresetsClick();
  };

  const handleAdvancedEditorClick = () => {
    setIsDropdownOpen(false);
    onAdvancedEditorClick();
  };

  const handleMyShadersClick = () => {
    setIsDropdownOpen(false);
    onOpenSavedShaders();
  };

  const handleCreateClick = () => {
    setIsCanvasDropdownOpen(false);
    onCreateClick();
  };

  const handleSaveClick = () => {
    setIsCanvasDropdownOpen(false);
    onSaveShader();
  };

  return (
    <div
      className="w-64 bg-[#2a2a2a] rounded-lg p-3 flex flex-col gap-3 border
        border-[#3c3c3c]"
    >
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-300">Parameters</span>
        <PlusIcon onClick={onAddUniform} title="Add parameter" />
      </div>

      {/* Dynamic Uniforms */}
      {dynamicUniforms.map((u) => {
        const decimals = u.step >= 1 ? 0 : u.step >= 0.1 ? 1 : 2;
        return (
          <SliderControl
            key={u.id}
            id={u.id}
            label={`${u.name}:`}
            value={u.value}
            min={u.min}
            max={u.max}
            step={u.step}
            format={(v) => v.toFixed(decimals)}
            onChange={(value) => onUpdateUniform(u.id, value)}
            onDelete={() => onRemoveUniform(u.id)}
          />
        );
      })}

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col gap-3">
        {/* Primary Actions */}
        <div className="flex gap-2 w-full">
          <div className="flex-1 relative">
            <div className="flex gap-0 w-full">
              <button
                onClick={handleCreateClick}
                className="flex-1 h-7 px-4 text-[13px] font-medium bg-primary
                  text-white rounded-l-md cursor-pointer transition-all
                  duration-150 outline-none border-none hover:bg-primary-hover
                  active:bg-primary-active active:scale-[0.98]"
              >
                Add to canvas
              </button>
              <button
                onClick={() => setIsCanvasDropdownOpen(!isCanvasDropdownOpen)}
                className="w-7 h-7 flex items-center justify-center text-white
                  bg-primary rounded-r-md cursor-pointer transition-all
                  duration-150 outline-none border-none hover:bg-primary-hover
                  active:bg-primary-active"
              >
                <span className="text-[10px]">▼</span>
              </button>
            </div>

            {/* Canvas Dropdown Menu */}
            {isCanvasDropdownOpen && (
              <div
                className="absolute top-full left-0 right-0 z-10
                  bg-[#3c3c3c] border border-[#4c4c4c] rounded-sm
                  overflow-hidden shadow-lg"
              >
                <button
                  onClick={handleSaveClick}
                  className="w-full h-7 px-3 text-xs font-medium text-left
                    bg-[#3c3c3c] text-gray-300 cursor-pointer transition-all
                    duration-150 outline-none border-none hover:bg-[#454545]"
                >
                  💾 Save
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onCancelClick}
            className="w-9 h-7 text-[13px] font-medium bg-[#3c3c3c]
              text-gray-300 rounded-md cursor-pointer transition-all
              duration-150 outline-none border border-[#4c4c4c]
              hover:bg-[#454545] hover:border-[#5c5c5c] active:bg-[#2a2a2a]
              active:scale-[0.98]"
          >
            ✕
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="relative">
          <div className="flex gap-0 w-full">
            <button
              onClick={handlePresetClick}
              className="flex-1 h-7 px-3 text-xs font-medium bg-[#3c3c3c]
                text-gray-300 rounded-l-md cursor-pointer transition-all
                duration-150 outline-none border border-[#4c4c4c]
                hover:bg-[#454545] hover:border-[#5c5c5c]"
            >
              🎨 Load Preset
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
              className="absolute top-full left-0 right-0 z-10 bg-[#3c3c3c]
                border border-[#4c4c4c] rounded-sm overflow-hidden shadow-lg"
            >
              <button
                onClick={handleMyShadersClick}
                className="w-full h-7 px-3 text-xs font-medium text-left
                  bg-[#3c3c3c] text-gray-300 cursor-pointer transition-all
                  duration-150 outline-none border-none hover:bg-[#454545]"
              >
                📂 My Shaders
              </button>
              <button
                onClick={handleAdvancedEditorClick}
                className="w-full h-7 px-3 text-xs font-medium text-left
                  bg-[#3c3c3c] text-gray-300 cursor-pointer transition-all
                  duration-150 outline-none border-none hover:bg-[#454545]"
              >
                Advanced Editor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
