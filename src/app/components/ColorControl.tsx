import React, { useState, useRef, useEffect } from "react";
import DeleteIcon from "./DeleteIcon";
import { ColorPicker } from "./color-picker/ColorPicker";
import { ColorPickerInput } from "./color-picker/ColorPickerInput";
import { rgbaToCssString } from "./color-picker/utils";

interface ColorControlProps {
  id: string;
  label: string;
  value: [number, number, number] | [number, number, number, number];
  type: "vec3" | "vec4";
  onChange: (
    value: [number, number, number] | [number, number, number, number],
  ) => void;
  onDelete?: () => void;
}

export const ColorControl: React.FC<ColorControlProps> = ({
  id,
  label,
  value,
  type,
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

  // Get current color in RGBA [0-1]
  const [r, g, b, a = 1] = value;

  // Calculate picker position when it opens
  useEffect(() => {
    if (showPicker && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const pickerHeight = 380;
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

  // Color strings for display
  const colorPreview = rgbaToCssString(r, g, b, a);
  
  // Show percentage for alpha in vec4
  const alphaPercent = Math.round(a * 100);

  return (
    <div className="mb-1 relative">
      <div className="mb-1 flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-normal text-white cursor-default select-none"
        >
          {label}
        </label>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-400 transition-colors"
            title="Delete uniform"
            style={{ cursor: "default" }}
          >
            <DeleteIcon className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Value field container - Figma style */}
      <div
        ref={buttonRef}
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center h-6 rounded-sm bg-[#373737] outline-1 -outline-offset-1 outline-transparent
          hover:outline-[#8c8c8c] transition-colors"
        style={{ cursor: "default" }}
        title="Click to open color picker"
      >
        {/* Color swatch - left side with border */}
        <div className="relative flex items-center justify-center h-6 w-6 shrink-0">
          {/* Checkerboard background for transparency */}
          {type === "vec4" && a < 1 && (
            <div 
              className="absolute inset-[3px] rounded-[3px]"
              style={{
                backgroundImage: `url('data:image/svg+xml;utf8,<svg width="2" height="2" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h1v2h1V1H0" fill-rule="nonzero" fill="%23e1e1e1"/></svg>')`,
                backgroundSize: "4px 4px",
                backgroundColor: "#fff",
              }}
            />
          )}
          {/* Actual color */}
          <div 
            className="absolute inset-[3px] rounded-[3px]"
            style={{ backgroundColor: colorPreview }}
          />
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-[#2d2d2d] shrink-0" />

        {/* Hex value - center (editable) */}
        <ColorPickerInput 
          r={r} 
          g={g} 
          b={b} 
          a={a} 
          type={type} 
          onChange={onChange} 
        />

        {/* Alpha percentage for vec4 - right side */}
        {type === "vec4" && (
          <>
            <div className="h-4 w-px bg-[#1e1e1e] shrink-0" />
            <div className="w-11 px-2 text-xs font-normal text-[#b3b3b3] text-center select-none">
              {alphaPercent}%
            </div>
          </>
        )}
      </div>

      {/* Color picker popover */}
      {showPicker && (
        <>
          {/* Backdrop to close picker */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />

          {/* Picker popup - Figma style */}
          <div
            className="fixed z-50"
            style={pickerPosition}
          >
            <ColorPicker 
              value={value} 
              type={type} 
              onChange={onChange} 
              onClose={() => setShowPicker(false)} 
            />
          </div>
        </>
      )}
    </div>
  );
};
