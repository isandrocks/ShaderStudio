import React, { useRef } from "react";

interface ColorPickerAlphaProps {
  r: number;
  g: number;
  b: number;
  alpha: number;
  onAlphaChange: (alpha: number) => void;
}

export const ColorPickerAlpha: React.FC<ColorPickerAlphaProps> = ({
  r,
  g,
  b,
  alpha,
  onAlphaChange,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const updateAlpha = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onAlphaChange(x);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateAlpha(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only update if we have pointer capture
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    updateAlpha(e);
  };

  // Calculate thumb position (percentage)
  const thumbPosition = alpha * 100;

  // RGB values as 0-255 for gradient
  const r255 = Math.round(r * 255);
  const g255 = Math.round(g * 255);
  const b255 = Math.round(b * 255);

  // Thumb color with current alpha
  const thumbColor = `rgba(${r255}, ${g255}, ${b255}, ${alpha.toFixed(2)})`;

  return (
    <div className="mb-3">
      <div
        ref={trackRef}
        className="relative w-full h-4 rounded-full select-none"
        style={{
          background: `
            linear-gradient(to right,
              rgba(${r255}, ${g255}, ${b255}, 0) 8px,
              rgba(${r255}, ${g255}, ${b255}, 1) calc(100% - 8px)
            ),
            url('data:image/svg+xml;utf8,<svg width="2" height="2" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h1v2h1V1H0" fill-rule="nonzero" fill="%23e1e1e1"/></svg>') 0 0 / auto 66.66%,
            #fff
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
          className="absolute top-1/2 w-4 h-4 rounded-full border-4 border-white
            shadow-[0_0_0.5px_rgba(0,0,0,0.18),0_3px_8px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.1)]
            pointer-events-none"
          style={{
            left: `${thumbPosition}%`,
            transform: "translate(-50%, -50%)",
            backgroundColor: thumbColor,
          }}
        />
      </div>
    </div>
  );
};
