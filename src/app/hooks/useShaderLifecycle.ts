import { useEffect, RefObject } from "react";
import type { ShaderState, DynamicUniform, SavedShader } from "../types";
import { SHADER_PRESETS } from "../presets";
import { initWebGL, buildFragmentSource, injectUniforms } from "../webgl";

interface UseShaderLifecycleParams {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  shaderStateRef: RefObject<ShaderState>;
  customFragmentShaderRef: RefObject<string | null>;
  animationFrameRef: RefObject<number | undefined>;
  dynamicUniforms: DynamicUniform[];
  renderLoop: () => void;
  handleShaderError: (error: string | null) => void;
  handleRecompileShader: (newShaderCode: string) => boolean;
  setShaderCode: (code: string) => void;
  setSavedShaders: React.Dispatch<React.SetStateAction<SavedShader[]>>;
  setSelectionError: (error: string) => void;
  setRenderWidth: (width: number) => void;
  setRenderHeight: (height: number) => void;
  setShowAspectRatio: (show: boolean) => void;
  setCriticalError: (error: string | null) => void;
  captureShader: () => void;
}

export const useShaderLifecycle = ({
  canvasRef,
  shaderStateRef,
  customFragmentShaderRef,
  animationFrameRef,
  dynamicUniforms,
  renderLoop,
  handleShaderError,
  handleRecompileShader,
  setShaderCode,
  setSavedShaders,
  setSelectionError,
  setRenderWidth,
  setRenderHeight,
  setShowAspectRatio,
  setCriticalError,
  captureShader,
}: UseShaderLifecycleParams) => {
  // Initialize WebGL and start render loop
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
};
