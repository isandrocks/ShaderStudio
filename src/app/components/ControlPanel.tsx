import React from "react";
import SliderControl from "./SliderControl";
import PlusIcon from "./PlusIcon";

interface ControlPanelProps {
  params: {
    speed: number;
    lineCount: number;
    amplitude: number;
    yOffset: number;
  };
  onParamChange: (key: string, value: number) => void;
  onCreateClick: () => void;
  onCancelClick: () => void;
  onAdvancedEditorClick: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  params,
  onParamChange,
  onCreateClick,
  onCancelClick,
  onAdvancedEditorClick,
}) => {
  return (
    <div
      className="w-60 bg-[#2c2c2c] rounded-lg p-4 flex flex-col gap-4 border
        border-[#3c3c3c]"
    >
      <PlusIcon />
      <SliderControl
        id="speed"
        label="Speed:"
        value={params.speed}
        min={0}
        max={3}
        step={0.1}
        format={(v) => v.toFixed(1)}
        onChange={(value) => onParamChange("speed", value)}
      />

      <SliderControl
        id="lineCount"
        label="Line Count:"
        value={params.lineCount}
        min={1}
        max={20}
        step={1}
        format={(v) => Math.round(v).toString()}
        onChange={(value) => onParamChange("lineCount", value)}
      />

      <SliderControl
        id="amplitude"
        label="Amplitude:"
        value={params.amplitude}
        min={0}
        max={0.5}
        step={0.01}
        format={(v) => v.toFixed(2)}
        onChange={(value) => onParamChange("amplitude", value)}
      />

      <SliderControl
        id="yOffset"
        label="Y Offset:"
        value={params.yOffset}
        min={-0.5}
        max={0.5}
        step={0.01}
        format={(v) => v.toFixed(2)}
        onChange={(value) => onParamChange("yOffset", value)}
      />

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
    </div>
  );
};

export default ControlPanel;
