import React from "react";

interface ShaderModalProps {
  isOpen: boolean;
  shaderCode: string;
  error: string;
  onClose: () => void;
  onShaderChange: (code: string) => void;
  onApply: () => void;
  onReset: () => void;
}

const ShaderModal: React.FC<ShaderModalProps> = ({
  isOpen,
  shaderCode,
  error,
  onClose,
  onShaderChange,
  onApply,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50
        p-5 overflow-hidden"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-[#2c2c2c] border border-[#3c3c3c] rounded-lg w-full
          max-w-[700px] max-h-[90vh] flex flex-col
          shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      >
        <div
          className="p-4 border-b border-[#3c3c3c] flex justify-between
            items-center"
        >
          <h3 className="text-sm font-semibold text-white m-0">
            Advanced Shader Editor
          </h3>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-[#999999] text-xl
              cursor-pointer p-0 w-6 h-6 flex items-center justify-center
              rounded transition-all duration-150 hover:bg-[#3c3c3c]
              hover:text-white shrink-0"
          >
            ✕
          </button>
        </div>
        <div className="p-5 flex-1 flex flex-col gap-3 overflow-hidden">
          <textarea
            value={shaderCode}
            onChange={(e) => onShaderChange(e.target.value)}
            spellCheck={false}
            className="w-full min-h-[400px] bg-[#1e1e1e] text-[#d4d4d4]
              font-mono text-xs leading-relaxed p-4 border border-[#3c3c3c]
              rounded-md resize-y outline-none focus:border-primary"
            aria-label="GLSL Fragment Shader Code"
          />
          {error && (
            <div
              className="bg-[#5c2020] border border-[#8b3333] text-[#ff6b6b] p-3
                rounded-md text-xs max-h-[120px] overflow-y-auto font-mono
                leading-tight"
            >
              {error}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-[#3c3c3c] flex gap-2">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2.5 text-[13px] font-medium font-inherit
              border-none rounded-md cursor-pointer transition-all duration-150
              outline-none bg-[#2c2c2c] text-white border border-[#3c3c3c]
              hover:bg-[#333333] active:bg-[#2a2a2a] active:scale-[0.98]"
          >
            Reset to Default
          </button>
          <button
            onClick={onApply}
            className="flex-1 px-4 py-2.5 text-[13px] font-medium font-inherit
              border-none rounded-md cursor-pointer transition-all duration-150
              outline-none bg-primary text-white hover:bg-primary-hover
              active:bg-primary-active active:scale-[0.98]"
          >
            Apply Shader
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShaderModal;
