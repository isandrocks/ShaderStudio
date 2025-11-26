import React from "react";
import MinusIcon from "./MinusIcon";

interface SliderControlProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (value: number) => void;
  onDelete?: () => void;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  onDelete,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="flex justify-between items-center text-xs font-normal
          text-gray-300"
      >
        <span>{label}</span>
        <span className="text-primary font-bold min-w-10 text-right pl-[18px]">
          {format(value)}
        </span>
      </label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          title={label}
          className="slider-input flex-1"
        />
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-white transition-colors flex items-center justify-center w-8 h-4 hover:bg-[#3c3c3c] rounded"
            title="Delete uniform"
          >
            <MinusIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default SliderControl;
