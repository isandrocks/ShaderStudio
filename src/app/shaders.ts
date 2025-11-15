// Shader sources
export const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
  }
`;

export const FRAGMENT_SHADER = `
precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uLineCount;
uniform float uAmplitude;
uniform float uYOffset;

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;

        // Create sine wave
    float x = uv.x;
    float y = uv.y;

        // Calculate sine wave y position
    float waveY = 0.5 + uYOffset + uAmplitude * sin(x * uLineCount * 6.28318 + iTime * uSpeed);

        // Calculate distance from current pixel to wave
    float dist = abs(y - waveY);

        // Create smooth line with anti-aliasing
    float lineWidth = 0.03;
    float line = smoothstep(lineWidth, lineWidth * 0.5, dist);

        // Dark gray/black background
    vec3 bgColor = vec3(0.05, 0.05, 0.05);

        // White wave
    vec3 waveColor = vec3(1.0, 1.0, 1.0);

        // Mix colors
    vec3 color = mix(bgColor, waveColor, line);

    gl_FragColor = vec4(color, 1.0);
}

`;
