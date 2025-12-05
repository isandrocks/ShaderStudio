import React, { useState, useRef, useEffect } from "react";
import MinusIcon from "./icons/MinusIcon";

interface Vec2ControlProps {
  id: string;
  label: string;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onDelete?: () => void;
}

export const Vec2Control: React.FC<Vec2ControlProps> = ({
  id,
  label,
  value,
  onChange,
  onDelete,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
  }>({ left: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const [x, y] = value;

  // Calculate picker position
  useEffect(() => {
    if (showPicker && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const pickerHeight = 200; // Approx height
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < pickerHeight && spaceAbove > spaceBelow) {
        setPickerPosition({
          bottom: viewportHeight - rect.top + 8,
          left: rect.left,
        });
      } else {
        setPickerPosition({
          top: rect.bottom + 8,
          left: rect.left,
        });
      }
    }
  }, [showPicker]);

  const updateFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    // Invert Y so bottom is 0 and top is 1 (standard Cartesian/UV)
    const rawY = (e.clientY - rect.top) / rect.height;
    const newY = 1 - Math.max(0, Math.min(1, rawY));

    onChange([parseFloat(newX.toFixed(2)), parseFloat(newY.toFixed(2))]);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    updateFromPointer(e);
  };

  return (
    <div className="mb-2 relative group">
      <div className="flex items-center justify-between mb-1">
        <label
          htmlFor={`${id}-x`}
          className="text-xs text-gray-300 cursor-default select-none"
        >
          {label}
        </label>
      </div>
      <div className="flex items-center gap-1">
        {/* Picker Toggle / Preview */}
        <div
          ref={buttonRef}
          onClick={() => setShowPicker(!showPicker)}
          className="w-8 h-8 bg-[#383838] border border-[#444444] rounded
            cursor-pointer hover:border-[#8c8c8c] transition-colors relative
            shrink-0"
          title="Open 2D Picker"
        >
          <div
            className="absolute w-1.5 h-1.5 bg-primary rounded-full transform
              -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${Math.min(Math.max(x, 0), 1) * 100}%`,
              top: `${(1 - Math.min(Math.max(y, 0), 1)) * 100}%`,
            }}
          />
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-500 w-3">X</span>
            <input
              id={`${id}-x`}
              type="number"
              value={x}
              step={0.01}
              onChange={(e) => onChange([parseFloat(e.target.value), y])}
              className="bg-[#383838] text-white px-1 py-0.5 rounded border
                max-w-[125px] border-[#444444] text-xs focus:outline-none
                focus:border-primary"
              aria-label={`${label} X value`}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-500 w-3">Y</span>
            <input
              id={`${id}-y`}
              type="number"
              value={y}
              step={0.01}
              onChange={(e) => onChange([x, parseFloat(e.target.value)])}
              className="bg-[#383838] text-white px-1 py-0.5 rounded border
                max-w-[125px] border-[#444444] text-xs focus:outline-none
                focus:border-primary"
              aria-label={`${label} Y value`}
            />
          </div>
        </div>

        {/* Delete Button - Aligned to top right */}
        {onDelete && (
          <div
            className="h-[22px] flex items-center justify-center w-8 shrink-0"
          >
            <button
              onClick={onDelete}
              className="text-white transition-colors flex items-center
                justify-center w-8 h-4 hover:bg-[#3c3c3c] rounded"
              title="Delete uniform"
            >
              <MinusIcon />
            </button>
          </div>
        )}
      </div>

      {/* Popover Picker */}
      {showPicker && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />
          <div
            className="fixed z-50 bg-[#2c2c2c] border border-[#3c3c3c] rounded
              shadow-xl p-2 w-48"
            style={pickerPosition}
          >
            <div
              ref={areaRef}
              className="w-full aspect-square bg-[#1e1e1e] border
                border-[#444444] relative cursor-crosshair rounded-sm"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
            >
              {/* Grid lines */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)`,
                  backgroundSize: "25% 25%",
                }}
              />

              {/* Thumb */}
              <div
                className="absolute w-3 h-3 border-2 border-white rounded-full
                  shadow-sm pointer-events-none transform -translate-x-1/2
                  -translate-y-1/2 bg-primary"
                style={{
                  left: `${Math.min(Math.max(x, 0), 1) * 100}%`,
                  top: `${(1 - Math.min(Math.max(y, 0), 1)) * 100}%`,
                }}
              />
            </div>
            <div className="mt-2 text-[10px] text-gray-400 text-center">
              Drag to adjust X/Y (0-1)
            </div>
          </div>
        </>
      )}
    </div>
  );
};
