import { RefObject } from "react";
import type { ShaderState, DynamicUniform } from "../types";
import {
  renderShader,
  captureShaderAsImage,
  recompileShader,
  buildFragmentSource,
} from "../webgl";
import { calculateCaptureResolution } from "../utils/shaderUtils";

interface UseShaderEngineParams {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  shaderStateRef: RefObject<ShaderState>;
  paramsRef: RefObject<{
    paused: boolean;
    pausedTime: number;
  }>;
  dynamicUniformsRef: RefObject<DynamicUniform[]>;
  startTimeRef: RefObject<number>;
  animationFrameRef: RefObject<number | undefined>;
  customFragmentShaderRef: RefObject<string | null>;
  renderWidth: number;
  renderHeight: number;
  setShaderError: (error: string) => void;
  setCriticalError: (error: string | null) => void;
}

interface ShaderEngineAPI {
  getCurrentTime: () => number;
  renderLoop: () => void;
  captureShader: () => void;
  handleRecompileShader: (newShaderCode: string) => boolean;
  handleShaderError: (error: string | null) => void;
}

export const useShaderEngine = ({
  canvasRef,
  shaderStateRef,
  paramsRef,
  dynamicUniformsRef,
  startTimeRef,
  animationFrameRef,
  customFragmentShaderRef,
  renderWidth,
  renderHeight,
  setShaderError,
  setCriticalError,
}: UseShaderEngineParams): ShaderEngineAPI => {
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

    // Calculate capture resolution with supersampling
    const { width: captureWidth, height: captureHeight } =
      calculateCaptureResolution(renderWidth, renderHeight);

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

      const combined = buildFragmentSource(
        newShaderCode,
        dynamicUniformsRef.current,
      );

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

  return {
    getCurrentTime,
    renderLoop,
    captureShader,
    handleRecompileShader,
    handleShaderError,
  };
};
