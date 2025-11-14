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
