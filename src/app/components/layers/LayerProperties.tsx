import React from "react";
import { EffectLayer, BlendMode, UniformValue } from "../../types";
import { LAYER_TEMPLATES } from "../../layerTemplates";
import SliderControl from "../SliderControl";
import { ColorControl } from "../ColorControl";

interface LayerPropertiesProps {
  layer: EffectLayer | null;
  onUpdate: (updates: Partial<EffectLayer>) => void;
  onUpdateProperty: (key: string, value: UniformValue) => void;
}

export const LayerProperties: React.FC<LayerPropertiesProps> = ({
  layer,
  onUpdate,
  onUpdateProperty,
}) => {
  if (!layer) {
    return (
      <div className="w-60 bg-[#1e1e1e] border-l border-[#3c3c3c] p-4 text-[#999] text-xs text-center">
        Select a layer to edit properties
      </div>
    );
  }

  const template = LAYER_TEMPLATES.find((t) => t.id === layer.effectId);

  return (
    <div className="w-60 bg-[#1e1e1e] border-l border-[#3c3c3c] flex flex-col h-full overflow-y-auto">
      <div className="p-3 border-b border-[#3c3c3c]">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          Properties
        </h2>
        
        {/* Layer Name */}
        <div className="mb-4">
          <label className="block text-[10px] text-[#999] mb-1" htmlFor="layer-name">Name</label>
          <input
            id="layer-name"
            type="text"
            value={layer.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full bg-[#383838] border border-[#444444] rounded px-2 py-1 text-xs text-white focus:border-primary outline-none"
          />
        </div>

        {/* Opacity */}
        <div className="mb-4">
          <SliderControl
            id="opacity"
            label="Opacity"
            value={layer.opacity}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => onUpdate({ opacity: v })}
          />
        </div>

        {/* Blend Mode */}
        <div className="mb-2">
          <label className="block text-[10px] text-[#999] mb-1" htmlFor="blend-mode">Blend Mode</label>
          <select
            id="blend-mode"
            value={layer.blendMode}
            onChange={(e) => onUpdate({ blendMode: e.target.value as BlendMode })}
            className="w-full bg-[#383838] border border-[#444444] rounded px-2 py-1 text-xs text-white focus:border-primary outline-none"
          >
            <option value="normal">Normal</option>
            <option value="multiply">Multiply</option>
            <option value="screen">Screen</option>
            <option value="overlay">Overlay</option>
            <option value="add">Add</option>
          </select>
        </div>
      </div>

      {/* Effect Specific Properties */}
      {template && (
        <div className="p-3 space-y-4">
          <h3 className="text-[10px] font-bold text-[#999] uppercase tracking-wider">
            Effect Settings
          </h3>
          
          {Object.entries(template.defaultProperties).map(([key, propDef]) => {
            const currentValue = layer.properties[key];
            
            if (propDef.type === "float") {
              return (
                <SliderControl
                  key={key}
                  id={key}
                  label={propDef.label}
                  value={currentValue as number}
                  min={propDef.min || 0}
                  max={propDef.max || 1}
                  step={propDef.step || 0.01}
                  format={(v) => v.toFixed(2)}
                  onChange={(v) => onUpdateProperty(key, v)}
                />
              );
            } else if (propDef.type === "vec3" || propDef.type === "vec4") {
              return (
                <ColorControl
                  key={key}
                  id={key}
                  label={propDef.label}
                  value={currentValue as [number, number, number]}
                  type={propDef.type}
                  onChange={(v) => onUpdateProperty(key, v)}
                />
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};
