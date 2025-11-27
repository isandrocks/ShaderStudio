/**
 * Video export utilities for rendering shader animations
 */

import type { ShaderState, DynamicUniform } from "../../types";
import { initWebGL, renderShader, buildFragmentSource } from "../../webgl";

export interface VideoExportOptions {
  duration: number;
  fps: number;
  playbackMode: "normal" | "bounce";
  resolution: number;
}

export interface VideoExportCallbacks {
  onProgress?: (frame: number, totalFrames: number) => void;
  onComplete?: (blob: Blob, sizeKB: number) => void;
  onError?: (error: string) => void;
}

/**
 * Create an off-screen canvas with WebGL context for video rendering
 */
export const createOffscreenCanvas = (
  resolution: number,
  shaderCode: string,
  dynamicUniforms: DynamicUniform[],
): { canvas: HTMLCanvasElement; stateRef: { current: ShaderState } } | null => {
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = resolution;
  offscreenCanvas.height = resolution;

  const offscreenStateRef = {
    current: {
      gl: null,
      program: null,
      uniforms: {},
      dynamicUniforms: {},
    } as ShaderState,
  };

  const shaderToUse = buildFragmentSource(shaderCode, dynamicUniforms);
  const initialized = initWebGL(
    offscreenCanvas,
    offscreenStateRef,
    shaderToUse,
    (error) => {
      if (error) throw new Error(error);
    },
  );

  if (!initialized || !offscreenStateRef.current.gl) {
    return null;
  }

  return { canvas: offscreenCanvas, stateRef: offscreenStateRef };
};

/**
 * Create a 2D canvas for video encoding
 */
export const createEncodeCanvas = (
  resolution: number,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null => {
  const encodeCanvas = document.createElement("canvas");
  encodeCanvas.width = resolution;
  encodeCanvas.height = resolution;
  const encodeCtx = encodeCanvas.getContext("2d");

  if (!encodeCtx) return null;

  return { canvas: encodeCanvas, ctx: encodeCtx };
};

/**
 * Get the best supported video MIME type
 */
export const getBestVideoMimeType = (): string => {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];

  for (const mimeType of candidates) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return "video/webm"; // Fallback
};

/**
 * Create a MediaRecorder with optimal quality settings
 */
export const createVideoRecorder = (
  stream: MediaStream,
  _fps: number,
): MediaRecorder => {
  const mimeType = getBestVideoMimeType();
  return new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 100000000, // 100 Mbps for maximum quality
  });
};

/**
 * Render a single frame at a specific time
 */
export const renderFrame = (
  offscreenCanvas: HTMLCanvasElement,
  offscreenState: ShaderState,
  encodeCtx: CanvasRenderingContext2D,
  time: number,
  dynamicUniforms: DynamicUniform[],
): void => {
  renderShader(
    offscreenCanvas,
    offscreenState,
    {
      paused: true,
      pausedTime: time,
      dynamicUniforms,
    },
    time,
  );

  // Copy from WebGL canvas to encode canvas
  encodeCtx.drawImage(offscreenCanvas, 0, 0);
};

/**
 * Wait for a specific duration (for frame pacing)
 */
export const waitForFrameDelay = (delayMs: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
};

/**
 * Calculate total frames needed for video
 */
export const calculateTotalFrames = (
  duration: number,
  fps: number,
  playbackMode: "normal" | "bounce",
): number => {
  const baseFrames = duration * fps;
  return playbackMode === "bounce" ? baseFrames * 2 - 2 : baseFrames;
};

/**
 * Clean up WebGL context
 */
export const cleanupWebGLContext = (gl: WebGLRenderingContext | null): void => {
  if (gl) {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
};

/**
 * Create a video blob from recorded chunks
 */
export const createVideoBlob = (chunks: Blob[]): Blob => {
  return new Blob(chunks, { type: "video/webm" });
};

/**
 * Download a video blob to disk
 */
export const downloadVideo = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Generate a filename for exported video
 */
export const generateVideoFilename = (
  resolution: number,
  fps: number,
): string => {
  return `shader-${resolution}x${resolution}-${fps}fps-${Date.now()}.webm`;
};

/**
 * Main video export function
 */
export const exportShaderVideo = async (
  options: VideoExportOptions,
  shaderCode: string,
  dynamicUniforms: DynamicUniform[],
  callbacks?: VideoExportCallbacks,
): Promise<void> => {
  const { duration, fps, playbackMode, resolution } = options;

  // Create off-screen canvas with WebGL
  const offscreenResult = createOffscreenCanvas(
    resolution,
    shaderCode,
    dynamicUniforms,
  );
  if (!offscreenResult) {
    throw new Error("Failed to create off-screen WebGL context");
  }
  const { canvas: offscreenCanvas, stateRef: offscreenStateRef } =
    offscreenResult;

  // Create encoding canvas
  const encodeResult = createEncodeCanvas(resolution);
  if (!encodeResult) {
    throw new Error("Failed to create encoding canvas");
  }
  const { canvas: encodeCanvas, ctx: encodeCtx } = encodeResult;

  // Calculate frames
  const baseFrames = duration * fps;
  const totalFrames = calculateTotalFrames(duration, fps, playbackMode);

  // Create video recorder
  const stream = encodeCanvas.captureStream(fps);
  const mediaRecorder = createVideoRecorder(stream, fps);

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  // Start recording
  mediaRecorder.start(100);

  const frameDelay = 1000 / fps;

  // Render forward frames
  for (let i = 0; i < baseFrames; i++) {
    const time = i / fps;
    renderFrame(
      offscreenCanvas,
      offscreenStateRef.current,
      encodeCtx,
      time,
      dynamicUniforms,
    );
    await waitForFrameDelay(frameDelay);
    callbacks?.onProgress?.(i + 1, totalFrames);
  }

  // Render bounce frames if needed
  if (playbackMode === "bounce") {
    for (let i = baseFrames - 2; i > 0; i--) {
      const time = i / fps;
      renderFrame(
        offscreenCanvas,
        offscreenStateRef.current,
        encodeCtx,
        time,
        dynamicUniforms,
      );
      await waitForFrameDelay(frameDelay);
      callbacks?.onProgress?.(baseFrames + (baseFrames - i), totalFrames);
    }
  }

  // Stop recording
  await new Promise<void>((resolve) => {
    mediaRecorder.onstop = () => resolve();
    mediaRecorder.stop();
  });

  // Clean up WebGL context
  cleanupWebGLContext(offscreenStateRef.current.gl);

  // Create video blob
  const videoBlob = createVideoBlob(chunks);
  const videoSizeKB = videoBlob.size / 1024;

  // Download video
  const filename = generateVideoFilename(resolution, fps);
  downloadVideo(videoBlob, filename);

  callbacks?.onComplete?.(videoBlob, videoSizeKB);
};
