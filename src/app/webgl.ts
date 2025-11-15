import { VERTEX_SHADER, FRAGMENT_SHADER } from "./shaders";

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
}

export interface ShaderParams {
  speed: number;
  lineCount: number;
  amplitude: number;
  yOffset: number;
  paused: boolean;
  pausedTime: number;
}

export const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string,
  onError: (error: string | null) => void,
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const errorLog = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    onError(errorLog);
    return null;
  }
  return shader;
};

export const initWebGL = (
  canvas: HTMLCanvasElement,
  shaderState: React.MutableRefObject<ShaderState>,
  customFragmentShader: string | null,
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
  const fragmentShaderSource = customFragmentShader || FRAGMENT_SHADER;
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
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
  params: ShaderParams,
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
  if (uniforms.speed) {
    gl.uniform1f(uniforms.speed, params.speed);
  }
  if (uniforms.lineCount) {
    gl.uniform1f(uniforms.lineCount, params.lineCount);
  }
  if (uniforms.amplitude) {
    gl.uniform1f(uniforms.amplitude, params.amplitude);
  }
  if (uniforms.yOffset) {
    gl.uniform1f(uniforms.yOffset, params.yOffset);
  }

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

export const captureShaderAsImage = (
  canvas: HTMLCanvasElement,
  shaderState: ShaderState,
  params: ShaderParams,
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
