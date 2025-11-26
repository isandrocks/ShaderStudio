import { Dispatch, SetStateAction } from "react";
import { EffectLayer, DynamicUniform, UniformValue } from "../types";
import { LAYER_TEMPLATES } from "../layerTemplates";
import { createDynamicUniform } from "../utils/shaderUtils";

export const createLayerHandlers = (
  layers: EffectLayer[],
  setLayers: Dispatch<SetStateAction<EffectLayer[]>>,
  dynamicUniforms: DynamicUniform[],
  setDynamicUniforms: Dispatch<SetStateAction<DynamicUniform[]>>,
  setSelectedLayerId: Dispatch<SetStateAction<string | null>>
) => {
  
  const generateLayerId = () => {
    // Short 4-char ID for cleaner uniform names (e.g. L9X2A)
    return `L${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  };

  const addLayer = (templateId: string) => {
    const template = LAYER_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      console.error(`Template ${templateId} not found`);
      return;
    }

    const layerId = generateLayerId();
    const newUniforms: DynamicUniform[] = [];

    // 1. Create Opacity Uniform
    const opacityUniformName = `u_${layerId}_opacity`;
    newUniforms.push(
      createDynamicUniform({
        name: opacityUniformName,
        type: "float",
        value: 1.0,
        min: 0.0,
        max: 1.0,
        step: 0.01,
      })
    );

    // 2. Create Property Uniforms
    const layerProperties: Record<string, UniformValue> = {};
    
    Object.entries(template.defaultProperties).forEach(([key, prop]) => {
      const uniformName = `u_${layerId}_${key}`;
      
      newUniforms.push(
        createDynamicUniform({
          name: uniformName,
          type: prop.type,
          value: prop.value,
          min: prop.min || 0,
          max: prop.max || 1,
          step: prop.step || 0.01,
        })
      );

      layerProperties[key] = prop.value;
    });

    // 3. Create Layer Object
    const newLayer: EffectLayer = {
      id: layerId,
      name: `${template.name} ${layers.length + 1}`,
      type: template.type,
      effectId: template.id,
      visible: true,
      opacity: 1.0,
      blendMode: "normal",
      properties: layerProperties,
    };

    // 4. Update State
    setDynamicUniforms((prev) => [...prev, ...newUniforms]);
    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(layerId);
  };

  const removeLayer = (layerId: string) => {
    // Remove layer
    setLayers((prev) => prev.filter((l) => l.id !== layerId));
    
    // Remove associated uniforms
    // We identify them by the prefix u_{layerId}_
    const prefix = `u_${layerId}_`;
    setDynamicUniforms((prev) => prev.filter((u) => !u.name.startsWith(prefix)));
    
    setSelectedLayerId(null);
  };

  const updateLayer = (layerId: string, updates: Partial<EffectLayer>) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, ...updates } : l))
    );

    // If opacity changed, update uniform
    if (updates.opacity !== undefined) {
      const uniformName = `u_${layerId}_opacity`;
      setDynamicUniforms((prev) =>
        prev.map((u) =>
          u.name === uniformName ? { ...u, value: updates.opacity! } : u
        )
      );
    }
  };

  const updateLayerProperty = (layerId: string, propKey: string, value: UniformValue) => {
    // Update layer state (for UI)
    setLayers((prev) =>
      prev.map((l) =>
        l.id === layerId
          ? { ...l, properties: { ...l.properties, [propKey]: value } }
          : l
      )
    );

    // Update uniform state (for Shader)
    const uniformName = `u_${layerId}_${propKey}`;
    setDynamicUniforms((prev) =>
      prev.map((u) => (u.name === uniformName ? { ...u, value } : u))
    );
  };

  const reorderLayers = (fromIndex: number, toIndex: number) => {
    setLayers((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  };

  return {
    addLayer,
    removeLayer,
    updateLayer,
    updateLayerProperty,
    reorderLayers,
  };
};
