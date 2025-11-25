import type { DynamicUniform, UniformType, UniformValue } from "../types";
import { generateUniqueUniformName, createDynamicUniform } from "../utils/shaderUtils";

export const createUniformHandlers = (
  dynamicUniforms: DynamicUniform[],
  setDynamicUniforms: React.Dispatch<React.SetStateAction<DynamicUniform[]>>,
  setOpenModal: (modal: "none") => void,
  setCriticalError: (error: string | null) => void
) => {
  const addUniform = (config: {
    name: string;
    type: UniformType;
    value: UniformValue;
    min: number;
    max: number;
    step: number;
  }) => {
    try {
      const uniqueName = generateUniqueUniformName(config.name, dynamicUniforms);
      const newUniform = createDynamicUniform({
        ...config,
        name: uniqueName,
      });
      
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

  return {
    addUniform,
    updateUniform,
    removeUniform,
  };
};
