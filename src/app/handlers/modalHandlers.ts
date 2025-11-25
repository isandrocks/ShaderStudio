import { RefObject } from "react";
import type { DynamicUniform } from "../types";
import { SHADER_PRESETS } from "../presets";
import { stripInjectedUniforms, injectUniforms } from "../webgl";

export const createModalHandlers = (
  shaderCode: string,
  dynamicUniforms: DynamicUniform[],
  customFragmentShaderRef: RefObject<string | null>,
  modalShaderSnapshotRef: RefObject<string | null>,
  handleRecompileShader: (newShaderCode: string) => boolean,
  setShaderCode: (code: string) => void,
  setShaderError: (error: string) => void
) => {
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

  return {
    handleApplyShader,
    handleResetShader,
  };
};
