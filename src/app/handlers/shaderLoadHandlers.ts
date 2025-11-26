import { RefObject } from "react";
import type { SavedShader, ShaderState, DynamicUniform } from "../types";
import type { ShaderPreset } from "../presets";
import { ensureUniformTypes } from "../utils/shaderUtils";
import { buildFragmentSource, recompileShader } from "../webgl";

export const createShaderLoadHandlers = (
  customFragmentShaderRef: RefObject<string | null>,
  shaderStateRef: RefObject<ShaderState>,
  setShaderCode: (code: string) => void,
  setDynamicUniforms: React.Dispatch<React.SetStateAction<DynamicUniform[]>>,
  setShaderError: (error: string) => void,
  setCriticalError: (error: string | null) => void,
) => {
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

  const deleteSavedShader = (id: string) => {
    parent.postMessage({ pluginMessage: { type: "delete-shader", id } }, "*");
  };

  return {
    loadPreset,
    loadSavedShader,
    deleteSavedShader,
  };
};
