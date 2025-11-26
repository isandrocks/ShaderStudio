import React, { useRef } from "react";
import { hsvToRgb, rgbToCssString, type HSV } from "./utils";

interface ColorPickerAreaProps {
  hsv: HSV;
  onHsvChange: (hsv: HSV) => void;
}

export const ColorPickerArea: React.FC<ColorPickerAreaProps> = ({
  hsv,
  onHsvChange,
}) => {
  const areaRef = useRef<HTMLDivElement>(null);

  const hueColor = hsvToRgb(hsv.h, 100, 100);
  const hueColorStr = rgbToCssString(hueColor.r, hueColor.g, hueColor.b);

  const currentColor = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const currentColorStr = rgbToCssString(
    currentColor.r,
    currentColor.g,
    currentColor.b,
  );

  const updateAreaColor = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    onHsvChange({
      h: hsv.h,
      s: x * 100,
      v: (1 - y) * 100,
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateAreaColor(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only update if we have pointer capture
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    updateAreaColor(e);
  };

  return (
    <div
      ref={areaRef}
      className="relative w-full aspect-square mb-3 rounded-sm overflow-hidden
        select-none"
      style={{
        background: `
          linear-gradient(to bottom, transparent 0%, rgb(0, 0, 0) 100%),
          linear-gradient(to right, rgb(255, 255, 255) 0%, ${hueColorStr} 100%)
        `,
        outline: "1px solid rgba(0, 0, 0, 0.1)",
        outlineOffset: "-1px",
        cursor: "default",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      {/* Thumb */}
      <div
        className="absolute w-4 h-4 rounded-full border-4 border-white
          shadow-[0_0_0.5px_rgba(0,0,0,0.18),0_3px_8px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.1)]
          pointer-events-none"
        style={{
          left: `${hsv.s}%`,
          top: `${100 - hsv.v}%`,
          transform: "translate(-50%, -50%)",
          backgroundColor: currentColorStr,
        }}
      />
    </div>
  );
};
