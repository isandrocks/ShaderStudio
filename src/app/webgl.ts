import { VERTEX_SHADER } from "./shaders";

export interface ShaderState {
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
  // Cache of dynamic uniform locations, keyed by uniform name
  dynamicUniforms?: Record<string, WebGLUniformLocation | null>;
}

export interface ShaderParams {
  paused: boolean;
  pausedTime: number;
}

export interface DynamicUniform {
  id: string;
  name: string; // GLSL uniform identifier, e.g. "uParam1"
  value: number;
  min: number;
  max: number;
  step: number;
}

// Prepend uniform float declarations for each dynamic uniform to the fragment shader source
export const buildFragmentSource = (
  baseSource: string,
  dynamicUniforms: DynamicUniform[] | undefined,
): string => {
  try {
    if (!dynamicUniforms || dynamicUniforms.length === 0) {
      return baseSource;
    }

    const precisionMatch = baseSource.match(/precision\s+\w+\s+float;/);
    if (!precisionMatch) {
      console.error("[buildFragmentSource] No precision statement found");
      return baseSource;
    }

    const filteredUniforms = dynamicUniforms.filter((u) => {
      const uniformPattern = new RegExp(`uniform\\s+float\\s+${u.name}\\s*;`);
      return !uniformPattern.test(baseSource);
    });

    if (filteredUniforms.length === 0) {
      return baseSource;
    }

    const insertPos = precisionMatch.index! + precisionMatch[0].length;
    const decls = filteredUniforms
      .map((u) => `\n  uniform float ${u.name};`)
      .join("");

    return baseSource.slice(0, insertPos) + decls + baseSource.slice(insertPos);
  } catch (error) {
    console.error("[buildFragmentSource] Error:", error);
    console.error("[buildFragmentSource] Stack:", (error as Error).stack);
    return baseSource;
  }
};

export const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string,
  onError: (error: string | null) => void,
): WebGLShader | null => {
  const shaderType = type === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT";

  const shader = gl.createShader(type);
  if (!shader) {
    console.error(`[createShader] Failed to create ${shaderType} shader`);
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const errorLog = gl.getShaderInfoLog(shader);
    console.error(
      `[createShader] ${shaderType} shader compilation failed:`,
      errorLog,
    );
    gl.deleteShader(shader);
    onError(`${shaderType} Shader: ${errorLog}`);
    return null;
  }
  return shader;
};

export const initWebGL = (
  canvas: HTMLCanvasElement,
  shaderState: React.MutableRefObject<ShaderState>,
  customFragmentShader: string,
  onError: (error: string | null) => void,
): boolean => {
  const gl = canvas.getContext("webgl");
  if (!gl) return false;

  shaderState.current.gl = gl;

  const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    VERTEX_SHADER,
    onError,
  );
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    customFragmentShader,
    onError,
  );

  if (!vertexShader || !fragmentShader) return false;

  const program = gl.createProgram();
  if (!program) return false;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const errorLog = gl.getProgramInfoLog(program);
    onError(errorLog);
    return false;
  }

  shaderState.current.program = program;

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );

  shaderState.current.uniforms = {
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

export const renderShader = (
  canvas: HTMLCanvasElement,
  shaderState: ShaderState,
  params: ShaderParams & { dynamicUniforms?: DynamicUniform[] },
  currentTime: number,
): void => {
  const { gl, program, uniforms } = shaderState;
  if (!gl || !program) return;

  gl.useProgram(program);

  if (uniforms.position !== undefined) {
    gl.enableVertexAttribArray(uniforms.position);
    gl.vertexAttribPointer(uniforms.position, 2, gl.FLOAT, false, 0, 0);
  }

  if (uniforms.resolution) {
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
  }
  if (uniforms.time) {
    gl.uniform1f(uniforms.time, currentTime);
  }

  // Apply all dynamic uniforms (including base ones like uSpeed, uLineCount, etc.)
  if (params.dynamicUniforms && params.dynamicUniforms.length > 0) {
    if (!shaderState.dynamicUniforms) shaderState.dynamicUniforms = {};
    for (const u of params.dynamicUniforms) {
      if (!(u.name in shaderState.dynamicUniforms)) {
        shaderState.dynamicUniforms[u.name] = gl.getUniformLocation(
          program,
          u.name,
        );
      }
      const loc = shaderState.dynamicUniforms[u.name];
      if (loc) gl.uniform1f(loc, u.value);
    }
  }

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

export const captureShaderAsImage = (
  canvas: HTMLCanvasElement,
  shaderState: ShaderState,
  params: ShaderParams & { dynamicUniforms?: DynamicUniform[] },
  currentTime: number,
  onCapture: (imageData: Uint8Array) => void,
): void => {
  renderShader(canvas, shaderState, params, currentTime);

  canvas.toBlob((blob) => {
    if (!blob) return;

    blob.arrayBuffer().then((buffer) => {
      onCapture(new Uint8Array(buffer));
    });
  }, "image/png");
};

export const recompileShader = (
  gl: WebGLRenderingContext,
  shaderState: React.MutableRefObject<ShaderState>,
  newShaderCode: string,
  onError: (error: string | null) => void,
): boolean => {
  try {
    const testFragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      newShaderCode,
      onError,
    );
    if (!testFragmentShader) {
      throw new Error("Shader compilation failed");
    }

    const vertexShader = createShader(
      gl,
      gl.VERTEX_SHADER,
      VERTEX_SHADER,
      onError,
    );
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

    if (shaderState.current.program) {
      gl.deleteProgram(shaderState.current.program);
    }

    shaderState.current.program = newProgram;

    shaderState.current.uniforms = {
      position: gl.getAttribLocation(newProgram, "a_position"),
      resolution: gl.getUniformLocation(newProgram, "iResolution"),
      time: gl.getUniformLocation(newProgram, "iTime"),
      speed: gl.getUniformLocation(newProgram, "uSpeed"),
      lineCount: gl.getUniformLocation(newProgram, "uLineCount"),
      amplitude: gl.getUniformLocation(newProgram, "uAmplitude"),
      yOffset: gl.getUniformLocation(newProgram, "uYOffset"),
    };

    // Reset dynamic uniform cache after recompile
    shaderState.current.dynamicUniforms = {};

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    return true;
  } catch (error) {
    onError((error as Error).message);
    return false;
  }
};
