import React, { useRef, useEffect, useState } from "react";
import ControlPanel from "./components/ControlPanel";
import ShaderCanvas from "./components/ShaderCanvas";
import ShaderModal from "./components/ShaderModal";
import UniformConfigModal from "./components/UniformConfigModal";
import { FRAGMENT_SHADER } from "./shaders";
import {
  ShaderState,
  DynamicUniform,
  initWebGL,
  renderShader,
  captureShaderAsImage,
  recompileShader,
  buildFragmentSource,
} from "./webgl";

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState({
    paused: false,
    pausedTime: 0.0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [shaderCode, setShaderCode] = useState(FRAGMENT_SHADER);
  const [shaderError, setShaderError] = useState("");
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [dynamicUniforms, setDynamicUniforms] = useState<DynamicUniform[]>([
    { id: "base-speed", name: "uSpeed", value: 1.0, min: 0, max: 3, step: 0.1 },
    {
      id: "base-lineCount",
      name: "uLineCount",
      value: 10.0,
      min: 1,
      max: 20,
      step: 1,
    },
    {
      id: "base-amplitude",
      name: "uAmplitude",
      value: 0.2,
      min: 0,
      max: 0.5,
      step: 0.01,
    },
    {
      id: "base-yOffset",
      name: "uYOffset",
      value: 0.0,
      min: -0.5,
      max: 0.5,
      step: 0.01,
    },
  ]);

  console.log("[App] Rendered with", dynamicUniforms.length, "uniforms");

  const shaderStateRef = useRef<ShaderState>({
    gl: null,
    program: null,
    uniforms: {},
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
      console.log("[handleRecompileShader] START");
      console.log(
        "[handleRecompileShader] Recompiling with",
        dynamicUniforms.length,
        "uniforms:",
        dynamicUniforms.map((u) => u.name).join(", "),
      );
      console.log(
        "[handleRecompileShader] Input shader code length:",
        newShaderCode.length,
      );
      console.log(
        "[handleRecompileShader] Input shader first 300 chars:",
        newShaderCode.substring(0, 300),
      );

      const gl = shaderStateRef.current.gl;
      if (!gl) {
        console.error("[handleRecompileShader] No GL context");
        return false;
      }

      setShaderError("");

      console.log("[handleRecompileShader] Calling buildFragmentSource...");
      const combined = buildFragmentSource(newShaderCode, dynamicUniforms);
      console.log(
        "[handleRecompileShader] Combined shader length:",
        combined.length,
      );
      console.log(
        "[handleRecompileShader] Combined shader first 500 chars:",
        combined.substring(0, 500),
      );

      console.log("[handleRecompileShader] Calling recompileShader...");
      const success = recompileShader(gl, shaderStateRef, combined, (error) => {
        if (error) {
          console.error(
            "[handleRecompileShader] Shader error from WebGL:",
            error,
          );
          console.error("[handleRecompileShader] Failed shader source:");
          console.error(combined);
          setShaderError("Shader Error: " + error);
        }
      });

      if (success) {
        customFragmentShaderRef.current = newShaderCode;
        console.log(
          "[handleRecompileShader] SUCCESS - Shader compiled and applied",
        );
      } else {
        console.error(
          "[handleRecompileShader] FAILED - Shader compilation returned false",
        );
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
    min: number;
    max: number;
    step: number;
    value: number;
  }) => {
    try {
      console.log("[addUniform] Adding uniform:", config);
      const existingNames = new Set(dynamicUniforms.map((u) => u.name));
      if (existingNames.has(config.name)) {
        setShaderError(`Uniform "${config.name}" already exists`);
        return;
      }

      const newU: DynamicUniform = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...config,
      };
      setDynamicUniforms((prev) => {
        console.log("[addUniform] New uniforms count:", prev.length + 1);
        return [...prev, newU];
      });
      setIsConfigModalOpen(false);
    } catch (error) {
      console.error("[addUniform] Error:", error);
      setCriticalError(`Failed to add uniform: ${(error as Error).message}`);
    }
  };

  const updateUniform = (id: string, value: number) => {
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
      console.log("[removeUniform] Removing uniform:", id);
      setDynamicUniforms((prev) => {
        const newUniforms = prev.filter((u) => u.id !== id);
        console.log("[removeUniform] New uniforms count:", newUniforms.length);
        return newUniforms;
      });
    } catch (error) {
      console.error("[removeUniform] Error:", error);
      setCriticalError(`Failed to remove uniform: ${(error as Error).message}`);
    }
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
      console.log("[handleApplyShader] START");
      console.log(
        "[handleApplyShader] Current shaderCode length:",
        shaderCode.length,
      );
      console.log(
        "[handleApplyShader] Current shaderCode first 300 chars:",
        shaderCode.substring(0, 300),
      );

      // The shader code in the editor might have manually edited uniforms
      // We need to treat it as the new "base" shader and recompile
      setShaderError("");

      // Strip out any auto-injected uniforms to get clean base code
      // (User might have manually added/removed uniforms in the editor)
      const cleanedCode = stripInjectedUniforms(shaderCode);
      console.log(
        "[handleApplyShader] Cleaned code length:",
        cleanedCode.length,
      );

      // Now recompile with the cleaned code as the new base
      if (handleRecompileShader(cleanedCode)) {
        console.log("[handleApplyShader] Recompile SUCCESS");
        // Update the base shader reference
        customFragmentShaderRef.current = cleanedCode;
        // Update editor with the version that has uniforms injected
        const injectedCode = injectUniforms(cleanedCode);
        setShaderCode(injectedCode);
      } else {
        console.error("[handleApplyShader] Recompile FAILED");
      }
    } catch (error) {
      console.error("[handleApplyShader] EXCEPTION:", error);
      console.error("[handleApplyShader] Stack:", (error as Error).stack);
      setShaderError(`Apply failed: ${(error as Error).message}`);
    }
  };

  // Remove auto-injected uniform declarations (but keep user-added ones)
  const stripInjectedUniforms = (code: string): string => {
    try {
      console.log("[stripInjectedUniforms] Input length:", code.length);
      // Remove uniform declarations that match our dynamic uniforms (non-base)
      let result = code;
      dynamicUniforms
        .filter((u) => !u.id.startsWith("base-"))
        .forEach((u) => {
          const pattern = new RegExp(
            `\\s*uniform\\s+float\\s+${u.name}\\s*;`,
            "g",
          );
          result = result.replace(pattern, "");
        });
      console.log("[stripInjectedUniforms] Output length:", result.length);
      return result;
    } catch (error) {
      console.error("[stripInjectedUniforms] Error:", error);
      return code;
    }
  };

  const injectUniforms = (code: string): string => {
    try {
      // Find where uniforms are declared (after precision statement)
      const precisionMatch = code.match(/precision\s+\w+\s+float;/);
      if (!precisionMatch) {
        console.warn("[injectUniforms] No precision statement found");
        return code;
      }

      const insertPos = precisionMatch.index! + precisionMatch[0].length;
      const uniformDecls = dynamicUniforms
        .filter((u) => !u.id.startsWith("base-")) // Skip base uniforms already in FRAGMENT_SHADER
        .map((u) => `\n  uniform float ${u.name};`)
        .join("");

      console.log(
        "[injectUniforms] Injecting",
        uniformDecls.length,
        "chars of uniforms",
      );
      return code.slice(0, insertPos) + uniformDecls + code.slice(insertPos);
    } catch (error) {
      console.error("[injectUniforms] Error:", error);
      return code;
    }
  };

  const handleResetShader = () => {
    setShaderCode(FRAGMENT_SHADER);
    customFragmentShaderRef.current = null;
    handleRecompileShader(FRAGMENT_SHADER);
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
      console.log("[useEffect:init] Initializing WebGL");
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("[useEffect:init] Canvas ref is null");
        return;
      }

      const initialCombined = buildFragmentSource(
        customFragmentShaderRef.current || FRAGMENT_SHADER,
        dynamicUniforms,
      );

      console.log(
        "[useEffect:init] Initial shader length:",
        initialCombined.length,
      );

      if (
        initWebGL(canvas, shaderStateRef, initialCombined, handleShaderError)
      ) {
        console.log("[useEffect:init] WebGL initialized, starting render loop");
        renderLoop();
      } else {
        console.error("[useEffect:init] WebGL initialization failed");
        setCriticalError("Failed to initialize WebGL");
      }

      const handleMessage = (event: MessageEvent) => {
        try {
          if (event.data.pluginMessage?.type === "render-shader") {
            console.log("[handleMessage] Capturing shader");
            captureShader();
          }
        } catch (error) {
          console.error("[handleMessage] Error:", error);
          setCriticalError(
            `Message handling failed: ${(error as Error).message}`,
          );
        }
      };

      window.addEventListener("message", handleMessage);

      return () => {
        console.log("[useEffect:init] Cleanup");
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
      console.log("[useEffect:recompile] ====== START ======");
      console.log("[useEffect:recompile] Triggered by uniforms change");
      console.log(
        "[useEffect:recompile] Current uniforms:",
        dynamicUniforms.map((u) => `${u.name}=${u.value}`).join(", "),
      );

      if (!shaderStateRef.current.gl) {
        console.log("[useEffect:recompile] No GL context yet, skipping");
        return;
      }

      // Use the base shader (not the editor's modified code) to avoid double-injection
      const baseShader = customFragmentShaderRef.current || FRAGMENT_SHADER;
      console.log(
        "[useEffect:recompile] Base shader source length:",
        baseShader.length,
      );
      console.log(
        "[useEffect:recompile] Base shader first 200 chars:",
        baseShader.substring(0, 200),
      );

      // Inject uniforms into the base shader for the editor display
      console.log(
        "[useEffect:recompile] Calling injectUniforms for editor display...",
      );
      const injectedCode = injectUniforms(baseShader);
      console.log(
        "[useEffect:recompile] Injected code length:",
        injectedCode.length,
      );

      // Recompile with the injected code
      console.log("[useEffect:recompile] Calling handleRecompileShader...");
      if (handleRecompileShader(baseShader)) {
        // Update editor to show the injected uniforms
        console.log(
          "[useEffect:recompile] Recompile succeeded, updating editor",
        );
        setShaderCode(injectedCode);
      } else {
        console.error("[useEffect:recompile] Recompile failed");
      }
      console.log("[useEffect:recompile] ====== END ======");
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
      <h2 className="text-lg font-semibold text-white mb-2 text-center">
        Shader Studio
      </h2>

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
          onAdvancedEditorClick={() => setIsModalOpen(true)}
          dynamicUniforms={dynamicUniforms}
          onAddUniform={() => setIsConfigModalOpen(true)}
          onUpdateUniform={updateUniform}
          onRemoveUniform={removeUniform}
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
        onClearError={() => setShaderError("")}
      />

      <UniformConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onAdd={addUniform}
      />
    </div>
  );
};

export default App;
