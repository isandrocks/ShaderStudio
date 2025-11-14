import './styles.css';

// Shader sources
const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform vec2 iResolution;
  uniform float iTime;
  uniform float uSpeed;
  uniform float uLineCount;
  uniform float uAmplitude;
  uniform float uYOffset;
  
  const float MAX_LINES = 20.0;
  
  float wave(vec2 uv, float speed, float yPos, float thickness, float softness) {
    float falloff = smoothstep(1., 0.5, abs(uv.x));
    float y = falloff * sin(iTime * speed + uv.x * 10.0) * yPos - uYOffset;
    return 1.0 - smoothstep(thickness, thickness + softness + falloff * 0.0, abs(uv.y - y));
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.y;
    vec4 col = vec4(0.0, 0.0, 0.0, 1.0);
    
    vec3 gradCol1 = vec3(0.2, 0.1, 0.0);
    vec3 gradCol2 = vec3(0.2, 0.0, 0.2);
    col.xyz = mix(gradCol1, gradCol2, uv.x + uv.y);
    
    uv -= 0.5;
    
    const vec3 col1 = vec3(0.2, 0.5, 0.9);
    const vec3 col2 = vec3(0.9, 0.3, 0.9);
    float aaDy = iResolution.y * 0.000005;
    
    for (float i = 0.; i < MAX_LINES; i += 1.) {
      if (i <= uLineCount) {
        float t = i / (uLineCount - 1.0);
        vec3 lineCol = mix(col1, col2, t);
        float bokeh = pow(t, 3.0);
        float thickness = 0.003;
        float softness = aaDy + bokeh * 0.2;
        float amp = uAmplitude - 0.05 * t;
        float amt = max(0.0, pow(1.0 - bokeh, 2.0) * 0.9);
        col.xyz += wave(uv, uSpeed * (1.0 + t), uAmplitude, thickness, softness) * lineCol * amt;
      }
    }
    
    gl_FragColor = col;
  }
`;

// Global state
interface ShaderState {
  gl: WebGLRenderingContext | null;
  program: WebGLProgram | null;
  canvas: HTMLCanvasElement | null;
  uniforms: {
    position?: number;
    resolution?: WebGLUniformLocation | null;
    time?: WebGLUniformLocation | null;
    speed?: WebGLUniformLocation | null;
    lineCount?: WebGLUniformLocation | null;
    amplitude?: WebGLUniformLocation | null;
    yOffset?: WebGLUniformLocation | null;
  };
  startTime: number;
  params: {
    speed: number;
    lineCount: number;
    amplitude: number;
    yOffset: number;
    paused: boolean;
    pausedTime: number;
  };
  customFragmentShader: string | null;
}

const state: ShaderState = {
  gl: null,
  program: null,
  canvas: null,
  uniforms: {},
  startTime: Date.now(),
  params: {
    speed: 1.0,
    lineCount: 10.0,
    amplitude: 0.2,
    yOffset: 0.0,
    paused: false,
    pausedTime: 0.0,
  },
  customFragmentShader: null,
};

const DEFAULT_FRAGMENT_SHADER = FRAGMENT_SHADER;

// Helper functions
function sendError(message: string): void {
  parent.postMessage(
    { pluginMessage: { type: "shader-error", error: message } },
    "*"
  );
}

function getCurrentTime(): number {
  return state.params.paused
    ? state.params.pausedTime
    : (Date.now() - state.startTime) / 1000.0;
}

function createShader(type: number, source: string): WebGLShader | null {
  if (!state.gl) return null;
  
  const shader = state.gl.createShader(type);
  if (!shader) return null;
  
  state.gl.shaderSource(shader, source);
  state.gl.compileShader(shader);

  if (!state.gl.getShaderParameter(shader, state.gl.COMPILE_STATUS)) {
    console.error("Shader error:", state.gl.getShaderInfoLog(shader));
    state.gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function initWebGL(): boolean {
  state.canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
  if (!state.canvas) {
    sendError("Canvas not found");
    return false;
  }
  
  state.gl = state.canvas.getContext("webgl");

  if (!state.gl) {
    sendError("WebGL not supported");
    return false;
  }

  const vertexShader = createShader(state.gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShaderSource = state.customFragmentShader || FRAGMENT_SHADER;
  const fragmentShader = createShader(
    state.gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  if (!vertexShader || !fragmentShader) {
    sendError("Failed to create shaders");
    return false;
  }

  state.program = state.gl.createProgram();
  if (!state.program) {
    sendError("Failed to create program");
    return false;
  }
  
  state.gl.attachShader(state.program, vertexShader);
  state.gl.attachShader(state.program, fragmentShader);
  state.gl.linkProgram(state.program);

  if (!state.gl.getProgramParameter(state.program, state.gl.LINK_STATUS)) {
    console.error(
      "Program error:",
      state.gl.getProgramInfoLog(state.program)
    );
    sendError("Failed to create shader program");
    return false;
  }

  // Setup geometry
  const positionBuffer = state.gl.createBuffer();
  state.gl.bindBuffer(state.gl.ARRAY_BUFFER, positionBuffer);
  state.gl.bufferData(
    state.gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    state.gl.STATIC_DRAW
  );

  // Get uniform locations
  state.uniforms = {
    position: state.gl.getAttribLocation(state.program, "a_position"),
    resolution: state.gl.getUniformLocation(state.program, "iResolution"),
    time: state.gl.getUniformLocation(state.program, "iTime"),
    speed: state.gl.getUniformLocation(state.program, "uSpeed"),
    lineCount: state.gl.getUniformLocation(state.program, "uLineCount"),
    amplitude: state.gl.getUniformLocation(state.program, "uAmplitude"),
    yOffset: state.gl.getUniformLocation(state.program, "uYOffset"),
  };

  return true;
}

function renderShader(): void {
  if (!state.gl || !state.program || !state.canvas) return;

  state.gl.useProgram(state.program);
  
  if (state.uniforms.position !== undefined) {
    state.gl.enableVertexAttribArray(state.uniforms.position);
    state.gl.vertexAttribPointer(
      state.uniforms.position,
      2,
      state.gl.FLOAT,
      false,
      0,
      0
    );
  }

  // Set uniforms
  if (state.uniforms.resolution) {
    state.gl.uniform2f(
      state.uniforms.resolution,
      state.canvas.width,
      state.canvas.height
    );
  }
  if (state.uniforms.time) {
    state.gl.uniform1f(state.uniforms.time, getCurrentTime());
  }
  if (state.uniforms.speed) {
    state.gl.uniform1f(state.uniforms.speed, state.params.speed);
  }
  if (state.uniforms.lineCount) {
    state.gl.uniform1f(state.uniforms.lineCount, state.params.lineCount);
  }
  if (state.uniforms.amplitude) {
    state.gl.uniform1f(state.uniforms.amplitude, state.params.amplitude);
  }
  if (state.uniforms.yOffset) {
    state.gl.uniform1f(state.uniforms.yOffset, state.params.yOffset);
  }

  state.gl.clearColor(0, 0, 0, 1);
  state.gl.clear(state.gl.COLOR_BUFFER_BIT);
  state.gl.drawArrays(state.gl.TRIANGLE_STRIP, 0, 4);
}

function renderLoop(): void {
  renderShader();
  requestAnimationFrame(renderLoop);
}

function captureShader(): void {
  if (!state.gl || !state.canvas) {
    sendError("WebGL context not available");
    return;
  }

  try {
    renderShader();

    state.canvas.toBlob((blob) => {
      if (!blob) {
        sendError("Failed to create image blob");
        return;
      }

      blob
        .arrayBuffer()
        .then((buffer) => {
          parent.postMessage(
            {
              pluginMessage: {
                type: "shader-rendered",
                imageData: new Uint8Array(buffer),
              },
            },
            "*"
          );
        })
        .catch((error) => {
          sendError("Error converting image: " + error.message);
        });
    }, "image/png");
  } catch (error) {
    sendError("Error capturing pixels: " + (error as Error).message);
  }
}

function recompileShader(): boolean {
  const shaderEditor = document.getElementById("shaderEditor") as HTMLTextAreaElement;
  const errorDiv = document.getElementById("shaderError") as HTMLDivElement;
  
  if (!shaderEditor || !errorDiv || !state.gl) return false;

  const shaderSource = shaderEditor.value;

  // Clear previous error
  errorDiv.classList.remove("show");
  errorDiv.textContent = "";

  try {
    // Try to compile the new shader
    const testFragmentShader = createShader(
      state.gl.FRAGMENT_SHADER,
      shaderSource
    );

    if (!testFragmentShader) {
      const log = state.gl.getShaderInfoLog(
        state.gl.createShader(state.gl.FRAGMENT_SHADER)!
      );
      throw new Error(log || "Shader compilation failed");
    }

    // Create new program
    const vertexShader = createShader(state.gl.VERTEX_SHADER, VERTEX_SHADER);
    if (!vertexShader) {
      throw new Error("Failed to create vertex shader");
    }
    
    const newProgram = state.gl.createProgram();
    if (!newProgram) {
      throw new Error("Failed to create program");
    }
    
    state.gl.attachShader(newProgram, vertexShader);
    state.gl.attachShader(newProgram, testFragmentShader);
    state.gl.linkProgram(newProgram);

    if (!state.gl.getProgramParameter(newProgram, state.gl.LINK_STATUS)) {
      const log = state.gl.getProgramInfoLog(newProgram);
      throw new Error(log || "Program linking failed");
    }

    // Success! Update the program
    if (state.program) {
      state.gl.deleteProgram(state.program);
    }

    state.program = newProgram;
    state.customFragmentShader = shaderSource;

    // Re-get uniform locations
    state.uniforms = {
      position: state.gl.getAttribLocation(state.program, "a_position"),
      resolution: state.gl.getUniformLocation(state.program, "iResolution"),
      time: state.gl.getUniformLocation(state.program, "iTime"),
      speed: state.gl.getUniformLocation(state.program, "uSpeed"),
      lineCount: state.gl.getUniformLocation(state.program, "uLineCount"),
      amplitude: state.gl.getUniformLocation(state.program, "uAmplitude"),
      yOffset: state.gl.getUniformLocation(state.program, "uYOffset"),
    };

    // Setup geometry buffer again
    const positionBuffer = state.gl.createBuffer();
    state.gl.bindBuffer(state.gl.ARRAY_BUFFER, positionBuffer);
    state.gl.bufferData(
      state.gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      state.gl.STATIC_DRAW
    );

    return true;
  } catch (error) {
    errorDiv.textContent = "Shader Error: " + (error as Error).message;
    errorDiv.classList.add("show");
    return false;
  }
}

// UI Event handlers
function setupControls(): void {
  // Initialize shader editor with current shader
  const shaderEditor = document.getElementById("shaderEditor") as HTMLTextAreaElement;
  if (shaderEditor) {
    shaderEditor.value = DEFAULT_FRAGMENT_SHADER;
  }

  // Modal controls
  const modal = document.getElementById("shaderModal");
  const openShaderEditorBtn = document.getElementById("openShaderEditor");
  const closeModalBtn = document.getElementById("closeModal");

  if (openShaderEditorBtn && modal && shaderEditor) {
    openShaderEditorBtn.addEventListener("click", () => {
      modal.classList.add("open");
      // Update textarea with current shader (in case it was modified)
      const currentShader =
        state.customFragmentShader || DEFAULT_FRAGMENT_SHADER;
      shaderEditor.value = currentShader;
    });
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", () => {
      modal.classList.remove("open");
    });
  }

  // Close modal when clicking outside
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("open");
      }
    });
  }

  // Shader editor buttons
  const reloadShaderBtn = document.getElementById("reloadShader");
  const resetShaderBtn = document.getElementById("resetShader");
  const shaderError = document.getElementById("shaderError");

  if (reloadShaderBtn) {
    reloadShaderBtn.addEventListener("click", () => {
      if (recompileShader() && shaderError) {
        // Clear error on success
        shaderError.classList.remove("show");
      }
    });
  }

  if (resetShaderBtn && shaderEditor) {
    resetShaderBtn.addEventListener("click", () => {
      shaderEditor.value = DEFAULT_FRAGMENT_SHADER;
      state.customFragmentShader = null;
      recompileShader();
    });
  }

  const controls = [
    { id: "speed", key: "speed" as const, format: (v: number) => v.toFixed(1) },
    { id: "lineCount", key: "lineCount" as const, format: (v: number) => Math.round(v).toString() },
    { id: "amplitude", key: "amplitude" as const, format: (v: number) => v.toFixed(2) },
    { id: "yOffset", key: "yOffset" as const, format: (v: number) => v.toFixed(2) },
  ];

  controls.forEach(({ id, key, format }) => {
    const input = document.getElementById(id) as HTMLInputElement;
    const valueSpan = document.getElementById(`${id}-value`);
    
    if (input && valueSpan) {
      input.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        state.params[key] = parseFloat(target.value);
        valueSpan.textContent = format(state.params[key]);
      });
    }
  });

  const pauseTimeCheckbox = document.getElementById("pauseTime") as HTMLInputElement;
  if (pauseTimeCheckbox) {
    pauseTimeCheckbox.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.checked) {
        // Pausing: capture current time
        state.params.pausedTime = (Date.now() - state.startTime) / 1000.0;
        state.params.paused = true;
      } else {
        // Unpausing: adjust startTime to continue from where we paused
        state.startTime = Date.now() - state.params.pausedTime * 1000;
        state.params.paused = false;
      }
    });
  }

  const createBtn = document.getElementById("create");
  if (createBtn) {
    createBtn.onclick = () => {
      parent.postMessage({ pluginMessage: { type: "create-rectangle" } }, "*");
    };
  }

  const cancelBtn = document.getElementById("cancel");
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
    };
  }
}

// Message handler
onmessage = (event) => {
  if (event.data.pluginMessage?.type === "render-shader") {
    captureShader();
  }
};

// Initialize
if (initWebGL()) {
  setupControls();
  renderLoop();
} else {
  console.error("Failed to initialize WebGL");
}
