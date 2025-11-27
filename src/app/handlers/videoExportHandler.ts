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
  ) => {
    setIsExportingVideo(true);
    try {
      const shaderToUse = customFragmentShaderRef.current || shaderCode;

      await exportShaderVideo(
        {
          duration,
          fps,
          playbackMode,
          resolution: 1080,
        },
        shaderToUse,
        dynamicUniformsRef.current,
        {
          onComplete: (blob, sizeKB) => {
            setIsVideoModalOpen(false);
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
