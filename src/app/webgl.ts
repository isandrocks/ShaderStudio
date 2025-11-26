import { VERTEX_SHADER } from "./shaders";
import type { ShaderState, ShaderParams, DynamicUniform } from "./types";

// ============================================================================
// Utility Functions for Uniform Injection
// ============================================================================

/**
 * Remove auto-injected uniform declarations from shader code
 * Only removes uniforms that are not marked as base uniforms
 */
export const stripInjectedUniforms = (
  code: string,
  dynamicUniforms: DynamicUniform[],
): string => {
  try {
    let result = code;
    dynamicUniforms
      .filter((u) => !u.id.startsWith("base-"))
      .forEach((u) => {
        const pattern = new RegExp(
          `\\s*uniform\\s+(float|vec2|vec3|vec4)\\s+${u.name}\\s*;`,
          "g",
        );
        result = result.replace(pattern, "");
      });
    return result;
  } catch (error) {
    console.error("[stripInjectedUniforms] Error:", error);
    return code;
  }
};

/**
 * Inject uniform declarations into shader code
 * Only injects uniforms that don't already exist in the code
 */
export const injectUniforms = (
  code: string,
  dynamicUniforms: DynamicUniform[],
): string => {
  try {
    const precisionMatch = code.match(/precision\s+\w+\s+float;/);
    if (!precisionMatch) {
      console.warn("[injectUniforms] No precision statement found");
      return code;
    }

    // Only inject uniforms that don't already exist in the code
    const filteredUniforms = dynamicUniforms
      .filter((u) => !u.id.startsWith("base-"))
      .filter((u) => {
        const uniformPattern = new RegExp(
          `uniform\\s+(float|vec2|vec3|vec4)\\s+${u.name}\\s*;`,
        );
        return !uniformPattern.test(code);
      });

    if (filteredUniforms.length === 0) {
      return code;
    }

    const insertPos = precisionMatch.index! + precisionMatch[0].length;
    const uniformDecls = filteredUniforms
      .map((u) => {
        const uniformType = u.type || "float";
        return `\n  uniform ${uniformType} ${u.name};`;
      })
      .join("");

    return code.slice(0, insertPos) + uniformDecls + code.slice(insertPos);
  } catch (error) {
    console.error("[injectUniforms] Error:", error);
    return code;
  }
};

// ============================================================================
// Shader Source Building
// ============================================================================

/**
 * Build fragment shader source by injecting dynamic uniform declarations
 * This is the primary function for shader compilation - it prepends uniform
 * declarations for each dynamic uniform to the fragment shader source.
 */
export const buildFragmentSource = (
  baseSource: string,
  dynamicUniforms: DynamicUniform[] | undefined,
): string => {
  return injectUniforms(baseSource, dynamicUniforms || []);
};

const createShader = (
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
    const shaderType = type === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT";
    onError(`${shaderType} Shader: ${errorLog}`);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const createProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
  onError: (error: string | null) => void,
): WebGLProgram | null => {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    onError(gl.getProgramInfoLog(program));
    return null;
  }
  return program;
};

const setupGeometry = (gl: WebGLRenderingContext): void => {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
};

export const initWebGL = (
  canvas: HTMLCanvasElement,
  shaderState: React.MutableRefObject<ShaderState>,
  customFragmentShader: string,
  onError: (error: string | null) => void,
): boolean => {
  const gl = canvas.getContext("webgl");
  if (!gl) return false;

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

  const program = createProgram(gl, vertexShader, fragmentShader, onError);
  if (!program) return false;

  setupGeometry(gl);

  shaderState.current = {
    gl,
    program,
    uniforms: {
      position: gl.getAttribLocation(program, "a_position"),
      resolution: gl.getUniformLocation(program, "iResolution"),
      time: gl.getUniformLocation(program, "iTime"),
    },
    dynamicUniforms: {},
  };

  return true;
};

export const renderShader = (
  canvas: HTMLCanvasElement,
  shaderState: ShaderState,
  params: ShaderParams,
  currentTime: number,
): void => {
  const { gl, program, uniforms, dynamicUniforms } = shaderState;
  if (!gl || !program) return;

  gl.useProgram(program);

  // Setup vertex attributes
  if (uniforms.position !== undefined) {
    gl.enableVertexAttribArray(uniforms.position);
    gl.vertexAttribPointer(uniforms.position, 2, gl.FLOAT, false, 0, 0);
  }

  // Set built-in uniforms
  if (uniforms.resolution)
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
  if (uniforms.time) gl.uniform1f(uniforms.time, currentTime);

  // Set dynamic uniforms
  params.dynamicUniforms?.forEach((uniform) => {
    const { name, type, value } = uniform;
    const uniformType = type || "float";

    if (!dynamicUniforms[name]) {
      dynamicUniforms[name] = gl.getUniformLocation(program, name);
    }
    const location = dynamicUniforms[name];
    if (!location) return;

    // Call appropriate uniform function based on type
    if (uniformType === "float") {
      gl.uniform1f(location, value as number);
    } else if (uniformType === "vec2") {
      const [x, y] = value as [number, number];
      gl.uniform2f(location, x, y);
    } else if (uniformType === "vec3") {
      const [r, g, b] = value as [number, number, number];
      gl.uniform3f(location, r, g, b);
    } else if (uniformType === "vec4") {
      const [r, g, b, a] = value as [number, number, number, number];
      gl.uniform4f(location, r, g, b, a);
    }
  });

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
    blob.arrayBuffer().then((buffer) => onCapture(new Uint8Array(buffer)));
  }, "image/png");
};

export const recompileShader = (
  gl: WebGLRenderingContext,
  shaderState: React.MutableRefObject<ShaderState>,
  newShaderCode: string,
  onError: (error: string | null) => void,
): boolean => {
  const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    VERTEX_SHADER,
    onError,
  );
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    newShaderCode,
    onError,
  );
  if (!vertexShader || !fragmentShader) return false;

  const newProgram = createProgram(gl, vertexShader, fragmentShader, onError);
  if (!newProgram) return false;

  if (shaderState.current.program) {
    gl.deleteProgram(shaderState.current.program);
  }

  setupGeometry(gl);

  shaderState.current.program = newProgram;
  shaderState.current.uniforms = {
    position: gl.getAttribLocation(newProgram, "a_position"),
    resolution: gl.getUniformLocation(newProgram, "iResolution"),
    time: gl.getUniformLocation(newProgram, "iTime"),
  };
  shaderState.current.dynamicUniforms = {};

  return true;
};
