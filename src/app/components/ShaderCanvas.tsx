import React from "react";

interface ShaderCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isPaused: boolean;
  onPauseChange: (checked: boolean) => void;
}

const ShaderCanvas: React.FC<ShaderCanvasProps> = ({
  canvasRef,
  isPaused,
  onPauseChange,
}) => {
  return (
    <div
      className="w-canvas h-canvas rounded-lg overflow-hidden
        shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)]
        bg-black relative"
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
          className="flex items-center
            font-['Liberation_Sans','Inter',sans-serif] text-xs
            text-[rgba(179,179,179,0.75)] font-medium pointer-events-auto m-0
            gap-2 px-2 py-1 rounded-md bg-[rgba(0,0,0,0.35)] backdrop-blur-sm
            transition-colors duration-150 hover:text-white active:scale-[0.97]"
        >
          <span className="text-sm select-none">{isPaused ? "⏸︎" : "⏵︎"}</span>
        </button>
      </div>
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
