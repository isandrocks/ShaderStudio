import React, { useRef, useEffect, useState } from "react";
import ControlPanel from "./components/ControlPanel";
import ShaderCanvas from "./components/ShaderCanvas";
import ShaderModal from "./components/ShaderModal";
import { FRAGMENT_SHADER } from "./shaders";
import {
  ShaderState,
  initWebGL,
  renderShader,
  captureShaderAsImage,
  recompileShader,
} from "./webgl";

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState({
    speed: 1.0,
    lineCount: 10.0,
    amplitude: 0.2,
    yOffset: 0.0,
    paused: false,
    pausedTime: 0.0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shaderCode, setShaderCode] = useState(FRAGMENT_SHADER);
  const [shaderError, setShaderError] = useState("");

  const shaderStateRef = useRef<ShaderState>({
    gl: null,
    program: null,
    uniforms: {},
  });
  const startTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number | undefined>(undefined);
  const customFragmentShaderRef = useRef<string | null>(null);
  const paramsRef = useRef(params);

  const handleShaderError = (error: string | null) => {
    parent.postMessage({ pluginMessage: { type: "shader-error", error } }, "*");
  };

  const getCurrentTime = (): number => {
    return paramsRef.current.paused
      ? paramsRef.current.pausedTime
      : (Date.now() - startTimeRef.current) / 1000.0;
  };

  const renderLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderShader(
      canvas,
      shaderStateRef.current,
      paramsRef.current,
      getCurrentTime(),
    );
    animationFrameRef.current = requestAnimationFrame(renderLoop);
  };

  const captureShader = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    captureShaderAsImage(
      canvas,
      shaderStateRef.current,
      paramsRef.current,
      getCurrentTime(),
      (imageData) => {
        parent.postMessage(
          {
            pluginMessage: {
              type: "shader-rendered",
              imageData,
            },
          },
          "*",
        );
      },
    );
  };

  const handleRecompileShader = (newShaderCode: string): boolean => {
    const gl = shaderStateRef.current.gl;
    if (!gl) return false;

    setShaderError("");

    const success = recompileShader(
      gl,
      shaderStateRef,
      newShaderCode,
      (error) => {
        if (error) {
          setShaderError("Shader Error: " + error);
        }
      },
    );

    if (success) {
      customFragmentShaderRef.current = newShaderCode;
    }

    return success;
  };

  const handleParamChange = (key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

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

  const handleCreateClick = () => {
    parent.postMessage({ pluginMessage: { type: "create-rectangle" } }, "*");
  };

  const handleCancelClick = () => {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
  };

  const handleApplyShader = () => {
    if (handleRecompileShader(shaderCode)) {
      setShaderError("");
    }
  };

  const handleResetShader = () => {
    setShaderCode(FRAGMENT_SHADER);
    customFragmentShaderRef.current = null;
    handleRecompileShader(FRAGMENT_SHADER);
  };

  // Keep paramsRef in sync with params
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (
      initWebGL(
        canvas,
        shaderStateRef,
        customFragmentShaderRef.current,
        handleShaderError,
      )
    ) {
      renderLoop();
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage?.type === "render-shader") {
        captureShader();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div
      className="font-sans bg-[#1e1e1e] text-white p-4 flex flex-col
        items-center gap-4 overflow-hidden"
    >
      <h2 className="text-lg font-semibold text-white mb-2 text-center">
        Shader Studio
      </h2>

      <div className="flex gap-4 items-start">
        <ControlPanel
          params={params}
          onParamChange={handleParamChange}
          onCreateClick={handleCreateClick}
          onCancelClick={handleCancelClick}
          onAdvancedEditorClick={() => setIsModalOpen(true)}
        />

        <ShaderCanvas
          canvasRef={canvasRef}
          isPaused={params.paused}
          onPauseChange={handlePauseChange}
        />
      </div>

      <p className="text-[11px] text-[#999999] text-center max-w-lg">
        Live shader preview above • Adjust parameters in real-time
      </p>

      <ShaderModal
        isOpen={isModalOpen}
        shaderCode={shaderCode}
        error={shaderError}
        onClose={() => setIsModalOpen(false)}
        onShaderChange={setShaderCode}
        onApply={handleApplyShader}
        onReset={handleResetShader}
      />
    </div>
  );
};

export default App;
