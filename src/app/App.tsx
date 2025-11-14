import React, { useRef, useEffect, useState } from "react";
import ControlPanel from "./components/ControlPanel";
import ShaderCanvas from "./components/ShaderCanvas";
import ShaderModal from "./components/ShaderModal";
import { VERTEX_SHADER, FRAGMENT_SHADER } from "./shaders";

interface ShaderState {
  gl: WebGLRenderingContext | null;
  program: WebGLProgram | null;
  uniforms: {
    position?: number;
    resolution?: WebGLUniformLocation | null;
    time?: WebGLUniformLocation | null;
    speed?: WebGLUniformLocation | null;
    lineCount?: WebGLUniformLocation | null;
    amplitude?: WebGLUniformLocation | null;
    yOffset?: WebGLUniformLocation | null;
  };
}

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

  const createShader = (type: number, source: string): WebGLShader | null => {
    const gl = shaderStateRef.current.gl;
    if (!gl) return null;

    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const errorLog = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      parent.postMessage(
        { pluginMessage: { type: "shader-error", error: errorLog } },
        "*",
      );
      return null;
    }
    return shader;
  };

  const initWebGL = (): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext("webgl");
    if (!gl) return false;

    shaderStateRef.current.gl = gl;

    const vertexShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShaderSource =
      customFragmentShaderRef.current || FRAGMENT_SHADER;
    const fragmentShader = createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );

    if (!vertexShader || !fragmentShader) return false;

    const program = gl.createProgram();
    if (!program) return false;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const errorLog = gl.getProgramInfoLog(program);
      parent.postMessage(
        { pluginMessage: { type: "shader-error", error: errorLog } },
        "*",
      );
      return false;
    }

    shaderStateRef.current.program = program;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    shaderStateRef.current.uniforms = {
      position: gl.getAttribLocation(program, "a_position"),
      resolution: gl.getUniformLocation(program, "iResolution"),
      time: gl.getUniformLocation(program, "iTime"),
      speed: gl.getUniformLocation(program, "uSpeed"),
      lineCount: gl.getUniformLocation(program, "uLineCount"),
      amplitude: gl.getUniformLocation(program, "uAmplitude"),
      yOffset: gl.getUniformLocation(program, "uYOffset"),
    };

    return true;
  };

  const getCurrentTime = (): number => {
    return paramsRef.current.paused
      ? paramsRef.current.pausedTime
      : (Date.now() - startTimeRef.current) / 1000.0;
  };

  const renderShader = () => {
    const { gl, program, uniforms } = shaderStateRef.current;
    const canvas = canvasRef.current;
    if (!gl || !program || !canvas) return;

    gl.useProgram(program);

    if (uniforms.position !== undefined) {
      gl.enableVertexAttribArray(uniforms.position);
      gl.vertexAttribPointer(uniforms.position, 2, gl.FLOAT, false, 0, 0);
    }

    if (uniforms.resolution) {
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    }
    if (uniforms.time) {
      gl.uniform1f(uniforms.time, getCurrentTime());
    }
    if (uniforms.speed) {
      gl.uniform1f(uniforms.speed, paramsRef.current.speed);
    }
    if (uniforms.lineCount) {
      gl.uniform1f(uniforms.lineCount, paramsRef.current.lineCount);
    }
    if (uniforms.amplitude) {
      gl.uniform1f(uniforms.amplitude, paramsRef.current.amplitude);
    }
    if (uniforms.yOffset) {
      gl.uniform1f(uniforms.yOffset, paramsRef.current.yOffset);
    }

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const renderLoop = () => {
    renderShader();
    animationFrameRef.current = requestAnimationFrame(renderLoop);
  };

  const captureShader = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderShader();

    canvas.toBlob((blob) => {
      if (!blob) return;

      blob.arrayBuffer().then((buffer) => {
        parent.postMessage(
          {
            pluginMessage: {
              type: "shader-rendered",
              imageData: new Uint8Array(buffer),
            },
          },
          "*",
        );
      });
    }, "image/png");
  };

  const recompileShader = (newShaderCode: string): boolean => {
    const gl = shaderStateRef.current.gl;
    if (!gl) return false;

    setShaderError("");

    try {
      const testFragmentShader = createShader(
        gl.FRAGMENT_SHADER,
        newShaderCode,
      );
      if (!testFragmentShader) {
        throw new Error("Shader compilation failed");
      }

      const vertexShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
      if (!vertexShader) {
        throw new Error("Failed to create vertex shader");
      }

      const newProgram = gl.createProgram();
      if (!newProgram) {
        throw new Error("Failed to create program");
      }

      gl.attachShader(newProgram, vertexShader);
      gl.attachShader(newProgram, testFragmentShader);
      gl.linkProgram(newProgram);

      if (!gl.getProgramParameter(newProgram, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(newProgram);
        throw new Error(log || "Program linking failed");
      }

      if (shaderStateRef.current.program) {
        gl.deleteProgram(shaderStateRef.current.program);
      }

      shaderStateRef.current.program = newProgram;
      customFragmentShaderRef.current = newShaderCode;

      shaderStateRef.current.uniforms = {
        position: gl.getAttribLocation(newProgram, "a_position"),
        resolution: gl.getUniformLocation(newProgram, "iResolution"),
        time: gl.getUniformLocation(newProgram, "iTime"),
        speed: gl.getUniformLocation(newProgram, "uSpeed"),
        lineCount: gl.getUniformLocation(newProgram, "uLineCount"),
        amplitude: gl.getUniformLocation(newProgram, "uAmplitude"),
        yOffset: gl.getUniformLocation(newProgram, "uYOffset"),
      };

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW,
      );

      return true;
    } catch (error) {
      setShaderError("Shader Error: " + (error as Error).message);
      return false;
    }
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
    if (recompileShader(shaderCode)) {
      setShaderError("");
    }
  };

  const handleResetShader = () => {
    setShaderCode(FRAGMENT_SHADER);
    customFragmentShaderRef.current = null;
    recompileShader(FRAGMENT_SHADER);
  };

  // Keep paramsRef in sync with params
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    if (initWebGL()) {
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
        items-center gap-4"
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
