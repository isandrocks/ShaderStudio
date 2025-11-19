import React from "react";
import DeleteIcon from "./DeleteIcon";

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
          text-gray-200"
      >
        <span>{label}</span>
        <span className="text-primary font-bold min-w-10 text-right pl-[18px]">
          {format(value)}
        </span>
      </label>
      <div className="relative w-[90%]">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          title={label}
          className="slider-input"
        />
        {onDelete ? (
          <span onClick={onDelete} role="button" aria-label={`Delete ${label}`}>
            <DeleteIcon className="h-3 w-3 cursor-pointer -top-1 -right-4" />
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default SliderControl;
