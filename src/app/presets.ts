import { DynamicUniform } from "./types";
import { PRESET_THUMBNAILS } from "./generated/preset-thumbnails";

export type ShaderCategory = "waves" | "noise" | "patterns" | "effects";

export interface ShaderPreset {
  id: string;
  name: string;
  description: string;
  category: ShaderCategory;
  fragmentShader: string;
  defaultUniforms: DynamicUniform[];
  thumbnail?: string; // Base64 or data URL for preview image
}

export const SHADER_PRESETS: ShaderPreset[] = [
  {
    id: "multi-wave",
    name: "Multi Wave",
    description:
      "Multiple sine waves with gradient colors and adjustable parameters",
    category: "waves",
    thumbnail: PRESET_THUMBNAILS["multi-wave"],
    fragmentShader: `precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uLineCount;
uniform float uAmplitude;
uniform float uYOffset;
uniform vec3 uBgColor1;
uniform vec3 uBgColor2;
uniform vec3 uWaveColor1;
uniform vec3 uWaveColor2;

const float MAX_LINES = 20.0;

float wave(vec2 uv, float speed, float yPos, float thickness, float softness) {
  float falloff = smoothstep(1., 0.5, abs(uv.x));
  float y = falloff * sin(iTime * speed + uv.x * 10.0) * yPos - uYOffset;
  return 1.0 - smoothstep(thickness, thickness + softness + falloff * 0.0, abs(uv.y - y));
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.y;
  vec4 col = vec4(0.0, 0.0, 0.0, 1.0);
  
  // Background gradient using color uniforms
  col.xyz = mix(uBgColor1, uBgColor2, uv.x + uv.y);
  vec2 uvwave = uv;
  uvwave -= 0.5;
  
  float aaDy = iResolution.y * 0.000005;
  
  for (float i = 0.; i < MAX_LINES; i += 1.) {
    if (i <= uLineCount) {
      float t = i / (uLineCount - 1.0);
      vec3 lineCol = mix(uWaveColor1, uWaveColor2, t);
      float bokeh = pow(t, 3.0);
      float thickness = 0.003;
      float softness = aaDy + bokeh * 0.2;
      float amp = uAmplitude - 0.05 * t;
      float amt = max(0.0, pow(1.0 - bokeh, 2.0) * 0.9);
      col.xyz += wave(uvwave, uSpeed * (1.0 + t), uAmplitude, thickness, softness) * lineCol * amt;
    }
  }
  
  gl_FragColor = col;
}`,
    defaultUniforms: [
      {
        id: "base-speed",
        name: "uSpeed",
        type: "float",
        value: 1.0,
        min: 0,
        max: 3,
        step: 0.1,
      },
      {
        id: "base-lineCount",
        name: "uLineCount",
        type: "float",
        value: 10.0,
        min: 1,
        max: 20,
        step: 1,
      },
      {
        id: "base-amplitude",
        name: "uAmplitude",
        type: "float",
        value: 0.2,
        min: 0,
        max: 0.5,
        step: 0.01,
      },
      {
        id: "base-yOffset",
        name: "uYOffset",
        type: "float",
        value: 0.0,
        min: -0.5,
        max: 0.5,
        step: 0.01,
      },
      {
        id: "base-bgColor1",
        name: "uBgColor1",
        type: "vec3",
        value: [0.1, 0.1, 0.1],
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        id: "base-bgColor2",
        name: "uBgColor2",
        type: "vec3",
        value: [0.01, 0.01, 0.01],
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        id: "base-waveColor1",
        name: "uWaveColor1",
        type: "vec3",
        value: [0.9, 0.9, 0.9],
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        id: "base-waveColor2",
        name: "uWaveColor2",
        type: "vec3",
        value: [0.2, 0.2, 0.2],
        min: 0,
        max: 1,
        step: 0.01,
      },
    ],
  },
      {
    id: "blank",
    name: "Blank Shader",
    description: "A blank shader with no effects",
    category: "effects",
    thumbnail: PRESET_THUMBNAILS["blank"],
    fragmentShader: `precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uColor1;
uniform float uFloat1;


void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;

    vec4 col = vec4(uColor1, uFloat1);

    gl_FragColor = col;
}`,
    defaultUniforms: [
      {
        id: "preset-color",
        type: "vec3",
        name: "uColor1",
        value: [0.5, 0.5, 0.5],
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        id: "preset-float1",
        type: "float",
        name: "uFloat1",
        value: 0.5,
        min: 0.1,
        max: 1,
        step: 0.05,
      },
    ],
  },
      {
    id: "satin",
    name: "Satin Shader",
    description: "A smooth satin-like shader",
    category: "waves",
    thumbnail: PRESET_THUMBNAILS["satin"],
    fragmentShader: `precision mediump float;
  uniform vec3 uColor1;
  uniform float uSpeed;
  uniform float uScale;
  uniform vec2 iResolution;
  uniform float iTime; 

void main() {
  vec2 st = gl_FragCoord.xy/iResolution.xy;
  float mr = min(iResolution.x, iResolution.y);
  vec2 uv = (st.xy * 2.0 - 1.0) * iResolution.xy / mr;
  uv *= (1.0-uScale) * 2.;
  float d = -iTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += iTime * 0.5 * uSpeed;
  vec3 color_v1 = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  color_v1 = cos(color_v1 * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor1;
  vec4 col = vec4(color_v1, 1.0);

    gl_FragColor = col;
}`,
    defaultUniforms: [
      {
        id: "preset-color",
        type: "vec3",
        name: "uColor1",
        value: [0.58, 0.01, 0.0],
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        id: "preset-speed",
        type: "float",
        name: "uSpeed",
        value: 0.5,
        min: 0.1,
        max: 1,
        step: 0.05,
      },
      {
        id: "preset-scale",
        type: "float",
        name: "uScale",
        value: 0.5,
        min: 0.1,
        max: 1,
        step: 0.05,
      }
    ],
  },
  {
    id: "simple-wave",
    name: "Simple Wave",
    description: "Single sine wave with adjustable properties",
    category: "waves",
    thumbnail: PRESET_THUMBNAILS["simple-wave"],
    fragmentShader: `precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uThickness;

void main() {
    vec4 col = vec4(0.0);
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    
    float wave = 0.5 + uAmplitude * sin(uv.x * 6.28318 * 3.0 + iTime * uSpeed);
    float dist = abs(uv.y - wave);
    float line = smoothstep(uThickness, uThickness * 0.5, dist);
    
    vec3 bgColor = vec3(0.1, 0.1, 0.15);
    vec3 waveColor = vec3(0.2, 0.6, 1.0);
    vec3 color = mix(bgColor, waveColor, line);

    col = vec4(color, 1.0);

    gl_FragColor = col;
}`,
    defaultUniforms: [
      {
        id: "preset-speed",
        type: "float",
        name: "uSpeed",
        value: 1.0,
        min: 0,
        max: 5,
        step: 0.1,
      },
      {
        id: "preset-amplitude",
        type: "float",
        name: "uAmplitude",
        value: 0.15,
        min: 0,
        max: 0.4,
        step: 0.01,
      },
      {
        id: "preset-thickness",
        type: "float",
        name: "uThickness",
        value: 0.03,
        min: 0.01,
        max: 0.1,
        step: 0.01,
      },
    ],
  },
  {
    id: "radial-gradient",
    name: "Radial Gradient",
    description: "Smooth radial gradient from center",
    category: "patterns",
    thumbnail: PRESET_THUMBNAILS["radial-gradient"],
    fragmentShader: `precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uRadius;
uniform float uSoftness;
uniform float uPulse;

void main() {
    vec4 col = vec4(0.0);
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 center = vec2(0.5, 0.5);
    
    float dist = distance(uv, center);
    float pulse = uRadius + sin(iTime * uPulse) * 0.1;
    float gradient = smoothstep(pulse, pulse - uSoftness, dist);
    
    vec3 color1 = vec3(0.1, 0.2, 0.5);
    vec3 color2 = vec3(0.9, 0.4, 0.6);
    vec3 color = mix(color1, color2, gradient);

    col = vec4(color, 1.0);

    gl_FragColor = col;
}`,
    defaultUniforms: [
      {
        id: "preset-radius",
        type: "float",
        name: "uRadius",
        value: 0.5,
        min: 0.1,
        max: 1.0,
        step: 0.01,
      },
      {
        id: "preset-softness",
        type: "float",
        name: "uSoftness",
        value: 0.3,
        min: 0.1,
        max: 1.0,
        step: 0.01,
      },
      {
        id: "preset-pulse",
        type: "float",
        name: "uPulse",
        value: 1.0,
        min: 0,
        max: 3,
        step: 0.1,
      },
    ],
  },
  {
    id: "grid-pattern",
    name: "Grid Pattern",
    description: "Animated grid with adjustable cell size",
    category: "patterns",
    thumbnail: PRESET_THUMBNAILS["grid-pattern"],
    fragmentShader: `precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uGridSize;
uniform float uLineWidth;
uniform float uGlow;

void main() {
    vec4 col = vec4(0.0);
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    
    vec2 grid = fract(uv * uGridSize);
    float line = min(
        smoothstep(uLineWidth, 0.0, grid.x),
        smoothstep(uLineWidth, 0.0, grid.y)
    );
    
    float pulse = sin(iTime * 2.0) * 0.5 + 0.5;
    vec3 bgColor = vec3(0.05, 0.05, 0.1);
    vec3 gridColor = vec3(0.2, 0.6, 1.0) * (1.0 + pulse * uGlow);
    
    vec3 color = mix(bgColor, gridColor, line);

    col = vec4(color, 1.0);

    gl_FragColor = col;
}`,
    defaultUniforms: [
      {
        id: "preset-gridSize",
        type: "float",
        name: "uGridSize",
        value: 10.0,
        min: 2,
        max: 50,
        step: 1,
      },
      {
        id: "preset-lineWidth",
        type: "float",
        name: "uLineWidth",
        value: 0.05,
        min: 0.01,
        max: 0.2,
        step: 0.01,
      },
      {
        id: "preset-glow",
        type: "float",
        name: "uGlow",
        value: 0.5,
        min: 0,
        max: 2,
        step: 0.1,
      },
    ],
  },
  {
    id: "plasma",
    name: "Plasma Effect",
    description: "Colorful plasma with sine wave interference",
    category: "effects",
    thumbnail: PRESET_THUMBNAILS["plasma"],
    fragmentShader: `precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uScale;
uniform float uIntensity;

void main() {
    vec4 col = vec4(0.0);
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    
    float time = iTime * uSpeed;
    vec2 pos = uv * uScale;
    
    float v1 = sin(pos.x + time);
    float v2 = sin(pos.y + time);
    float v3 = sin(pos.x + pos.y + time);
    float v4 = sin(sqrt(pos.x * pos.x + pos.y * pos.y) + time);
    
    float plasma = (v1 + v2 + v3 + v4) * 0.25;
    
    vec3 color = vec3(
        sin(plasma * 3.14159 * uIntensity) * 0.5 + 0.5,
        sin(plasma * 3.14159 * uIntensity + 2.0) * 0.5 + 0.5,
        sin(plasma * 3.14159 * uIntensity + 4.0) * 0.5 + 0.5
    );

    col = vec4(color, 1.0);

    gl_FragColor = col;
}`,
    defaultUniforms: [
      {
        id: "preset-speed",
        type: "float",
        name: "uSpeed",
        value: 0.5,
        min: 0,
        max: 2,
        step: 0.1,
      },
      {
        id: "preset-scale",
        type: "float",
        name: "uScale",
        value: 5.0,
        min: 1,
        max: 20,
        step: 0.5,
      },
      {
        id: "preset-intensity",
        type: "float",
        name: "uIntensity",
        value: 2.0,
        min: 0.5,
        max: 5,
        step: 0.1,
      },
    ],
  },
  {
    id: "checkerboard",
    name: "Checkerboard",
    description: "Classic checkerboard pattern with animation",
    category: "patterns",
    thumbnail: PRESET_THUMBNAILS["checkerboard"],
    fragmentShader: `precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSize;
uniform float uRotation;
uniform float uBlend;

void main() {
    vec4 col = vec4(0.0);
    vec2 uv = gl_FragCoord.xy / iResolution.xy - 0.5;
    
    // Rotate
    float angle = iTime * uRotation;
    float s = sin(angle);
    float c = cos(angle);
    uv = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);
    
    vec2 checker = floor(uv * uSize);
    float pattern = mod(checker.x + checker.y, 2.0);
    
    vec3 color1 = vec3(0.1, 0.1, 0.15);
    vec3 color2 = vec3(0.9, 0.9, 0.95);
    vec3 color = mix(color1, color2, pattern);
    
    // Smooth blend
    color = mix(color, vec3(0.5), uBlend);

    col = vec4(color, 1.0);

    gl_FragColor = col;
}`,
    defaultUniforms: [
      {
        id: "preset-size",
        type: "float",
        name: "uSize",
        value: 8.0,
        min: 2,
        max: 32,
        step: 1,
      },
      {
        id: "preset-rotation",
        type: "float",
        name: "uRotation",
        value: 0.1,
        min: 0,
        max: 1,
        step: 0.05,
      },
      {
        id: "preset-blend",
        type: "float",
        name: "uBlend",
        value: 0.0,
        min: 0,
        max: 0.5,
        step: 0.05,
      },
    ],
  },
  {
    id: "ripple",
    name: "Ripple Effect",
    description: "Concentric ripples emanating from center",
    category: "effects",
    thumbnail: PRESET_THUMBNAILS["ripple"],
    fragmentShader: `precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uFrequency;
uniform float uAmplitude;

void main() {
    vec4 col = vec4(0.0);
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 center = vec2(0.5, 0.5);
    
    float dist = distance(uv, center);
    float ripple = sin(dist * uFrequency - iTime * uSpeed) * uAmplitude;
    
    float brightness = 0.5 + ripple;
    vec3 color = vec3(0.2, 0.5, 0.8) * brightness;

    col = vec4(color, 1.0);

    gl_FragColor = col;
}`,
    defaultUniforms: [
      {
        id: "preset-speed",
        type: "float",
        name: "uSpeed",
        value: 3.0,
        min: 0,
        max: 10,
        step: 0.5,
      },
      {
        id: "preset-frequency",
        type: "float",
        name: "uFrequency",
        value: 20.0,
        min: 5,
        max: 50,
        step: 1,
      },
      {
        id: "preset-amplitude",
        type: "float",
        name: "uAmplitude",
        value: 0.5,
        min: 0.1,
        max: 1,
        step: 0.05,
      },
    ],
  },
  {
    id: "noise-static",
    name: "Noise Static",
    description: "Animated noise texture effect",
    category: "noise",
    thumbnail: PRESET_THUMBNAILS["noise-static"],
    fragmentShader: `precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uScale;
uniform float uSpeed;
uniform float uContrast;

// Simple pseudo-random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec4 col = vec4(0.0);
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 pos = uv * uScale + iTime * uSpeed;
    
    float noise = random(floor(pos));
    noise = pow(noise, 1.0 / uContrast);
    
    vec3 color = vec3(noise);

    col = vec4(color, 1.0);

    gl_FragColor = col;
}`,
    defaultUniforms: [
      {
        id: "preset-scale",
        type: "float",
        name: "uScale",
        value: 50.0,
        min: 10,
        max: 200,
        step: 5,
      },
      {
        id: "preset-speed",
        type: "float",
        name: "uSpeed",
        value: 0.5,
        min: 0,
        max: 2,
        step: 0.1,
      },
      {
        id: "preset-contrast",
        type: "float",
        name: "uContrast",
        value: 1.5,
        min: 0.5,
        max: 3,
        step: 0.1,
      },
    ],
  },
  {
    id: "gradient-bars",
    name: "Gradient Bars",
    description: "Horizontal gradient bars with animation",
    category: "patterns",
    thumbnail: PRESET_THUMBNAILS["gradient-bars"],
    fragmentShader: `precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uBars;
uniform float uSpeed;
uniform float uShift;

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    
    float bars = floor(uv.y * uBars);
    float offset = bars * uShift + iTime * uSpeed;
    float gradient = fract(uv.x + offset);
    
    vec3 color = mix(
        vec3(0.2, 0.1, 0.4),
        vec3(0.8, 0.3, 0.6),
        gradient
    );

    vec4 col = vec4(color, 1.0);

    gl_FragColor = col;
}`,
    defaultUniforms: [
      {
        id: "preset-bars",
        type: "float",
        name: "uBars",
        value: 10.0,
        min: 2,
        max: 50,
        step: 1,
      },
      {
        id: "preset-speed",
        type: "float",
        name: "uSpeed",
        value: 0.5,
        min: 0,
        max: 2,
        step: 0.1,
      },
      {
        id: "preset-shift",
        type: "float",
        name: "uShift",
        value: 0.1,
        min: 0,
        max: 1,
        step: 0.05,
      },
    ],
  },
  {
    id: "circle-pulse",
    name: "Circle Pulse",
    description: "Pulsing circle with glow effect",
    category: "effects",
    thumbnail: PRESET_THUMBNAILS["circle-pulse"],
    fragmentShader: `precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSize;
uniform float uPulseSpeed;
uniform float uGlow;

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 center = vec2(0.5, 0.5);
    
    float dist = distance(uv, center);
    float pulse = sin(iTime * uPulseSpeed) * 0.5 + 0.5;
    float radius = uSize * (0.8 + pulse * 0.4);
    
    float circle = smoothstep(radius + 0.02, radius, dist);
    float glow = exp(-dist * uGlow) * pulse;
    
    vec3 color = vec3(0.3, 0.6, 1.0) * (circle + glow * 0.5);

    vec4 col = vec4(color, 1.0);

    gl_FragColor = col;
}`,
    defaultUniforms: [
      {
        id: "preset-size",
        type: "float",
        name: "uSize",
        value: 0.3,
        min: 0.1,
        max: 0.5,
        step: 0.01,
      },
      {
        id: "preset-pulseSpeed",
        type: "float",
        name: "uPulseSpeed",
        value: 2.0,
        min: 0.5,
        max: 5,
        step: 0.1,
      },
      {
        id: "preset-glow",
        type: "float",
        name: "uGlow",
        value: 5.0,
        min: 1,
        max: 15,
        step: 0.5,
      },
    ],
  },
];

// Helper function to get presets by category
export function getPresetsByCategory(category: ShaderCategory): ShaderPreset[] {
  return SHADER_PRESETS.filter((preset) => preset.category === category);
}

// Helper function to get preset by id
export function getPresetById(id: string): ShaderPreset | undefined {
  return SHADER_PRESETS.find((preset) => preset.id === id);
}

// Get all unique categories
export function getCategories(): ShaderCategory[] {
  return ["waves", "noise", "patterns", "effects"];
}
