import React, { useState } from "react";
import type {
  DynamicUniform,
  ShaderState,
  SavedShader,
  EffectLayer,
} from "../types";
import { renderShader } from "../webgl";

interface SaveShaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  shaderCode: string;
  customFragmentShaderRef: React.MutableRefObject<string | null>;
  dynamicUniforms: DynamicUniform[];
  layers?: EffectLayer[];
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  shaderStateRef: React.MutableRefObject<ShaderState>;
  getCurrentTime: () => number;
  isPaused: boolean;
  currentShaderId?: string | null;
  savedShaders?: SavedShader[];
}

const SaveShaderModal: React.FC<SaveShaderModalProps> = ({
  isOpen,
  onClose,
  shaderCode,
  customFragmentShaderRef,
  dynamicUniforms,
  layers,
  canvasRef,
  shaderStateRef,
  getCurrentTime,
  isPaused,
  currentShaderId,
  savedShaders = [],
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [includeThumbnail, setIncludeThumbnail] = useState(true);
  const [isUpdate, setIsUpdate] = useState(false);
  const [error, setError] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus name input when modal opens
  React.useEffect(() => {
    if (isOpen) {
      // Check if we are editing an existing shader
      if (currentShaderId) {
        const existingShader = savedShaders.find(
          (s) => s.id === currentShaderId,
        );
        if (existingShader) {
          setName(existingShader.name);
          setDescription(existingShader.description || "");
          setIsUpdate(true);
        } else {
          setIsUpdate(false);
          setName("");
          setDescription("");
        }
      } else {
        setIsUpdate(false);
        setName("");
        setDescription("");
      }

      // Small delay to ensure DOM is ready and previous modal is gone
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentShaderId, savedShaders]);

  if (!isOpen) return null;

  const captureThumbnail = async (): Promise<string | undefined> => {
    try {
      const sourceCanvas = canvasRef.current;
      if (!sourceCanvas) {
        console.warn("[captureThumbnail] Canvas ref is null");
        return undefined;
      }

      // Create a temporary canvas for the thumbnail - smaller size to reduce data
      const thumbnailCanvas = document.createElement("canvas");
      const thumbnailSize = 128; // Reduced from 256 to 128 for smaller file size
      thumbnailCanvas.width = thumbnailSize;
      thumbnailCanvas.height = thumbnailSize;
      const ctx = thumbnailCanvas.getContext("2d");

      if (!ctx) {
        console.error("[captureThumbnail] Failed to get 2D context");
        return undefined;
      }

      // Get current time to capture exact frame
      const currentTime = getCurrentTime();

      // Render the shader to the source canvas first to ensure we have the current frame
      renderShader(
        sourceCanvas,
        shaderStateRef.current,
        { paused: isPaused, pausedTime: currentTime, dynamicUniforms },
        currentTime,
      );

      // Calculate aspect ratio and crop to square from center
      const sourceSize = Math.min(sourceCanvas.width, sourceCanvas.height);
      const sx = (sourceCanvas.width - sourceSize) / 2;
      const sy = (sourceCanvas.height - sourceSize) / 2;

      // Draw cropped and scaled version to thumbnail canvas
      ctx.drawImage(
        sourceCanvas,
        sx,
        sy,
        sourceSize,
        sourceSize, // Source: square crop from center
        0,
        0,
        thumbnailSize,
        thumbnailSize, // Destination: fill thumbnail canvas
      );

      return new Promise((resolve) => {
        // Use JPEG with quality=0.7 for much better compression than PNG
        // JPEG typically 1/10th the size of PNG for shader graphics
        thumbnailCanvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error("[captureThumbnail] Failed to create blob");
              resolve(undefined);
              return;
            }


            // Convert blob to base64 for storage
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              const actualSize = base64.length;

              // Warn if approaching 100KB limit (leaving room for other shader data)
              if (actualSize > 50000) {
                console.warn(
                  "[captureThumbnail] Large thumbnail:",
                  actualSize,
                  "bytes (recommended < 50KB)",
                );
              }

              resolve(base64);
            };
            reader.onerror = () => {
              console.error("[captureThumbnail] FileReader error");
              resolve(undefined);
            };
            reader.readAsDataURL(blob);
          },
          "image/jpeg",
          0.7,
        ); // JPEG at 70% quality - good balance of size/quality
      });
    } catch (error) {
      console.error("[captureThumbnail] Error:", error);
      return undefined;
    }
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      setError("Shader name is required");
      return;
    }
    if (name.length > 50) {
      setError("Name must be 50 characters or less");
      return;
    }
    if (description.length > 200) {
      setError("Description must be 200 characters or less");
      return;
    }

    // Capture thumbnail if requested
    setIsCapturing(true);
    const thumbnail = includeThumbnail ? await captureThumbnail() : undefined;
    setIsCapturing(false);

    // Create SavedShader object
    const newShader: SavedShader = {
      id:
        isUpdate && currentShaderId ? currentShaderId : `shader-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      fragmentShader: customFragmentShaderRef.current || shaderCode,
      dynamicUniforms: [...dynamicUniforms],
      layers: layers ? JSON.parse(JSON.stringify(layers)) : undefined, // Deep copy layers
      createdAt:
        isUpdate && currentShaderId
          ? savedShaders.find((s) => s.id === currentShaderId)?.createdAt ||
            Date.now()
          : Date.now(),
      updatedAt: Date.now(),
      thumbnail,
    };

    // Send to plugin
    parent.postMessage(
      { pluginMessage: { type: "save-shader", shader: newShader } },
      "*",
    );

    // Reset form and close
    setName("");
    setDescription("");
    setIncludeThumbnail(true);
    setError("");
    onClose();
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setIncludeThumbnail(true);
    setError("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center
        z-50"
    >
      <div
        className="bg-[#2c2c2c] rounded-lg p-6 w-96 border border-[#3c3c3c] flex
          flex-col gap-4"
      >
        <h3 className="text-base font-semibold text-white">Save Shader</h3>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-gray-300 mb-1">Shader Name:</label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="bg-[#383838] text-white px-3 py-2 rounded border
                border-[#444444] text-sm focus:outline-none focus:border-primary
                hover:border-[#8c8c8c] transition-colors"
              placeholder="e.g. My Cool Shader"
            />
            <span className="text-[10px] text-gray-500 mt-1">
              {name.length}/50 characters
            </span>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-300 mb-1">
              Description (optional):
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
              className="bg-[#383838] text-white px-3 py-2 rounded border
                border-[#444444] text-sm focus:outline-none focus:border-primary
                resize-none hover:border-[#8c8c8c] transition-colors"
              placeholder="Describe your shader..."
            />
            <span className="text-[10px] text-gray-500 mt-1">
              {description.length}/200 characters
            </span>
          </div>

          {currentShaderId && (
            <div className="flex items-center gap-2 p-2 bg-[#383838] rounded border border-[#444444]">
              <input
                type="checkbox"
                id="updateExisting"
                checked={isUpdate}
                onChange={(e) => setIsUpdate(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-primary"
              />
              <label
                htmlFor="updateExisting"
                className="text-xs text-white cursor-pointer select-none"
              >
                Update existing shader
              </label>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeThumbnail"
              checked={includeThumbnail}
              onChange={(e) => setIncludeThumbnail(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="includeThumbnail"
              className="text-xs text-gray-300 cursor-pointer"
            >
              Include thumbnail preview
            </label>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-900/20 p-2 rounded">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isCapturing}
            className="flex-1 px-4 py-2 text-sm font-medium bg-primary
              text-white rounded hover:bg-primary-hover transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCapturing ? "Capturing..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isCapturing}
            className="flex-1 px-4 py-2 text-sm font-medium bg-[#2c2c2c]
              text-white border border-[#3c3c3c] rounded hover:bg-[#333333]
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveShaderModal;
