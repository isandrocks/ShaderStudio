import React from "react";
import SliderControl from "./SliderControl";
import PlusIcon from "./PlusIcon";
import type { DynamicUniform } from "../webgl";

interface ControlPanelProps {
  onCreateClick: () => void;
  onCancelClick: () => void;
  onAdvancedEditorClick: () => void;
  onPresetsClick: () => void;
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
  dynamicUniforms,
  onAddUniform,
  onUpdateUniform,
  onRemoveUniform,
}) => {
  return (
    <div
      className="w-60 bg-[#2c2c2c] rounded-lg p-4 flex flex-col gap-4 border
        border-[#3c3c3c]"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-300">Parameters</span>
        <PlusIcon onClick={onAddUniform} title="Add parameter" />
      </div>

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

      <div className="flex gap-2 w-full">
        <button
          onClick={onCreateClick}
          className="flex-1 px-4 py-2.5 text-[13px] font-medium font-inherit
            border-none rounded-md cursor-pointer transition-all duration-150
            outline-none bg-primary text-white hover:bg-primary-hover
            active:bg-primary-active active:scale-[0.98]"
        >
          Create
        </button>
        <button
          onClick={onCancelClick}
          className="flex-1 px-4 py-2.5 text-[13px] font-medium font-inherit
            border-none rounded-md cursor-pointer transition-all duration-150
            outline-none bg-[#2c2c2c] text-white border border-[#3c3c3c]
            hover:bg-[#333333] active:bg-[#2a2a2a] active:scale-[0.98]"
        >
          Cancel
        </button>
      </div>

      <button
        onClick={onAdvancedEditorClick}
        className="w-full bg-[#3c3c3c] border border-[#4c4c4c] p-1 text-xs
          font-medium text-gray-200 cursor-pointer rounded-md transition-all
          duration-150 hover:bg-[#454545] hover:border-primary"
      >
        Advanced Editor
      </button>

      <button
        onClick={onPresetsClick}
        className="w-full bg-[#3c3c3c] border border-[#4c4c4c] p-1 text-xs
          font-medium text-gray-200 cursor-pointer rounded-md transition-all
          duration-150 hover:bg-[#454545] hover:border-primary"
      >
        🎨 Load Preset
      </button>
    </div>
  );
};

export default ControlPanel;
