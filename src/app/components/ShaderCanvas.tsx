import React from "react";
import PlayIcon from "./icons/PlayIcon";
import PauseIcon from "./icons/PauseIcon";
import OverlayIcon from "./icons/OverlayIcon";
import OverlayOffIcon from "./icons/OverlayOffIcon";

interface ShaderCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isPaused: boolean;
  onPauseChange: (checked: boolean) => void;
  showAspectRatio?: boolean;
  aspectWidth?: number;
  aspectHeight?: number;
  onToggleOverlay?: () => void;
  className?: string;
  hideOverlayControls?: boolean;
}

const ShaderCanvas: React.FC<ShaderCanvasProps> = ({
  canvasRef,
  isPaused,
  onPauseChange,
  showAspectRatio = false,
  aspectWidth = 512,
  aspectHeight = 512,
  onToggleOverlay,
  className = "w-canvas h-canvas",
  hideOverlayControls = false,
}) => {
  const [manualOverlay, setManualOverlay] = React.useState(false);

  const handleOverlayToggle = () => {
    // Request dimensions from parent first
    if (onToggleOverlay) {
      onToggleOverlay();
    }
    // Then toggle the overlay
    setManualOverlay(!manualOverlay);
  };

  // Show overlay if either showAspectRatio prop is true OR manual toggle is on
  const displayOverlay =
    !hideOverlayControls && (showAspectRatio || manualOverlay);

  // Calculate overlay dimensions to fit within 512x512 canvas
  const canvasSize = 512;
  const aspectRatio = aspectWidth / aspectHeight;

  let overlayWidth, overlayHeight;
  if (aspectRatio > 1) {
    // Wider than tall
    overlayWidth = canvasSize;
    overlayHeight = canvasSize / aspectRatio;
  } else {
    // Taller than wide or square
    overlayHeight = canvasSize;
    overlayWidth = canvasSize * aspectRatio;
  }

  const overlayLeft = (canvasSize - overlayWidth) / 2;
  const overlayTop = (canvasSize - overlayHeight) / 2;
  return (
    <div
      className={`${className} rounded-lg overflow-hidden
        shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_0_1px_#3c3c3c] relative
        shrink-0`}
      style={{
        background: 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px'
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 flex items-center p-[7px_11px]
          bg-transparent pointer-events-none"
      >
        <button
          type="button"
          onClick={() => onPauseChange(!isPaused)}
          aria-pressed={isPaused ? "true" : "false"}
          aria-label={isPaused ? "Resume animation" : "Pause animation"}
          title={isPaused ? "Resume animation" : "Pause animation"}
          className="flex items-center
            font-['Liberation_Sans','Inter',sans-serif] text-xs
            text-[rgba(179,179,179,0.75)] font-medium pointer-events-auto m-0
            gap-2 px-2 py-1 rounded-md bg-[rgba(0,0,0,0.35)] backdrop-blur-sm
            transition-colors duration-150 hover:text-white active:scale-[0.97]"
        >
          {isPaused ? (
            <PlayIcon className="w-3 h-3" />
          ) : (
            <PauseIcon className="w-3 h-3" />
          )}
        </button>

        {!hideOverlayControls && (
          <button
            type="button"
            onClick={handleOverlayToggle}
            aria-pressed={manualOverlay ? "true" : "false"}
            aria-label={
              manualOverlay ? "Hide aspect ratio" : "Show aspect ratio"
            }
            title={
              manualOverlay
                ? "Hide aspect ratio overlay"
                : "Show aspect ratio overlay"
            }
            className="flex items-center ml-2
              font-['Liberation_Sans','Inter',sans-serif] text-xs
              text-[rgba(179,179,179,0.75)] font-medium pointer-events-auto m-0
              gap-2 px-2 py-1 rounded-md bg-[rgba(0,0,0,0.35)] backdrop-blur-sm
              transition-colors duration-150 hover:text-white
              active:scale-[0.97]"
          >
            {manualOverlay ? (
              <OverlayIcon className="w-3 h-3" />
            ) : (
              <OverlayOffIcon className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* Aspect Ratio Overlay */}
      {displayOverlay && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${overlayLeft}px`,
            top: `${overlayTop}px`,
            width: `${overlayWidth}px`,
            height: `${overlayHeight}px`,
            border: "2px dashed rgba(13, 153, 255, 0.8)",
            backgroundColor: "rgba(13, 153, 255, 0.05)",
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2
              -translate-y-1/2 bg-[rgba(13,153,255,0.9)] text-white px-2 py-1
              rounded text-xs font-medium whitespace-nowrap"
          >
            {aspectWidth} × {aspectHeight}px
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        id="glCanvas"
        width="512"
        height="512"
        className="block w-full h-full"
      />
    </div>
  );
};

export default ShaderCanvas;
