import React, { useState, useRef, useEffect } from "react";
import { RgbaColorPicker, RgbColorPicker } from "react-colorful";
import DeleteIcon from "./DeleteIcon";

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
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calculate picker position when it opens
  useEffect(() => {
    if (showPicker && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const pickerHeight = 320; // Approximate height of color picker + button
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Position picker above if not enough space below
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

  // Convert from GLSL [0-1] to RGB [0-255]
  const toRgb = (
    glslValue: [number, number, number] | [number, number, number, number],
  ) => {
    if (type === "vec3") {
      const [r, g, b] = glslValue as [number, number, number];
      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
      };
    } else {
      const [r, g, b, a] = glslValue as [number, number, number, number];
      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
        a: a ?? 1,
      };
    }
  };

  // Convert from RGB [0-255] to GLSL [0-1]
  const toGlsl = (rgbValue: {
    r: number;
    g: number;
    b: number;
    a?: number;
  }): [number, number, number] | [number, number, number, number] => {
    if (type === "vec3") {
      return [rgbValue.r / 255, rgbValue.g / 255, rgbValue.b / 255];
    } else {
      return [
        rgbValue.r / 255,
        rgbValue.g / 255,
        rgbValue.b / 255,
        rgbValue.a ?? 1,
      ];
    }
  };

  const currentColor = toRgb(value);

  // Ensure alpha is always defined for vec4
  const currentColorWithAlpha =
    type === "vec4"
      ? { ...currentColor, a: currentColor.a ?? 1 }
      : currentColor;

  const colorPreview =
    type === "vec3"
      ? `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
      : `rgba(${currentColorWithAlpha.r}, ${currentColorWithAlpha.g}, ${currentColorWithAlpha.b}, ${currentColorWithAlpha.a})`;

  const colorText =
    type === "vec3"
      ? `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
      : `rgba(${currentColorWithAlpha.r}, ${currentColorWithAlpha.g}, ${currentColorWithAlpha.b}, ${currentColorWithAlpha.a?.toFixed(2)})`;

  return (
    <div className="mb-1 relative">
      <div className="mb-1 flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-medium text-white cursor-pointer"
          onClick={() => setShowPicker(!showPicker)}
        >
          {label}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{colorText}</span>
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-red-400 transition-colors"
              title="Delete uniform"
            >
              <DeleteIcon className="h-3 w-3 fill-red-600 cursor-pointer right-2 top-9" />
            </button>
          )}
        </div>
      </div>

      {/* Color swatch button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="w-full h-10 rounded border-2 border-gray-600
          hover:border-primary transition-colors cursor-pointer"
        style={{ backgroundColor: colorPreview }}
        title="Click to open color picker"
      />

      {/* Color picker popover */}
      {showPicker && (
        <>
          {/* Backdrop to close picker */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />

          {/* Picker popup - fixed positioning with smart placement */}
          <div
            className="fixed z-50 p-3 bg-[#1e1e1e] border border-gray-600
              rounded shadow-lg max-h-[90vh] overflow-y-auto"
            style={pickerPosition}
          >
            {type === "vec3" ? (
              <RgbColorPicker
                color={currentColor as { r: number; g: number; b: number }}
                onChange={(newColor) => {
                  onChange(toGlsl(newColor));
                }}
              />
            ) : (
              <RgbaColorPicker
                color={
                  currentColorWithAlpha as {
                    r: number;
                    g: number;
                    b: number;
                    a: number;
                  }
                }
                onChange={(newColor) => {
                  onChange(toGlsl(newColor));
                }}
              />
            )}

            <button
              onClick={() => setShowPicker(false)}
              className="mt-3 w-full px-3 py-1.5 bg-primary
                hover:bg-primary-hover active:bg-primary-active text-white
                text-sm rounded transition-colors"
            >
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
};
