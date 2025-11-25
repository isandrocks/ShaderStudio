import React, { useRef } from "react";
import { hsvToRgb, rgbToCssString, type HSV } from "./utils";

interface ColorPickerHueProps {
  hsv: HSV;
  onHsvChange: (hsv: HSV) => void;
}

/**
 * Hue gradient with 32 color stops for smooth transitions
 */
const HUE_GRADIENT = `linear-gradient(90deg,
  rgb(255, 0, 0) 8px,
  rgb(255, 48, 0),
  rgb(255, 96, 0),
  rgb(255, 143, 0),
  rgb(255, 191, 0),
  rgb(255, 239, 0),
  rgb(223, 255, 0),
  rgb(175, 255, 0),
  rgb(128, 255, 0),
  rgb(80, 255, 0),
  rgb(32, 255, 0),
  rgb(0, 255, 16),
  rgb(0, 255, 64),
  rgb(0, 255, 112),
  rgb(0, 255, 159),
  rgb(0, 255, 207),
  rgb(0, 255, 255),
  rgb(0, 207, 255),
  rgb(0, 159, 255),
  rgb(0, 112, 255),
  rgb(0, 64, 255),
  rgb(0, 16, 255),
  rgb(32, 0, 255),
  rgb(80, 0, 255),
  rgb(127, 0, 255),
  rgb(175, 0, 255),
  rgb(223, 0, 255),
  rgb(255, 0, 239),
  rgb(255, 0, 191),
  rgb(255, 0, 143),
  rgb(255, 0, 96),
  rgb(255, 0, 48) calc(100% - 8px)
)`;

export const ColorPickerHue: React.FC<ColorPickerHueProps> = ({ hsv, onHsvChange }) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const hueColor = hsvToRgb(hsv.h, 100, 100);
  const hueColorStr = rgbToCssString(hueColor.r, hueColor.g, hueColor.b);

  const updateHue = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newHue = x * 359;
    
    onHsvChange({
      h: newHue,
      s: hsv.s,
      v: hsv.v,
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateHue(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only update if we have pointer capture
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    updateHue(e);
  };

  // Calculate thumb position (percentage)
  const thumbPosition = (hsv.h / 359) * 100;

  return (
    <div className="mb-3">
      <div
        ref={trackRef}
        className="relative w-full h-4 rounded-full select-none"
        style={{
          background: HUE_GRADIENT,
          outline: "1px solid rgba(0, 0, 0, 0.1)",
          outlineOffset: "-1px",
          cursor: "default"
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        {/* Thumb */}
        <div
          className="absolute top-1/2 w-4 h-4 rounded-full border-4 border-white shadow-[0_0_0.5px_rgba(0,0,0,0.18),0_3px_8px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.1)]
            pointer-events-none"
          style={{
            left: `${thumbPosition}%`,
            transform: "translate(-50%, -50%)",
            backgroundColor: hueColorStr
          }}
        />
      </div>
    </div>
  );
};
