import { RefObject } from "react";
import type { DynamicUniform } from "../types";
import { exportShaderVideo } from "../components/video-export/videoExportUtils";

export const createVideoExportHandler = (
  customFragmentShaderRef: RefObject<string | null>,
  dynamicUniformsRef: RefObject<DynamicUniform[]>,
  shaderCode: string,
  setIsVideoModalOpen: (open: boolean) => void,
  setIsExportingVideo: (exporting: boolean) => void,
  setCriticalError: (error: string | null) => void,
) => {
  const handleExportVideo = async (
    duration: number,
    playbackMode: "normal" | "bounce",
    fps: number,
    resolution: number,
    options?: { skipDownload?: boolean; onSuccess?: (blob: Blob) => void },
  ) => {
    setIsExportingVideo(true);
    try {
      const shaderToUse = customFragmentShaderRef.current || shaderCode;

      await exportShaderVideo(
        {
          duration,
          fps,
          playbackMode,
          resolution,
          skipDownload: options?.skipDownload,
        },
        shaderToUse,
        dynamicUniformsRef.current,
        {
          onComplete: (blob, _sizeKB) => {
            setIsVideoModalOpen(false);
            options?.onSuccess?.(blob);
          },
          onError: (error) => {
            setCriticalError(`Video export failed: ${error}`);
          },
        },
      );
    } catch (error) {
      console.error("[handleExportVideo] Error:", error);
      setCriticalError(`Video export failed: ${(error as Error).message}`);
    } finally {
      setIsExportingVideo(false);
    }
  };

  return handleExportVideo;
};
