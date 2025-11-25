import React, { useRef, useEffect, useState } from "react";
import ControlPanel from "./components/ControlPanel";
import ShaderCanvas from "./components/ShaderCanvas";
import ShaderModal from "./components/ShaderModal";
import UniformConfigModal from "./components/UniformConfigModal";
import { PresetGallery } from "./components/PresetGallery";
import SaveShaderModal from "./components/SaveShaderModal";
import { SavedShadersGallery } from "./components/SavedShadersGallery";
import VideoExportModal from "./components/VideoExportModal";
import { ShaderPreset, SHADER_PRESETS } from "./presets";
import { useSyncedRef } from "./hooks/useSyncedRef";
import type {
  ShaderState,
  DynamicUniform,
  UniformType,
  UniformValue,
  SavedShader,
  ModalType,
} from "./types";
import {
  initWebGL,
  renderShader,
  captureShaderAsImage,
  recompileShader,
  buildFragmentSource,
  stripInjectedUniforms,
  injectUniforms,
} from "./webgl";

/**
 * Ensure backward compatibility by defaulting type to 'float' if missing
 */
const ensureUniformTypes = (uniforms: DynamicUniform[]): DynamicUniform[] => {
  return uniforms.map((u) => ({
    ...u,
    type: u.type || ("float" as UniformType),
  }));
};

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState({
    paused: false,
    pausedTime: 0.0,
  });
  const [openModal, setOpenModal] = useState<ModalType>("none");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [savedShaders, setSavedShaders] = useState<SavedShader[]>([]);
  const [shaderCode, setShaderCode] = useState(
    SHADER_PRESETS[0].fragmentShader,
  );
  const [shaderError, setShaderError] = useState("");
  const [selectionError, setSelectionError] = useState("");
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [renderWidth, setRenderWidth] = useState(512);
  const [renderHeight, setRenderHeight] = useState(512);
  const [showAspectRatio, setShowAspectRatio] = useState(false);
  const [dynamicUniforms, setDynamicUniforms] = useState<DynamicUniform[]>(
    SHADER_PRESETS[0].defaultUniforms,
  );

  const shaderStateRef = useRef<ShaderState>({
    gl: null,
    program: null,
    uniforms: {},
    dynamicUniforms: {},
  });
  const startTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number | undefined>(undefined);
  const customFragmentShaderRef = useRef<string | null>(null);
  const modalShaderSnapshotRef = useRef<string | null>(null);
  const paramsRef = useSyncedRef(params);
  const dynamicUniformsRef = useSyncedRef(dynamicUniforms);

  const handleShaderError = (error: string | null) => {
    parent.postMessage({ pluginMessage: { type: "shader-error", error } }, "*");
  };

  /**
   * Get current shader time - respects pause state
   */
  const getCurrentTime = (): number => {
    return paramsRef.current.paused
      ? paramsRef.current.pausedTime
      : (Date.now() - startTimeRef.current) / 1000.0;
  };

  const renderLoop = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      renderShader(
        canvas,
        shaderStateRef.current,
        { ...paramsRef.current, dynamicUniforms: dynamicUniformsRef.current },
        getCurrentTime(),
      );
      animationFrameRef.current = requestAnimationFrame(renderLoop);
    } catch (error) {
      console.error("[renderLoop] Error:", error);
      setCriticalError(`Render loop failed: ${(error as Error).message}`);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const captureShader = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Temporarily resize canvas for high-quality capture
    const originalWidth = canvas.width;
    const originalHeight = canvas.height;
    
    // Supersample for better quality - render at 2x-4x target size
    const SUPERSAMPLE_MULTIPLIER = 3; // Render at 3x for excellent quality
    const MAX_RENDER_SIZE = 4096;
    
    // Calculate target render size with supersampling
    let captureWidth = renderWidth * SUPERSAMPLE_MULTIPLIER;
    let captureHeight = renderHeight * SUPERSAMPLE_MULTIPLIER;
    
    // Cap at maximum to prevent performance issues
    const maxDimension = Math.max(captureWidth, captureHeight);
    if (maxDimension > MAX_RENDER_SIZE) {
      const scale = MAX_RENDER_SIZE / maxDimension;
      captureWidth = Math.round(captureWidth * scale);
      captureHeight = Math.round(captureHeight * scale);
    }
    
    // Ensure minimum quality for small objects
    if (captureWidth < 512) captureWidth = 512;
    if (captureHeight < 512) captureHeight = 512;
    
    console.log(`[captureShader] Target: ${renderWidth}x${renderHeight}, Rendering: ${captureWidth}x${captureHeight} (${SUPERSAMPLE_MULTIPLIER}x supersampling)`);
    
    canvas.width = captureWidth;
    canvas.height = captureHeight;

    // Update WebGL viewport to match new canvas size
    const gl = shaderStateRef.current.gl;
    if (gl) {
      gl.viewport(0, 0, captureWidth, captureHeight);
    }

    captureShaderAsImage(
      canvas,
      shaderStateRef.current,
      { ...paramsRef.current, dynamicUniforms: dynamicUniformsRef.current },
      getCurrentTime(),
      (imageData) => {
        // Restore original canvas size and viewport
        canvas.width = originalWidth;
        canvas.height = originalHeight;
        if (gl) {
          gl.viewport(0, 0, originalWidth, originalHeight);
        }
        
        parent.postMessage(
          {
            pluginMessage: {
              type: "shader-rendered",
              imageData,
            },
          },
          "*",
        );
      },
    );
  };

  const handleRecompileShader = (newShaderCode: string): boolean => {
    try {
      const gl = shaderStateRef.current.gl;
      if (!gl) {
        console.error("[handleRecompileShader] No GL context");
        return false;
      }

      setShaderError("");

      const combined = buildFragmentSource(newShaderCode, dynamicUniforms);

      const success = recompileShader(gl, shaderStateRef, combined, (error) => {
        if (error) {
          console.error("[handleRecompileShader] Shader error:", error);
          setShaderError("Shader Error: " + error);
        }
      });

      if (success) {
        customFragmentShaderRef.current = newShaderCode;
      }

      return success;
    } catch (error) {
      console.error("[handleRecompileShader] EXCEPTION:", error);
      console.error("[handleRecompileShader] Stack:", (error as Error).stack);
      setCriticalError(
        `Shader compilation failed: ${(error as Error).message}`,
      );
      return false;
    }
  };

  const addUniform = (config: {
    name: string;
    type: UniformType;
    value: UniformValue;
    min: number;
    max: number;
    step: number;
  }) => {
    try {
      const existingNames = new Set(dynamicUniforms.map((u) => u.name));
      
      // Auto-increment name if it already exists
      let finalName = config.name;
      if (existingNames.has(finalName)) {
        let counter = 2;
        while (existingNames.has(`${config.name}${counter}`)) {
          counter++;
        }
        finalName = `${config.name}${counter}`;
      }

      const newUniform: DynamicUniform = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...config,
        name: finalName,
      };
      
      setDynamicUniforms((prev) => [...prev, newUniform]);
      setOpenModal("none");
    } catch (error) {
      console.error("[addUniform] Error:", error);
      setCriticalError(`Failed to add uniform: ${(error as Error).message}`);
    }
  };

  const updateUniform = (id: string, value: UniformValue) => {
    try {
      setDynamicUniforms((prev) =>
        prev.map((u) => (u.id === id ? { ...u, value } : u)),
      );
    } catch (error) {
      console.error("[updateUniform] Error:", error);
      setCriticalError(`Failed to update uniform: ${(error as Error).message}`);
    }
  };

  const removeUniform = (id: string) => {
    try {
      setDynamicUniforms((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error("[removeUniform] Error:", error);
      setCriticalError(`Failed to remove uniform: ${(error as Error).message}`);
    }
  };

  // Load a preset shader
  const loadPreset = (preset: ShaderPreset) => {
    try {
      customFragmentShaderRef.current = preset.fragmentShader;
      setShaderCode(preset.fragmentShader);
      setDynamicUniforms(ensureUniformTypes(preset.defaultUniforms));
      setShaderError("");
    } catch (error) {
      console.error("[loadPreset] Error:", error);
      setCriticalError(`Failed to load preset: ${(error as Error).message}`);
    }
  };

  // Load a saved shader
  const loadSavedShader = (shader: SavedShader) => {
    try {
      customFragmentShaderRef.current = shader.fragmentShader;
      setShaderCode(shader.fragmentShader);

      const uniformsWithTypes = ensureUniformTypes(shader.dynamicUniforms);
      setDynamicUniforms(uniformsWithTypes);
      setShaderError("");

      // Recompile shader
      if (shaderStateRef.current.gl) {
        const source = buildFragmentSource(
          shader.fragmentShader,
          uniformsWithTypes,
        );
        const success = recompileShader(
          shaderStateRef.current.gl,
          shaderStateRef,
          source,
          (error) => {
            if (error) {
              setShaderError(error);
            }
          },
        );
        if (!success) {
          setCriticalError("Failed to load shader - compilation error");
        }
      }
    } catch (error) {
      console.error("[loadSavedShader] Error:", error);
      setCriticalError(`Failed to load shader: ${(error as Error).message}`);
    }
  };

  // Delete a saved shader
  const deleteSavedShader = (id: string) => {
    parent.postMessage({ pluginMessage: { type: "delete-shader", id } }, "*");
  };

  const handleExportVideo = async (duration: number, playbackMode: "normal" | "bounce", fps: number) => {
    console.log("[handleExportVideo] Starting video export:", { duration, playbackMode, fps });
    setIsExportingVideo(true);
    try {
      // Fixed 1080x1080 resolution
      const resolution = 1080;
      
      // Create off-screen canvas at square resolution
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = resolution;
      offscreenCanvas.height = resolution;

      // Initialize WebGL context for off-screen canvas
      const offscreenStateRef = { current: { gl: null, program: null, uniforms: {}, dynamicUniforms: {} } as ShaderState };
      const shaderToUse = customFragmentShaderRef.current || buildFragmentSource(shaderCode, dynamicUniformsRef.current);
      const initialized = initWebGL(
        offscreenCanvas,
        offscreenStateRef,
        shaderToUse,
        (error) => {
          if (error) throw new Error(error);
        }
      );

      if (!initialized || !offscreenStateRef.current.gl) {
        throw new Error("Failed to initialize off-screen WebGL context");
      }

      console.log(`[handleExportVideo] Recording ${duration}s video at ${fps} fps, 1080×1080`);

      // Calculate total frames needed
      const totalFrames = duration * fps;

      // Create a 2D canvas for encoding
      const encodeCanvas = document.createElement('canvas');
      encodeCanvas.width = 1080;
      encodeCanvas.height = 1080;
      const encodeCtx = encodeCanvas.getContext('2d');
      if (!encodeCtx) throw new Error("Failed to get 2D context for encoding");

      console.log("[handleExportVideo] Starting frame-by-frame recording...");

      // Create video using MediaRecorder API with maximum quality settings
      const stream = encodeCanvas.captureStream(fps); // Stream at target FPS
      
      // Try different codecs for better quality
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 100000000 // 100 Mbps for maximum quality
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      // Start recording
      mediaRecorder.start(100); // Request data every 100ms for better quality

      // Render and encode frames one at a time at real-time speed
      const frameDelay = 1000 / fps;
      
      for (let i = 0; i < totalFrames; i++) {
        const time = i / fps;
        
        // Render frame to WebGL canvas
        renderShader(
          offscreenCanvas,
          offscreenStateRef.current,
          { 
            paused: true,
            pausedTime: time,
            dynamicUniforms: dynamicUniformsRef.current 
          },
          time,
        );
        
        // Copy from WebGL canvas to encode canvas
        encodeCtx.drawImage(offscreenCanvas, 0, 0);
        
        // Wait for proper frame timing
        await new Promise(resolve => setTimeout(resolve, frameDelay));
      }

      // Add reverse frames for bounce mode
      if (playbackMode === "bounce") {
        console.log("[handleExportVideo] Adding bounce frames");
        for (let i = totalFrames - 2; i > 0; i--) {
          const time = i / fps;
          
          renderShader(
            offscreenCanvas,
            offscreenStateRef.current,
            { 
              paused: true,
              pausedTime: time,
              dynamicUniforms: dynamicUniformsRef.current 
            },
            time,
          );
          
          encodeCtx.drawImage(offscreenCanvas, 0, 0);
          
          await new Promise(resolve => setTimeout(resolve, frameDelay));
        }
      }

      // Stop recording
      await new Promise<void>((resolve) => {
        mediaRecorder.onstop = () => resolve();
        mediaRecorder.stop();
      });

      // Clean up off-screen WebGL context
      if (offscreenStateRef.current.gl) {
        offscreenStateRef.current.gl.getExtension('WEBGL_lose_context')?.loseContext();
      }

      // Create video blob
      const videoBlob = new Blob(chunks, { type: 'video/webm' });
      
      // Check size
      const videoSizeMB = videoBlob.size / 1024 / 1024;
      console.log(`[handleExportVideo] Video created: ${videoBlob.size} bytes (${videoSizeMB.toFixed(2)} MB)`);

      // Download directly
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shader-1080x1080-${fps}fps-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(`[handleExportVideo] Video downloaded: ${videoSizeMB.toFixed(2)} MB`);
      setIsVideoModalOpen(false);
    } catch (error) {
      console.error("[handleExportVideo] Error:", error);
      setCriticalError(`Video export failed: ${(error as Error).message}`);
    } finally {
      setIsExportingVideo(false);
    }
  };

  const handlePauseChange = (checked: boolean) => {
    if (checked) {
      setParams((prev) => ({
        ...prev,
        pausedTime: (Date.now() - startTimeRef.current) / 1000.0,
        paused: true,
      }));
    } else {
      startTimeRef.current = Date.now() - paramsRef.current.pausedTime * 1000;
      setParams((prev) => ({
        ...prev,
        paused: false,
      }));
    }
  };

  const handleApplyToSelection = () => {
    setSelectionError("");
    setShowAspectRatio(false);
    parent.postMessage({ pluginMessage: { type: "apply-to-selection" } }, "*");
  };

  const handleCreateRectangle = () => {
    setSelectionError("");
    parent.postMessage({ pluginMessage: { type: "create-rectangle" } }, "*");
  };

  const handleToggleOverlay = () => {
    // Request current selection dimensions from Figma
    parent.postMessage({ pluginMessage: { type: "get-selection-dimensions" } }, "*");
  };

  const handleApplyShader = () => {
    try {
      setShaderError("");

      const cleanedCode = stripInjectedUniforms(shaderCode, dynamicUniforms);

      if (handleRecompileShader(cleanedCode)) {
        customFragmentShaderRef.current = cleanedCode;
        const injectedCode = injectUniforms(cleanedCode, dynamicUniforms);
        setShaderCode(injectedCode);
      }
    } catch (error) {
      console.error("[handleApplyShader] EXCEPTION:", error);
      console.error("[handleApplyShader] Stack:", (error as Error).stack);
      setShaderError(`Apply failed: ${(error as Error).message}`);
    }
  };

  const handleResetShader = () => {
    // Reset to the shader state when modal was opened, or default preset if no snapshot
    const resetShader = modalShaderSnapshotRef.current || SHADER_PRESETS[0].fragmentShader;
    setShaderCode(resetShader);
    // Only clear custom ref if resetting to default preset
    if (!modalShaderSnapshotRef.current) {
      customFragmentShaderRef.current = null;
    }
    handleRecompileShader(stripInjectedUniforms(resetShader, dynamicUniforms));
  };

  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("[useEffect:init] Canvas ref is null");
        return;
      }

      const initialCombined = buildFragmentSource(
        customFragmentShaderRef.current || SHADER_PRESETS[0].fragmentShader,
        dynamicUniforms,
      );

      if (
        initWebGL(canvas, shaderStateRef, initialCombined, handleShaderError)
      ) {
        renderLoop();
      } else {
        console.error("[useEffect:init] WebGL initialization failed");
        setCriticalError("Failed to initialize WebGL");
      }

      const handleMessage = (event: MessageEvent) => {
        try {
          const msg = event.data.pluginMessage;
          if (!msg) return;

          switch (msg.type) {
            case "selection-info":
              // Show aspect ratio overlay for selected object
              if (msg.width && msg.height) {
                setRenderWidth(msg.width);
                setRenderHeight(msg.height);
                setShowAspectRatio(true);
              }
              break;

            case "selection-dimensions":
              // Update dimensions for overlay toggle (doesn't auto-show)
              if (msg.width && msg.height) {
                setRenderWidth(msg.width);
                setRenderHeight(msg.height);
              } else {
                // Default to 512x512 if no selection
                setRenderWidth(512);
                setRenderHeight(512);
              }
              break;

            case "render-shader":
              // Update render dimensions if provided
              if (msg.width && msg.height) {
                setRenderWidth(msg.width);
                setRenderHeight(msg.height);
              }
              setShowAspectRatio(false);
              captureShader();
              break;

            case "selection-error":
              setSelectionError(msg.error || "Selection error");
              break;

            case "shaders-loaded":
              setSavedShaders(msg.shaders || []);
              break;

            case "shader-saved":
              // Refresh shader list
              parent.postMessage(
                { pluginMessage: { type: "load-shaders" } },
                "*",
              );
              break;

            case "shader-deleted":
              // Remove from local state
              setSavedShaders((prev) => prev.filter((s) => s.id !== msg.id));
              break;

            case "storage-error":
              setCriticalError(msg.error);
              break;
          }
        } catch (error) {
          console.error("[handleMessage] Error:", error);
          setCriticalError(
            `Message handling failed: ${(error as Error).message}`,
          );
        }
      };

      // Request saved shaders from plugin
      parent.postMessage({ pluginMessage: { type: "load-shaders" } }, "*");

      window.addEventListener("message", handleMessage);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener("message", handleMessage);
      };
    } catch (error) {
      console.error("[useEffect:init] Exception:", error);
      setCriticalError(`Initialization failed: ${(error as Error).message}`);
    }
  }, []);

  // Recompile shader whenever the dynamic uniforms set changes
  useEffect(() => {
    try {
      if (!shaderStateRef.current.gl) {
        return;
      }

      const baseShader =
        customFragmentShaderRef.current || SHADER_PRESETS[0].fragmentShader;
      const injectedCode = injectUniforms(baseShader, dynamicUniforms);

      if (handleRecompileShader(baseShader)) {
        setShaderCode(injectedCode);
      }
    } catch (error) {
      console.error("[useEffect:recompile] EXCEPTION:", error);
      console.error("[useEffect:recompile] Stack:", (error as Error).stack);
      setCriticalError(`Recompile failed: ${(error as Error).message}`);
    }
  }, [dynamicUniforms]);

  return (
    <div
      className="font-sans bg-[#1e1e1e] text-white p-4 flex flex-col
        items-center gap-4 overflow-hidden"
    >
      {criticalError && (
        <div
          className="w-full bg-red-900/30 border border-red-500 rounded p-3
            text-sm"
        >
          <div className="font-semibold text-red-400 mb-1">Critical Error:</div>
          <div className="text-red-200">{criticalError}</div>
          <button
            onClick={() => {
              setCriticalError(null);
              window.location.reload();
            }}
            className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-500 rounded
              text-xs"
          >
            Reload Plugin
          </button>
        </div>
      )}

      <div className="flex gap-4 items-start">
        <ControlPanel
          onApplyToSelection={handleApplyToSelection}
          onCreateRectangle={handleCreateRectangle}
          selectionError={selectionError}
          onAdvancedEditorClick={() => {
            // Capture current shader state as snapshot for reset
            modalShaderSnapshotRef.current = shaderCode;
            setOpenModal("shader");
          }}
          onPresetsClick={() => setOpenModal("presets")}
          onSaveShader={() => setOpenModal("save")}
          onOpenSavedShaders={() => setOpenModal("saved-shaders")}
          onExportVideo={() => setIsVideoModalOpen(true)}
          dynamicUniforms={dynamicUniforms}
          onAddUniform={() => setOpenModal("config")}
          onUpdateUniform={updateUniform}
          onRemoveUniform={removeUniform}
        />

        <ShaderCanvas
          canvasRef={canvasRef}
          isPaused={params.paused}
          onPauseChange={handlePauseChange}
          showAspectRatio={showAspectRatio}
          aspectWidth={renderWidth}
          aspectHeight={renderHeight}
          onToggleOverlay={handleToggleOverlay}
        />
      </div>

      <p className="text-[11px] text-[#999999] text-center max-w-lg absolute bottom-4">
        Live shader preview above • Adjust parameters in real-time
      </p>

      <ShaderModal
        isOpen={openModal === "shader"}
        shaderCode={shaderCode}
        error={shaderError}
        onClose={() => {
          modalShaderSnapshotRef.current = null;
          setOpenModal("none");
        }}
        onShaderChange={setShaderCode}
        onApply={handleApplyShader}
        onReset={handleResetShader}
        onClearError={() => setShaderError("")}
      />

      <UniformConfigModal
        isOpen={openModal === "config"}
        onClose={() => setOpenModal("none")}
        onAdd={addUniform}
      />

      <PresetGallery
        isOpen={openModal === "presets"}
        onClose={() => setOpenModal("none")}
        onSelectPreset={loadPreset}
      />

      <SaveShaderModal
        isOpen={openModal === "save"}
        onClose={() => setOpenModal("none")}
        shaderCode={shaderCode}
        customFragmentShaderRef={customFragmentShaderRef}
        dynamicUniforms={dynamicUniforms}
        canvasRef={canvasRef}
        shaderStateRef={shaderStateRef}
        getCurrentTime={getCurrentTime}
        isPaused={params.paused}
      />

      <SavedShadersGallery
        isOpen={openModal === "saved-shaders"}
        savedShaders={savedShaders}
        onClose={() => setOpenModal("none")}
        onLoadShader={loadSavedShader}
        onDeleteShader={deleteSavedShader}
      />

      <VideoExportModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onExport={handleExportVideo}
      />

      {/* Exporting Video Spinner Overlay */}
      {isExportingVideo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-6 flex flex-col items-center gap-4 border border-[#3c3c3c]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-300 font-medium">Exporting Video...</div>
            <div className="text-xs text-gray-500">This may take a moment</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
