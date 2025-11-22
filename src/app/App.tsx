import React, { useRef, useEffect, useState } from "react";
import ControlPanel from "./components/ControlPanel";
import ShaderCanvas from "./components/ShaderCanvas";
import ShaderModal from "./components/ShaderModal";
import UniformConfigModal from "./components/UniformConfigModal";
import { PresetGallery } from "./components/PresetGallery";
import SaveShaderModal from "./components/SaveShaderModal";
import { SavedShadersGallery } from "./components/SavedShadersGallery";
import { ShaderPreset, SHADER_PRESETS } from "./presets";
import type {
  ShaderState,
  DynamicUniform,
  UniformType,
  UniformValue,
  SavedShader,
  ModalType,
} from "./types";
import {
  initWebGL,
  renderShader,
  captureShaderAsImage,
  recompileShader,
  buildFragmentSource,
  stripInjectedUniforms,
  injectUniforms,
} from "./webgl";

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState({
    paused: false,
    pausedTime: 0.0,
  });
  const [openModal, setOpenModal] = useState<ModalType>("none");
  const [savedShaders, setSavedShaders] = useState<SavedShader[]>([]);
  const [shaderCode, setShaderCode] = useState(
    SHADER_PRESETS[0].fragmentShader,
  );
  const [shaderError, setShaderError] = useState("");
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [dynamicUniforms, setDynamicUniforms] = useState<DynamicUniform[]>(
    SHADER_PRESETS[0].defaultUniforms,
  );

  const shaderStateRef = useRef<ShaderState>({
    gl: null,
    program: null,
    uniforms: {},
    dynamicUniforms: {},
  });
  const startTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number | undefined>(undefined);
  const customFragmentShaderRef = useRef<string | null>(null);
  const paramsRef = useRef(params);
  const dynamicUniformsRef = useRef(dynamicUniforms);

  const handleShaderError = (error: string | null) => {
    parent.postMessage({ pluginMessage: { type: "shader-error", error } }, "*");
  };

  const getCurrentTime = (): number => {
    return paramsRef.current.paused
      ? paramsRef.current.pausedTime
      : (Date.now() - startTimeRef.current) / 1000.0;
  };

  const renderLoop = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      renderShader(
        canvas,
        shaderStateRef.current,
        { ...paramsRef.current, dynamicUniforms: dynamicUniformsRef.current },
        getCurrentTime(),
      );
      animationFrameRef.current = requestAnimationFrame(renderLoop);
    } catch (error) {
      console.error("[renderLoop] Error:", error);
      setCriticalError(`Render loop failed: ${(error as Error).message}`);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const captureShader = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    captureShaderAsImage(
      canvas,
      shaderStateRef.current,
      { ...paramsRef.current, dynamicUniforms: dynamicUniformsRef.current },
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
    try {
      const gl = shaderStateRef.current.gl;
      if (!gl) {
        console.error("[handleRecompileShader] No GL context");
        return false;
      }

      setShaderError("");

      const combined = buildFragmentSource(newShaderCode, dynamicUniforms);

      const success = recompileShader(gl, shaderStateRef, combined, (error) => {
        if (error) {
          console.error("[handleRecompileShader] Shader error:", error);
          setShaderError("Shader Error: " + error);
        }
      });

      if (success) {
        customFragmentShaderRef.current = newShaderCode;
      }

      return success;
    } catch (error) {
      console.error("[handleRecompileShader] EXCEPTION:", error);
      console.error("[handleRecompileShader] Stack:", (error as Error).stack);
      setCriticalError(
        `Shader compilation failed: ${(error as Error).message}`,
      );
      return false;
    }
  };

  const addUniform = (config: {
    name: string;
    type: UniformType;
    value: UniformValue;
    min: number;
    max: number;
    step: number;
  }) => {
    try {
      const existingNames = new Set(dynamicUniforms.map((u) => u.name));
      
      // Auto-increment name if it already exists
      let finalName = config.name;
      if (existingNames.has(finalName)) {
        let counter = 2;
        while (existingNames.has(`${config.name}${counter}`)) {
          counter++;
        }
        finalName = `${config.name}${counter}`;
      }

      const newU: DynamicUniform = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...config,
        name: finalName,
      };
      setDynamicUniforms((prev) => [...prev, newU]);
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

  // Load a preset shader
  const loadPreset = (preset: ShaderPreset) => {
    try {
      customFragmentShaderRef.current = preset.fragmentShader;
      setShaderCode(preset.fragmentShader);

      // Ensure backward compatibility - default type to 'float' if missing
      const uniformsWithTypes = preset.defaultUniforms.map((u) => ({
        ...u,
        type: u.type || ("float" as UniformType),
      }));
      setDynamicUniforms(uniformsWithTypes);
      setShaderError("");
    } catch (error) {
      console.error("[loadPreset] Error:", error);
      setCriticalError(`Failed to load preset: ${(error as Error).message}`);
    }
  };

  // Load a saved shader
  const loadSavedShader = (shader: SavedShader) => {
    try {
      customFragmentShaderRef.current = shader.fragmentShader;
      setShaderCode(shader.fragmentShader);

      // Ensure backward compatibility - default type to 'float' if missing
      const uniformsWithTypes = shader.dynamicUniforms.map((u) => ({
        ...u,
        type: u.type || ("float" as UniformType),
      }));
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

  // Delete a saved shader
  const deleteSavedShader = (id: string) => {
    parent.postMessage({ pluginMessage: { type: "delete-shader", id } }, "*");
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
    const defaultShader = SHADER_PRESETS[0].fragmentShader;
    setShaderCode(defaultShader);
    customFragmentShaderRef.current = null;
    handleRecompileShader(defaultShader);
  };

  // Keep refs in sync
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    dynamicUniformsRef.current = dynamicUniforms;
  }, [dynamicUniforms]);

  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("[useEffect:init] Canvas ref is null");
        return;
      }

      const initialCombined = buildFragmentSource(
        customFragmentShaderRef.current || SHADER_PRESETS[0].fragmentShader,
        dynamicUniforms,
      );

      if (
        initWebGL(canvas, shaderStateRef, initialCombined, handleShaderError)
      ) {
        renderLoop();
      } else {
        console.error("[useEffect:init] WebGL initialization failed");
        setCriticalError("Failed to initialize WebGL");
      }

      const handleMessage = (event: MessageEvent) => {
        try {
          const msg = event.data.pluginMessage;
          if (!msg) return;

          switch (msg.type) {
            case "render-shader":
              captureShader();
              break;

            case "shaders-loaded":
              setSavedShaders(msg.shaders || []);
              break;

            case "shader-saved":
              // Refresh shader list
              parent.postMessage(
                { pluginMessage: { type: "load-shaders" } },
                "*",
              );
              break;

            case "shader-deleted":
              // Remove from local state
              setSavedShaders((prev) => prev.filter((s) => s.id !== msg.id));
              break;

            case "storage-error":
              setCriticalError(msg.error);
              break;
          }
        } catch (error) {
          console.error("[handleMessage] Error:", error);
          setCriticalError(
            `Message handling failed: ${(error as Error).message}`,
          );
        }
      };

      // Request saved shaders from plugin
      parent.postMessage({ pluginMessage: { type: "load-shaders" } }, "*");

      window.addEventListener("message", handleMessage);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener("message", handleMessage);
      };
    } catch (error) {
      console.error("[useEffect:init] Exception:", error);
      setCriticalError(`Initialization failed: ${(error as Error).message}`);
    }
  }, []);

  // Recompile shader whenever the dynamic uniforms set changes
  useEffect(() => {
    try {
      if (!shaderStateRef.current.gl) {
        return;
      }

      const baseShader =
        customFragmentShaderRef.current || SHADER_PRESETS[0].fragmentShader;
      const injectedCode = injectUniforms(baseShader, dynamicUniforms);

      if (handleRecompileShader(baseShader)) {
        setShaderCode(injectedCode);
      }
    } catch (error) {
      console.error("[useEffect:recompile] EXCEPTION:", error);
      console.error("[useEffect:recompile] Stack:", (error as Error).stack);
      setCriticalError(`Recompile failed: ${(error as Error).message}`);
    }
  }, [dynamicUniforms]);

  return (
    <div
      className="font-sans bg-[#1e1e1e] text-white p-4 flex flex-col
        items-center gap-4 overflow-hidden"
    >
      {criticalError && (
        <div
          className="w-full bg-red-900/30 border border-red-500 rounded p-3
            text-sm"
        >
          <div className="font-semibold text-red-400 mb-1">Critical Error:</div>
          <div className="text-red-200">{criticalError}</div>
          <button
            onClick={() => {
              setCriticalError(null);
              window.location.reload();
            }}
            className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-500 rounded
              text-xs"
          >
            Reload Plugin
          </button>
        </div>
      )}

      <div className="flex gap-4 items-start">
        <ControlPanel
          onCreateClick={handleCreateClick}
          onCancelClick={handleCancelClick}
          onAdvancedEditorClick={() => setOpenModal("shader")}
          onPresetsClick={() => setOpenModal("presets")}
          onSaveShader={() => setOpenModal("save")}
          onOpenSavedShaders={() => setOpenModal("saved-shaders")}
          dynamicUniforms={dynamicUniforms}
          onAddUniform={() => setOpenModal("config")}
          onUpdateUniform={updateUniform}
          onRemoveUniform={removeUniform}
        />

        <ShaderCanvas
          canvasRef={canvasRef}
          isPaused={params.paused}
          onPauseChange={handlePauseChange}
        />
      </div>

      <p className="text-[11px] text-[#999999] text-center max-w-lg absolute bottom-4">
        Live shader preview above • Adjust parameters in real-time
      </p>

      <ShaderModal
        isOpen={openModal === "shader"}
        shaderCode={shaderCode}
        error={shaderError}
        onClose={() => setOpenModal("none")}
        onShaderChange={setShaderCode}
        onApply={handleApplyShader}
        onReset={handleResetShader}
        onClearError={() => setShaderError("")}
      />

      <UniformConfigModal
        isOpen={openModal === "config"}
        onClose={() => setOpenModal("none")}
        onAdd={addUniform}
      />

      <PresetGallery
        isOpen={openModal === "presets"}
        onClose={() => setOpenModal("none")}
        onSelectPreset={loadPreset}
      />

      <SaveShaderModal
        isOpen={openModal === "save"}
        onClose={() => setOpenModal("none")}
        shaderCode={shaderCode}
        customFragmentShaderRef={customFragmentShaderRef}
        dynamicUniforms={dynamicUniforms}
        canvasRef={canvasRef}
        shaderStateRef={shaderStateRef}
        getCurrentTime={getCurrentTime}
        isPaused={params.paused}
      />

      <SavedShadersGallery
        isOpen={openModal === "saved-shaders"}
        savedShaders={savedShaders}
        onClose={() => setOpenModal("none")}
        onLoadShader={loadSavedShader}
        onDeleteShader={deleteSavedShader}
      />
    </div>
  );
};

export default App;
