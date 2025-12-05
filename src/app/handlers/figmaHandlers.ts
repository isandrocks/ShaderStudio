import { RefObject } from "react";

export const createFigmaHandlers = (
  startTimeRef: RefObject<number>,
  paramsRef: RefObject<{ paused: boolean; pausedTime: number }>,
  setParams: React.Dispatch<
    React.SetStateAction<{ paused: boolean; pausedTime: number }>
  >,
  setSelectionError: (error: string) => void,
  setShowAspectRatio: (show: boolean) => void,
) => {
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
    parent.postMessage(
      { pluginMessage: { type: "get-selection-dimensions" } },
      "*",
    );
  };

  const handleResizeWindow = (width: number, height: number) => {
    parent.postMessage(
      { pluginMessage: { type: "resize-ui", width, height } },
      "*",
    );
  };

  return {
    handlePauseChange,
    handleApplyToSelection,
    handleCreateRectangle,
    handleToggleOverlay,
    handleResizeWindow,
  };
};
