import { DynamicUniform } from "./webgl";
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
    description: "Multiple sine waves with phase offset creating a flowing effect",
    category: "waves",
    thumbnail: PRESET_THUMBNAILS["multi-wave"],
    fragmentShader: `precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uLineCount;
uniform float uAmplitude;
uniform float uYOffset;

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;

    float x = uv.x;
    float y = uv.y;

    // Dark gray/black background
    vec3 bgColor = vec3(0.05, 0.05, 0.05);
    vec3 color = bgColor;

    // Create multiple sine waves, each one tick out of phase
    float lineWidth = 0.02;
    
    for (float i = 0.0; i < 20.0; i += 1.0) {
        if (i >= uLineCount) break;
        
        // Phase offset for each line (one tick out of phase)
        float phaseOffset = i * 0.1;
        
        // Calculate sine wave y position for this line
        float waveY = 0.5 + uYOffset + uAmplitude * sin(x * uSpeed * 6.28318 + iTime + phaseOffset);
        
        // Calculate distance from current pixel to wave
        float dist = abs(y - waveY);
        
        // Create smooth line with anti-aliasing
        float line = smoothstep(lineWidth, lineWidth * 0.5, dist);
        
        // White wave color
        vec3 waveColor = vec3(1.0, 1.0, 1.0);
        
        // Accumulate lines
        color = mix(color, waveColor, line);
    }

    gl_FragColor = vec4(color, 1.0);
}`,
    defaultUniforms: [
      { id: "base-speed", name: "uSpeed", value: 1.0, min: 0, max: 3, step: 0.1 },
      { id: "base-lineCount", name: "uLineCount", value: 10.0, min: 1, max: 20, step: 1 },
      { id: "base-amplitude", name: "uAmplitude", value: 0.2, min: 0, max: 0.5, step: 0.01 },
      { id: "base-yOffset", name: "uYOffset", value: 0.0, min: -0.5, max: 0.5, step: 0.01 },
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
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    
    float wave = 0.5 + uAmplitude * sin(uv.x * 6.28318 * 3.0 + iTime * uSpeed);
    float dist = abs(uv.y - wave);
    float line = smoothstep(uThickness, uThickness * 0.5, dist);
    
    vec3 bgColor = vec3(0.1, 0.1, 0.15);
    vec3 waveColor = vec3(0.2, 0.6, 1.0);
    vec3 color = mix(bgColor, waveColor, line);
    
    gl_FragColor = vec4(color, 1.0);
}`,
    defaultUniforms: [
      { id: "preset-speed", name: "uSpeed", value: 1.0, min: 0, max: 5, step: 0.1 },
      { id: "preset-amplitude", name: "uAmplitude", value: 0.15, min: 0, max: 0.4, step: 0.01 },
      { id: "preset-thickness", name: "uThickness", value: 0.03, min: 0.01, max: 0.1, step: 0.01 },
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
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 center = vec2(0.5, 0.5);
    
    float dist = distance(uv, center);
    float pulse = uRadius + sin(iTime * uPulse) * 0.1;
    float gradient = smoothstep(pulse, pulse - uSoftness, dist);
    
    vec3 color1 = vec3(0.1, 0.2, 0.5);
    vec3 color2 = vec3(0.9, 0.4, 0.6);
    vec3 color = mix(color1, color2, gradient);
    
    gl_FragColor = vec4(color, 1.0);
}`,
    defaultUniforms: [
      { id: "preset-radius", name: "uRadius", value: 0.5, min: 0.1, max: 1.0, step: 0.01 },
      { id: "preset-softness", name: "uSoftness", value: 0.3, min: 0.1, max: 1.0, step: 0.01 },
      { id: "preset-pulse", name: "uPulse", value: 1.0, min: 0, max: 3, step: 0.1 },
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
    
    gl_FragColor = vec4(color, 1.0);
}`,
    defaultUniforms: [
      { id: "preset-gridSize", name: "uGridSize", value: 10.0, min: 2, max: 50, step: 1 },
      { id: "preset-lineWidth", name: "uLineWidth", value: 0.05, min: 0.01, max: 0.2, step: 0.01 },
      { id: "preset-glow", name: "uGlow", value: 0.5, min: 0, max: 2, step: 0.1 },
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
    
    gl_FragColor = vec4(color, 1.0);
}`,
    defaultUniforms: [
      { id: "preset-speed", name: "uSpeed", value: 0.5, min: 0, max: 2, step: 0.1 },
      { id: "preset-scale", name: "uScale", value: 5.0, min: 1, max: 20, step: 0.5 },
      { id: "preset-intensity", name: "uIntensity", value: 2.0, min: 0.5, max: 5, step: 0.1 },
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
    
    gl_FragColor = vec4(color, 1.0);
}`,
    defaultUniforms: [
      { id: "preset-size", name: "uSize", value: 8.0, min: 2, max: 32, step: 1 },
      { id: "preset-rotation", name: "uRotation", value: 0.1, min: 0, max: 1, step: 0.05 },
      { id: "preset-blend", name: "uBlend", value: 0.0, min: 0, max: 0.5, step: 0.05 },
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
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 center = vec2(0.5, 0.5);
    
    float dist = distance(uv, center);
    float ripple = sin(dist * uFrequency - iTime * uSpeed) * uAmplitude;
    
    float brightness = 0.5 + ripple;
    vec3 color = vec3(0.2, 0.5, 0.8) * brightness;
    
    gl_FragColor = vec4(color, 1.0);
}`,
    defaultUniforms: [
      { id: "preset-speed", name: "uSpeed", value: 3.0, min: 0, max: 10, step: 0.5 },
      { id: "preset-frequency", name: "uFrequency", value: 20.0, min: 5, max: 50, step: 1 },
      { id: "preset-amplitude", name: "uAmplitude", value: 0.5, min: 0.1, max: 1, step: 0.05 },
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
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 pos = uv * uScale + iTime * uSpeed;
    
    float noise = random(floor(pos));
    noise = pow(noise, 1.0 / uContrast);
    
    vec3 color = vec3(noise);
    
    gl_FragColor = vec4(color, 1.0);
}`,
    defaultUniforms: [
      { id: "preset-scale", name: "uScale", value: 50.0, min: 10, max: 200, step: 5 },
      { id: "preset-speed", name: "uSpeed", value: 0.5, min: 0, max: 2, step: 0.1 },
      { id: "preset-contrast", name: "uContrast", value: 1.5, min: 0.5, max: 3, step: 0.1 },
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
    
    gl_FragColor = vec4(color, 1.0);
}`,
    defaultUniforms: [
      { id: "preset-bars", name: "uBars", value: 10.0, min: 2, max: 50, step: 1 },
      { id: "preset-speed", name: "uSpeed", value: 0.5, min: 0, max: 2, step: 0.1 },
      { id: "preset-shift", name: "uShift", value: 0.1, min: 0, max: 1, step: 0.05 },
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
    
    gl_FragColor = vec4(color, 1.0);
}`,
    defaultUniforms: [
      { id: "preset-size", name: "uSize", value: 0.3, min: 0.1, max: 0.5, step: 0.01 },
      { id: "preset-pulseSpeed", name: "uPulseSpeed", value: 2.0, min: 0.5, max: 5, step: 0.1 },
      { id: "preset-glow", name: "uGlow", value: 5.0, min: 1, max: 15, step: 0.5 },
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
