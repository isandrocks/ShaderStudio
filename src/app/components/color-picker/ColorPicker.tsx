import React, { useRef, useEffect } from "react";
import { ColorPickerArea } from "./ColorPickerArea";
import { ColorPickerHue } from "./ColorPickerHue";
import { ColorPickerAlpha } from "./ColorPickerAlpha";
import { rgbToHsv, hsvToRgb, type HSV } from "./utils";

interface ColorPickerProps {
  value: [number, number, number] | [number, number, number, number];
  type: "vec3" | "vec4";
  onChange: (
    value: [number, number, number] | [number, number, number, number],
  ) => void;
  onClose: () => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  type,
  onChange,
  onClose,
}) => {
  // Get current color in RGBA [0-1]
  const [r, g, b, a = 1] = value;

  // Store HSV internally to preserve hue when saturation is 0
  const hsvRef = useRef<HSV>(rgbToHsv(r, g, b));

  // Update HSV when RGB changes externally (e.g., from hex input)
  useEffect(() => {
    const newHsv = rgbToHsv(r, g, b);
    // Only update hue if saturation is > 0 (otherwise preserve current hue)
    if (newHsv.s > 0) {
      hsvRef.current = newHsv;
    } else {
      // Keep existing hue, but update s and v
      hsvRef.current = { ...hsvRef.current, s: newHsv.s, v: newHsv.v };
    }
  }, [r, g, b]);

  const updateColor = (newHsv: HSV, newAlpha: number = a) => {
    hsvRef.current = newHsv;
    const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
    if (type === "vec3") {
      onChange([rgb.r, rgb.g, rgb.b]);
    } else {
      onChange([rgb.r, rgb.g, rgb.b, newAlpha]);
    }
  };

  const handleHsvChange = (newHsv: HSV) => {
    updateColor(newHsv, a);
  };

  const handleAlphaChange = (newAlpha: number) => {
    updateColor(hsvRef.current, newAlpha);
  };

  return (
    <div
      className="w-60 p-3 bg-[#1e1e1e] rounded-[13px]
        shadow-[0_0_0.5px_rgba(0,0,0,0.12),0_10px_16px_rgba(0,0,0,0.12),0_2px_5px_rgba(0,0,0,0.15)]"
    >
      {/* Color area */}
      <ColorPickerArea hsv={hsvRef.current} onHsvChange={handleHsvChange} />

      {/* Hue slider */}
      <ColorPickerHue hsv={hsvRef.current} onHsvChange={handleHsvChange} />

      {/* Alpha slider (only for vec4) */}
      {type === "vec4" && (
        <ColorPickerAlpha
          r={r}
          g={g}
          b={b}
          alpha={a}
          onAlphaChange={handleAlphaChange}
        />
      )}

      {/* Done button */}
      <button
        onClick={onClose}
        className="w-full h-6 px-3 bg-transparent text-white text-xs font-normal
          rounded-sm transition-colors outline-1 -outline-offset-1
          outline-[#8c8c8c] hover:outline-[#8c8c8c] active:bg-[#2c2c2c]"
        style={{ cursor: "default" }}
      >
        Done
      </button>
    </div>
  );
};
