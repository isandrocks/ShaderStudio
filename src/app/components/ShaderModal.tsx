import React from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-glsl";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

interface ShaderModalProps {
  isOpen: boolean;
  shaderCode: string;
  error: string;
  onClose: () => void;
  onShaderChange: (code: string) => void;
  onApply: () => void;
  onReset: () => void;
  onClearError: () => void;
}

const ShaderModal: React.FC<ShaderModalProps> = ({
  isOpen,
  shaderCode,
  error,
  onClose,
  onShaderChange,
  onApply,
  onReset,
  onClearError,
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
        <div className="p-5 flex-1 flex flex-col overflow-hidden">
          <AceEditor
            mode="glsl"
            theme="monokai"
            value={shaderCode}
            onChange={onShaderChange}
            name="shader-editor"
            editorProps={{ $blockScrolling: true }}
            fontSize={12}
            showPrintMargin={false}
            showGutter={true}
            highlightActiveLine={true}
            width="100%"
            height="400px"
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: false,
              enableSnippets: false,
              showLineNumbers: true,
              tabSize: 2,
              useWorker: false, // Disable worker to avoid errors in Figma plugin context
            }}
            style={{
              fontFamily: 'Consolas, "Courier New", monospace',
              borderRadius: "6px",
              border: "1px solid #3c3c3c",
            }}
          />
          {error && (
            <div
              className="fixed inset-0 bg-black/60 flex items-center
                justify-center z-60"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  onClearError();
                }
              }}
            >
              <div
                className="bg-[#2c2c2c] border border-[#8b3333] rounded-lg
                  max-w-[600px] w-full mx-4 max-h-[80vh] flex flex-col
                  shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              >
                <div
                  className="p-3 border-b border-[#8b3333] flex justify-between
                    items-center shrink-0"
                >
                  <h4 className="text-sm font-semibold text-[#ff6b6b] m-0">
                    Shader Error
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearError();
                    }}
                    className="bg-transparent border-none text-[#ff6b6b] text-xl
                      cursor-pointer p-0 w-6 h-6 flex items-center
                      justify-center rounded transition-all duration-150
                      hover:bg-[#5c2020] hover:text-white shrink-0"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                  <pre
                    className="text-[#ff6b6b] font-mono text-xs leading-tight
                      m-0 whitespace-pre-wrap"
                  >
                    {error}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-[#3c3c3c] flex gap-2">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2.5 text-[13px] font-medium font-inherit
              border-none rounded-md cursor-pointer transition-all duration-150
              outline-none bg-[#3c3c3c] text-white border border-[#4c4c4c]
              hover:bg-[#454545] hover:border-[#5c5c5c] active:bg-[#2a2a2a] active:scale-[0.98]"
          >
            Discard Changes
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
