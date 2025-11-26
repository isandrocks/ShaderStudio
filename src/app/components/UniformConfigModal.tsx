import React, { useState } from "react";
import type { UniformType, UniformValue } from "../types";
import { ColorControl } from "./ColorControl";

interface UniformConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (config: {
    name: string;
    type: UniformType;
    value: UniformValue;
    min: number;
    max: number;
    step: number;
  }) => void;
}

const UniformConfigModal: React.FC<UniformConfigModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState("uParam");
  const [type, setType] = useState<UniformType>("float");
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(1);
  const [step, setStep] = useState(0.01);
  const [floatValue, setFloatValue] = useState(0.5);
  const [colorValue, setColorValue] = useState<
    [number, number, number] | [number, number, number, number]
  >([0.5, 0.5, 0.5]);
  const [includeAlpha, setIncludeAlpha] = useState(false);
  const [error, setError] = useState("");

  // Compute actual type based on includeAlpha
  const actualType: UniformType =
    type === "float" ? "float" : includeAlpha ? "vec4" : "vec3";

  if (!isOpen) return null;

  const handleAdd = () => {
    // Validate name (must be valid GLSL identifier)
    if (!name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
      setError(
        "Name must be a valid GLSL identifier (letters, numbers, underscore; cannot start with number)",
      );
      return;
    }

    // For float types, validate min/max/value
    if (type === "float") {
      if (min >= max) {
        setError("Min must be less than max");
        return;
      }

      if (floatValue < min || floatValue > max) {
        setError("Value must be between min and max");
        return;
      }
    }

    // Determine value based on actualType
    const value: UniformValue =
      actualType === "float"
        ? floatValue
        : actualType === "vec3"
          ? (colorValue as [number, number, number])
          : (colorValue as [number, number, number, number]);

    onAdd({ name, type: actualType, value, min, max, step });

    // Reset form
    setName("uParam");
    setType("float");
    setMin(0);
    setMax(1);
    setStep(0.01);
    setFloatValue(0.5);
    setColorValue([0.5, 0.5, 0.5]);
    setIncludeAlpha(false);
    setError("");
  };

  const handleCancel = () => {
    setError("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center
        z-50"
    >
      <div
        className="bg-[#2c2c2c] rounded-lg p-6 w-96 border border-[#3c3c3c] flex
          flex-col gap-4"
      >
        <h3 className="text-base font-semibold text-white">Add Parameter</h3>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-gray-300">Uniform Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#383838] text-white px-3 py-2 rounded border
                border-[#444444] text-sm focus:outline-none
                focus:border-primary hover:border-[#8c8c8c] transition-colors"
              placeholder="e.g. uMyParam"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-300">Type:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "float" | "vec3")}
              className="bg-[#383838] text-white px-3 py-2 rounded border
                border-[#444444] text-sm focus:outline-none focus:border-primary
                cursor-pointer hover:border-[#8c8c8c] transition-colors"
              title="Uniform type selector"
            >
              <option value="float">float (slider)</option>
              <option value="vec3">color (RGB/RGBA)</option>
            </select>
          </div>

          {type === "float" && (
            <>
              <div className="flex gap-2">
                <div className="flex flex-col flex-1 w-[163px]">
                  <label className="text-xs text-gray-300">Min:</label>
                  <input
                    type="number"
                    value={min}
                    onChange={(e) => setMin(parseFloat(e.target.value))}
                    className="bg-[#383838] text-white px-3 py-2 rounded border
                      border-[#444444] text-sm focus:outline-none
                      focus:border-primary hover:border-[#8c8c8c] transition-colors"
                    aria-label="Minimum value"
                  />
                </div>
                <div className="flex flex-col flex-1 w-[163px]">
                  <label className="text-xs text-gray-300">Max:</label>
                  <input
                    type="number"
                    value={max}
                    onChange={(e) => setMax(parseFloat(e.target.value))}
                    className="bg-[#383838] text-white px-3 py-2 rounded border
                      border-[#444444] text-sm focus:outline-none
                      focus:border-primary hover:border-[#8c8c8c] transition-colors"
                    aria-label="Maximum value"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex flex-col flex-1 w-[163px]">
                  <label className="text-xs text-gray-300">Step:</label>
                  <input
                    type="number"
                    value={step}
                    onChange={(e) => setStep(parseFloat(e.target.value))}
                    className="bg-[#383838] text-white px-3 py-2 rounded border
                      border-[#444444] text-sm focus:outline-none
                      focus:border-primary hover:border-[#8c8c8c] transition-colors"
                    aria-label="Step increment"
                  />
                </div>
                <div className="flex flex-col flex-1 w-[163px]">
                  <label className="text-xs text-gray-300">
                    Initial Value:
                  </label>
                  <input
                    type="number"
                    value={floatValue}
                    onChange={(e) => setFloatValue(parseFloat(e.target.value))}
                    className="bg-[#383838] text-white px-3 py-2 rounded border
                      border-[#444444] text-sm focus:outline-none
                      focus:border-primary hover:border-[#8c8c8c] transition-colors"
                    aria-label="Initial value"
                  />
                </div>
              </div>
            </>
          )}

          {type === "vec3" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-300">Initial Color:</label>
                <label
                  className="flex items-center gap-2 text-xs text-gray-300
                    cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={includeAlpha}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIncludeAlpha(checked);

                      if (checked && colorValue.length === 3) {
                        setColorValue([...colorValue, 1.0] as [
                          number,
                          number,
                          number,
                          number,
                        ]);
                      } else if (!checked && colorValue.length === 4) {
                        setColorValue([
                          colorValue[0],
                          colorValue[1],
                          colorValue[2],
                        ]);
                      }
                    }}
                    className="cursor-pointer"
                  />
                  Include Alpha
                </label>
              </div>

              <ColorControl
                id="color-config"
                label=""
                value={colorValue}
                type={actualType === "vec4" ? "vec4" : "vec3"}
                onChange={(newValue) => setColorValue(newValue)}
              />

              <p className="text-xs text-center text-gray-400">
                Click the color swatch to open the color picker
              </p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-900/20 p-2 rounded">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="flex-1 px-4 py-2 text-sm font-medium bg-primary
              text-white rounded hover:bg-primary-hover transition-colors"
          >
            Add
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 text-sm font-medium bg-[#2c2c2c]
              text-white border border-[#3c3c3c] rounded hover:bg-[#333333]
              transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniformConfigModal;
