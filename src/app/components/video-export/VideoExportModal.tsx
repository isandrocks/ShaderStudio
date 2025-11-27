import React, { useState } from "react";
import { BaseModal } from "../BaseModal";

interface VideoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (
    duration: number,
    playbackMode: "normal" | "bounce",
    fps: number,
  ) => void;
}

const VideoExportModal: React.FC<VideoExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
}) => {
  const [duration, setDuration] = useState(5);
  const [playbackMode, setPlaybackMode] = useState<"normal" | "bounce">(
    "normal",
  );
  const [fps, setFps] = useState(30);

  const handleExport = () => {
    onExport(duration, playbackMode, fps);
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Export Video">
      <div className="flex flex-col gap-4 p-4">
        {/* Duration Slider */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">
            Duration: {duration}s
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="slider-input"
            aria-label="Video duration in seconds"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1s</span>
            <span>10s</span>
          </div>
        </div>

        {/* Resolution Info */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">
            Resolution
          </label>
          <div className="text-sm text-gray-400">1080×1080 (Square)</div>
        </div>

        {/* FPS Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">
            Frame Rate
          </label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="fps"
                value="30"
                checked={fps === 30}
                onChange={() => setFps(30)}
                className="accent-primary"
              />
              <span className="text-sm text-gray-300">30 fps</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="fps"
                value="60"
                checked={fps === 60}
                onChange={() => setFps(60)}
                className="accent-primary"
              />
              <span className="text-sm text-gray-300">60 fps</span>
            </label>
          </div>
        </div>

        {/* Playback Mode */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">
            Playback Mode
          </label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="playbackMode"
                value="normal"
                checked={playbackMode === "normal"}
                onChange={() => setPlaybackMode("normal")}
                className="accent-primary"
              />
              <span className="text-sm text-gray-300">Normal</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="playbackMode"
                value="bounce"
                checked={playbackMode === "bounce"}
                onChange={() => setPlaybackMode("bounce")}
                className="accent-primary"
              />
              <span className="text-sm text-gray-300">
                Bounce (forward then reverse)
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleExport}
            className="flex-1 h-8 px-4 text-sm font-medium bg-primary text-white
              rounded-md cursor-pointer transition-all duration-150 outline-none
              border-none hover:bg-primary-hover active:bg-primary-active
              active:scale-[0.98]"
          >
            Export Video
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-8 px-4 text-sm font-medium bg-[#3c3c3c]
              text-gray-300 rounded-md cursor-pointer transition-all
              duration-150 outline-none border border-[#4c4c4c]
              hover:bg-[#454545] hover:border-[#5c5c5c] active:bg-[#2a2a2a]
              active:scale-[0.98]"
          >
            Cancel
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default VideoExportModal;
