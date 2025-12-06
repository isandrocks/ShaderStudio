import React from "react";
import SliderControl from "./SliderControl";
import { ColorControl } from "./ColorControl";
import { Vec2Control } from "./Vec2Control";
import PlusIcon from "./icons/PlusIcon";
import SaveIcon from "./icons/SaveIcon";
import ChevronDownIcon from "./icons/ChevronDownIcon";
import EditIcon from "./icons/EditIcon";
import PaletteIcon from "./icons/PaletteIcon";
import FolderIcon from "./icons/FolderIcon";
import RectangleIcon from "./icons/RectangleIcon";
import VideoIcon from "./icons/VideoIcon";
import LayersIcon from "./icons/LayersIcon";
import SparklesIcon from "./icons/SparklesIcon";
import type { DynamicUniform, UniformValue } from "../types";

interface ControlPanelProps {
  onApplyToSelection: () => void;
  onCreateRectangle: () => void;
  selectionError: string;
  onAdvancedEditorClick: () => void;
  onPresetsClick: () => void;
  onSaveShader: () => void;
  onOpenSavedShaders: () => void;
  onExportVideo: () => void;
  dynamicUniforms: DynamicUniform[];
  onAddUniform: () => void;
  onUpdateUniform: (id: string, value: UniformValue) => void;
  onRemoveUniform: (id: string) => void;
  onToggleBuilderMode: () => void;
  onAiGenerateClick: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onApplyToSelection,
  onCreateRectangle,
  selectionError,
  onAdvancedEditorClick,
  onPresetsClick,
  onSaveShader,
  onOpenSavedShaders,
  onExportVideo,
  dynamicUniforms,
  onAddUniform,
  onUpdateUniform,
  onRemoveUniform,
  onToggleBuilderMode,
  onAiGenerateClick,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isApplyDropdownOpen, setIsApplyDropdownOpen] = React.useState(false);

  const applyDropdownRef = React.useRef<HTMLDivElement>(null);
  const moreDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isApplyDropdownOpen &&
        applyDropdownRef.current &&
        !applyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsApplyDropdownOpen(false);
      }
      if (
        isDropdownOpen &&
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isApplyDropdownOpen, isDropdownOpen]);

  const toggleApplyDropdown = () => {
    if (!isApplyDropdownOpen) {
      setIsDropdownOpen(false);
    }
    setIsApplyDropdownOpen(!isApplyDropdownOpen);
  };

  const toggleDropdown = () => {
    if (!isDropdownOpen) {
      setIsApplyDropdownOpen(false);
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

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

  const handleApplyToSelectionClick = () => {
    setIsApplyDropdownOpen(false);
    onApplyToSelection();
  };

  const handleCreateRectangleClick = () => {
    setIsApplyDropdownOpen(false);
    onCreateRectangle();
  };

  return (
    <div
      className="w-64 bg-[#2c2c2c] rounded-sm flex flex-col border
        border-[#3c3c3c] max-h-canvas overflow-hidden"
    >
      {/* Header with Add Button */}
      <div className="flex items-center justify-between p-3 pb-2 shrink-0">
        <span className="text-xs font-medium text-gray-300">Parameters</span>
        <PlusIcon
          onClick={onAddUniform}
          title="Add a controllable variable to shader"
        />
      </div>

      {/* Scrollable Dynamic Uniforms */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 flex flex-col gap-1">
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
          } else if (uniformType === "vec2") {
            return (
              <Vec2Control
                key={u.id}
                id={u.id}
                label={`${u.name}:`}
                value={u.value as [number, number]}
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
      <div
        className="pt-2 pb-3 px-3 flex flex-col gap-3 shrink-0 border-t
          border-[#3c3c3c]"
      >
        {/* Selection Error */}
        {selectionError && (
          <div
            className="text-xs text-red-400 bg-red-900/20 border border-red-800
              rounded px-2 py-1.5"
          >
            {selectionError}
          </div>
        )}

        {/* Primary Actions */}
        <div className="flex gap-2 w-full">
          <div className="relative flex-1" ref={applyDropdownRef}>
            <div className="flex gap-0 w-full">
              <button
                onClick={handleApplyToSelectionClick}
                className="flex-1 h-7 px-4 text-[13px] font-medium bg-primary
                  text-white rounded-l-md cursor-pointer transition-all
                  duration-150 outline-none border-none hover:bg-primary-hover
                  active:bg-primary-active active:scale-[0.98]"
              >
                Apply to Selection
              </button>
              <button
                onClick={toggleApplyDropdown}
                aria-label="Show apply options"
                className="w-7 h-7 flex items-center justify-center text-white
                  bg-primary rounded-r-md cursor-pointer transition-all
                  duration-150 outline-none border-none border-l
                  border-primary-active hover:bg-primary-hover
                  active:bg-primary-active"
              >
                <ChevronDownIcon />
              </button>
            </div>

            {/* Apply Dropdown Menu */}
            {isApplyDropdownOpen && (
              <div
                className="absolute bottom-full mb-1 left-0 right-0 z-10
                  bg-[#3c3c3c] border border-[#4c4c4c] rounded-sm
                  overflow-hidden shadow-lg"
              >
                <button
                  onClick={handleCreateRectangleClick}
                  className="w-full h-7 px-3 text-xs font-medium text-left
                    bg-[#3c3c3c] text-gray-300 cursor-pointer transition-all
                    duration-150 outline-none border-none hover:bg-[#454545]
                    flex items-center gap-2"
                >
                  <RectangleIcon className="w-3.5 h-3.5" />
                  <span>Create New Rectangle</span>
                </button>
                <button
                  onClick={() => {
                    setIsApplyDropdownOpen(false);
                    onExportVideo();
                  }}
                  className="w-full h-7 px-3 text-xs font-medium text-left
                    bg-[#3c3c3c] text-gray-300 cursor-pointer transition-all
                    duration-150 outline-none border-none hover:bg-[#454545]
                    flex items-center gap-2"
                >
                  <VideoIcon className="w-3.5 h-3.5" />
                  <span>Export Video</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onSaveShader}
            className="w-9 h-7 flex items-center justify-center bg-[#3c3c3c]
              text-gray-300 rounded-md cursor-pointer transition-all
              duration-150 outline-none border border-[#4c4c4c]
              hover:bg-[#454545] hover:border-[#5c5c5c] active:bg-[#2a2a2a]
              active:scale-[0.98]"
            title="Save shader to Design"
          >
            <SaveIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-2 w-full">
          <div className="relative flex-1" ref={moreDropdownRef}>
            <div className="flex gap-0 w-full">
              <button
                onClick={handleAdvancedEditorClick}
                className="flex-1 h-7 px-3 text-xs font-medium bg-[#3c3c3c]
                  text-gray-300 rounded-l-md cursor-pointer transition-all
                  duration-150 outline-none border border-[#4c4c4c]
                  hover:bg-[#454545] hover:border-[#5c5c5c] flex items-center
                  justify-center gap-2"
              >
                <EditIcon className="w-3.5 h-3.5" />
                <span>Advanced Editor</span>
              </button>
              <button
                onClick={toggleDropdown}
                aria-label="Show more options"
                className="w-7 h-7 flex items-center justify-center
                  text-gray-300 bg-[#3c3c3c] rounded-r-md cursor-pointer
                  transition-all duration-150 outline-none border border-l-0
                  border-[#4c4c4c] hover:bg-[#454545] hover:border-[#5c5c5c]"
              >
                <ChevronDownIcon />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className="absolute bottom-full mb-1 left-0 right-0 z-10
                  bg-[#3c3c3c] border border-[#4c4c4c] rounded-sm
                  overflow-hidden shadow-lg"
              >
                <button
                  onClick={handlePresetClick}
                  className="w-full h-7 px-3 text-xs font-medium text-left
                    bg-[#3c3c3c] text-gray-300 cursor-pointer transition-all
                    duration-150 outline-none border-none hover:bg-[#454545]
                    flex items-center gap-2"
                >
                  <PaletteIcon className="w-3.5 h-3.5" />
                  <span>Load Preset</span>
                </button>
                <button
                  onClick={handleMyShadersClick}
                  className="w-full h-7 px-3 text-xs font-medium text-left
                    bg-[#3c3c3c] text-gray-300 cursor-pointer transition-all
                    duration-150 outline-none border-none hover:bg-[#454545]
                    flex items-center gap-2"
                >
                  <FolderIcon className="w-3.5 h-3.5" />
                  <span>My Shaders</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onAiGenerateClick}
            className="w-9 h-7 flex items-center justify-center bg-[#3c3c3c]
              text-gray-300 rounded-md cursor-pointer transition-all
              duration-150 outline-none border border-[#4c4c4c]
              hover:bg-[#454545] hover:border-[#5c5c5c] active:bg-[#2a2a2a]
              active:scale-[0.98]"
            title="Generate with Gemini AI"
          >
            <SparklesIcon className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onToggleBuilderMode}
          className="w-full h-7 px-3 text-xs font-medium bg-[#3c3c3c]
            text-gray-300 rounded-md cursor-pointer transition-all duration-150
            outline-none border border-[#4c4c4c] hover:bg-[#454545]
            hover:border-[#5c5c5c] flex items-center justify-center gap-2"
        >
          <LayersIcon className="w-3.5 h-3.5" />
          <span>Visual Builder</span>
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
