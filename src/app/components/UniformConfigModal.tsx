import React, { useState } from "react";

interface UniformConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (config: {
    name: string;
    min: number;
    max: number;
    step: number;
    value: number;
  }) => void;
}

const UniformConfigModal: React.FC<UniformConfigModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState("uParam");
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(1);
  const [step, setStep] = useState(0.01);
  const [value, setValue] = useState(0.5);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    // Validate name (must be valid GLSL identifier)
    if (!name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
      setError(
        "Name must be a valid GLSL identifier (letters, numbers, underscore; cannot start with number)",
      );
      return;
    }

    if (min >= max) {
      setError("Min must be less than max");
      return;
    }

    if (value < min || value > max) {
      setError("Value must be between min and max");
      return;
    }

    onAdd({ name, min, max, step, value });

    // Reset form
    setName("uParam");
    setMin(0);
    setMax(1);
    setStep(0.01);
    setValue(0.5);
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
          <div className="flex flex-col ">
            <label className="text-xs text-gray-300">Uniform Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#1e1e1e] text-white px-3 py-2 rounded border
                border-[#3c3c3c] text-sm focus:outline-none
                focus:border-primary"
              placeholder="e.g. uMyParam"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col flex-1 w-[163px]">
              <label className="text-xs text-gray-300">Min:</label>
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(parseFloat(e.target.value))}
                className="bg-[#1e1e1e] text-white px-3 py-2 rounded border
                  border-[#3c3c3c] text-sm focus:outline-none
                  focus:border-primary"
                aria-label="Minimum value"
              />
            </div>
            <div className="flex flex-col flex-1 w-[163px]">
              <label className="text-xs text-gray-300">Max:</label>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(parseFloat(e.target.value))}
                className="bg-[#1e1e1e] text-white px-3 py-2 rounded border
                  border-[#3c3c3c] text-sm focus:outline-none
                  focus:border-primary"
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
                className="bg-[#1e1e1e] text-white px-3 py-2 rounded border
                  border-[#3c3c3c] text-sm focus:outline-none
                  focus:border-primary"
                aria-label="Step increment"
              />
            </div>
            <div className="flex flex-col flex-1 w-[163px]">
              <label className="text-xs text-gray-300">Initial Value:</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value))}
                className="bg-[#1e1e1e] text-white px-3 py-2 rounded border
                  border-[#3c3c3c] text-sm focus:outline-none
                  focus:border-primary"
                aria-label="Initial value"
              />
            </div>
          </div>
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
