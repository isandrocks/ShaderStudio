import React, { useState, useEffect } from "react";
import MinusIcon from "./icons/MinusIcon";

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
  const [inputValue, setInputValue] = useState(format(value));
  const [isEditing, setIsEditing] = useState(false);

  // Sync input value with prop value when not editing
  useEffect(() => {
    if (!isEditing) {
      setInputValue(format(value));
    }
  }, [value, format, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const commitValue = () => {
    setIsEditing(false);
    let newValue = parseFloat(inputValue);

    if (isNaN(newValue)) {
      // Revert to current prop value if invalid
      setInputValue(format(value));
      return;
    }

    // Clamp value
    newValue = Math.min(Math.max(newValue, min), max);

    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex justify-between items-center text-xs font-normal
          text-gray-300"
      >
        <label className="cursor-default select-none">{label}</label>
        <input
          type="text"
          aria-label={`Value for ${label}`}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsEditing(true)}
          onBlur={commitValue}
          onKeyDown={handleKeyDown}
          className="bg-[#383838] border border-[#444444] rounded px-1.5 py-0.5
            text-right text-xs w-16 text-white focus:border-primary
            focus:outline-none hover:border-[#555555] transition-colors
            font-mono"
        />
      </div>
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
          style={{
            background: `linear-gradient(to right, var(--color-primary) ${percentage}%, #3c3c3c ${percentage}%)`,
          }}
        />
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-white transition-colors flex items-center
              justify-center w-8 h-4 hover:bg-[#3c3c3c] rounded"
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
