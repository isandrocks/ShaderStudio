# Shader Studio - Feature Roadmap

## Overview
This document outlines planned features and the technical requirements needed to implement them. Each feature includes complexity estimates, architecture changes, and potential challenges.

---

## 1. Multi-Type Uniform Support (vec3/vec4 with Color Pickers)

### Current State
- Only `float` uniforms supported with slider controls
- All uniforms stored as `DynamicUniform` with scalar values

### Proposed Changes

#### Architecture Changes
- **Extend `DynamicUniform` interface** to support multiple types:
  ```typescript
  interface DynamicUniform {
    id: string;
    name: string;
    type: 'float' | 'vec3' | 'vec4';
    value: number | [number, number, number] | [number, number, number, number];
    min?: number;
    max?: number;
    step?: number;
    // For vec3/vec4
    colorValue?: { r: number, g: number, b: number, a?: number };
  }
  ```

- **Create new control components**:
  - `ColorPickerControl.tsx` - For vec3 (RGB) uniforms
  - `ColorPickerWithAlphaControl.tsx` - For vec4 (RGBA) uniforms
  - Add React color picker library (e.g., `react-color` or `react-colorful`)

- **Update `buildFragmentSource`** to handle different uniform types:
  - Inject `uniform vec3 name;` or `uniform vec4 name;` declarations
  - Update regex patterns to detect existing vec3/vec4 uniforms

- **Update `webgl.ts`** rendering pipeline:
  - Add `gl.uniform3f()` and `gl.uniform4f()` calls
  - Convert color values from 0-255 range to 0-1 for GLSL
  - Cache uniform locations for all types

#### UI Changes
- **UniformConfigModal**: Add dropdown to select uniform type (float/vec3/vec4)
- **ControlPanel**: Conditionally render appropriate control based on uniform type
- Show color swatch for vec3/vec4 uniforms with picker popup

#### Bundle Impact
- React color picker libraries: ~20-50 KB additional bundle size

#### Complexity: **Medium-High**
**Estimated Time**: 6-8 hours

---

## 2. Visual Variable System with Drag-and-Drop

### Current State
- Uniforms can only be configured via text input in modal
- No visual relationship between uniforms

### Proposed Changes

#### Architecture Changes
- **New data structure for variables**:
  ```typescript
  interface ShaderVariable {
    id: string;
    name: string;
    expression: string; // e.g., "uSpeed * 2.0 + uAmplitude"
    dependsOn: string[]; // Array of uniform IDs
  }
  ```

- **Create new components**:
  - `VariableBuilder.tsx` - Visual expression builder
  - `UniformNode.tsx` - Draggable uniform representation
  - `VariableCanvas.tsx` - Drop zone for building expressions
  
- **Implement drag-and-drop**:
  - Use `react-dnd` or native HTML5 drag-and-drop API
  - Create visual nodes that represent uniforms
  - Allow dragging uniforms into expression builder

- **Expression evaluation**:
  - Parse visual expressions into GLSL code
  - Inject computed variables into shader as `float varName = expression;`
  - Validate expressions for GLSL syntax

#### UI Changes
- New tab/panel for "Variables" alongside Parameters
- Visual node graph showing uniform dependencies
- Expression preview showing generated GLSL code

#### Challenges
- **Complexity**: Visual programming interface requires significant UX design
- **GLSL generation**: Must ensure valid syntax from visual expressions
- **Performance**: Real-time shader recompilation on variable changes

#### Bundle Impact
- Drag-and-drop library: ~30-60 KB

#### Complexity: **High**
**Estimated Time**: 12-16 hours

---

## 3. Preset Shader Library

### ✅ Implementation Status: COMPLETED (November 17, 2025)

**Implemented Features:**
- ✅ Created `ShaderPreset` interface with id, name, description, category, fragmentShader, and defaultUniforms
- ✅ Built `src/app/presets.ts` with 10 complete shader presets across 4 categories
- ✅ Created `PresetCard.tsx` component with hover effects and category badges
- ✅ Created `PresetGallery.tsx` modal with category filtering (All, waves, noise, patterns, effects)
- ✅ Integrated `loadPreset()` function in App.tsx to load shader code and uniforms
- ✅ Added "🎨 Load Preset" button to ControlPanel
- ✅ All presets compile successfully with proper GLSL syntax

**Included Presets:**
1. Multi Wave - Multiple sine waves with phase offset
2. Simple Wave - Single sine wave with adjustable properties
3. Radial Gradient - Smooth radial gradient from center
4. Grid Pattern - Animated grid with adjustable cell size
5. Plasma Effect - Colorful plasma with sine wave interference
6. Checkerboard - Classic checkerboard pattern with rotation
7. Ripple Effect - Concentric ripples emanating from center
8. Noise Static - Animated noise texture effect
9. Gradient Bars - Horizontal gradient bars with animation
10. Circle Pulse - Pulsing circle with glow effect

### Current State
- Single default shader (`FRAGMENT_SHADER` in `shaders.ts`)
- Users must write shader from scratch or edit default

### Proposed Changes

#### Architecture Changes
- **Create preset system**:
  ```typescript
  interface ShaderPreset {
    id: string;
    name: string;
    description: string;
    thumbnail?: string; // Base64 preview image
    fragmentShader: string;
    defaultUniforms: DynamicUniform[];
    category: 'waves' | 'noise' | 'patterns' | 'effects';
  }
  ```

- **New file**: `src/app/presets.ts` containing preset library:
  ```typescript
  export const SHADER_PRESETS: ShaderPreset[] = [
    {
      id: 'waves-multi',
      name: 'Multi-Wave',
      description: 'Multiple sine waves with phase offset',
      fragmentShader: '...',
      defaultUniforms: [...]
    },
    {
      id: 'perlin-noise',
      name: 'Perlin Noise',
      // ...
    },
    // More presets...
  ];
  ```

- **Create components**:
  - `PresetGallery.tsx` - Grid of preset cards with thumbnails
  - `PresetCard.tsx` - Individual preset with preview and metadata

#### UI Changes
- Add "Presets" button/tab to main interface
- Modal or sidebar showing preset gallery
- Click preset to load shader + uniforms
- Category filtering (Waves, Noise, Patterns, Effects)

#### Implementation Details
- Generate preset thumbnails during build (optional)
- Include 8-12 starter presets covering common effects:
  - Basic Wave
  - Multi-Wave (current default)
  - Radial Gradient
  - Perlin Noise
  - Grid Pattern
  - Ripple Effect
  - Plasma
  - Checkerboard

#### Bundle Impact
- Preset shader strings: ~10-15 KB (compressed)
- Thumbnail images (if included): ~50-100 KB

#### Complexity: **Low-Medium**
**Estimated Time**: 4-6 hours

---

## 4. Shader Save/Load System

### ✅ Implementation Status: COMPLETED

### Current State
- No persistence - shaders lost on plugin close
- `networkAccess.allowedDomains: ["none"]` in manifest

### Proposed Changes

#### Architecture Changes

**Option A: Local Storage (Plugin Context)**
- Use Figma's `figma.clientStorage` API to save shaders
- Store in plugin's local storage (per-user, per-document)
- Limitations: Data persists only in Figma, not portable

**Option B: Figma Document Storage**
- Store shader data in Figma document using `setPluginData()`
- Shaders travel with the Figma file
- Accessible to all collaborators

**Option C: External API (Requires Network Access)**
- Create cloud backend for shader storage
- Update `manifest.json` to allow specific domain
- Implement authentication system
- **Challenge**: Figma plugin approval process for network access

#### Data Structure
```typescript
interface SavedShader {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  fragmentShader: string;
  uniforms: DynamicUniform[];
  variables?: ShaderVariable[]; // If feature #2 implemented
  thumbnail?: string; // Base64 preview
}
```

#### UI Changes
- **New components**:
  - `ShaderLibrary.tsx` - Browse saved shaders
  - `SaveShaderModal.tsx` - Name and save current shader
  - `LoadShaderModal.tsx` - Select shader to load

- **Main UI additions**:
  - "Save" button in control panel
  - "Load" button to open library
  - Auto-save option (save on every change)

#### Implementation Details
- **Option A (Recommended for MVP)**:
  ```typescript
  // Save shader
  await figma.clientStorage.setAsync('savedShaders', JSON.stringify(shaders));
  
  // Load shaders
  const data = await figma.clientStorage.getAsync('savedShaders');
  ```

- **Export/Import feature**:
  - Export shader as JSON file
  - Import JSON to load shader
  - Workaround for sharing without network access

#### Complexity: **Medium** (Local Storage) / **High** (Cloud Backend)
**Estimated Time**: 
- Option A: 5-7 hours
- Option B: 4-6 hours
- Option C: 20-30 hours (backend + frontend)

---

## 5. Video Export (60-Second Loop)

### Current State
- Only captures single frame as PNG image
- Uses `canvas.toBlob()` for static image export

### Proposed Changes

#### Architecture Changes
- **Video recording system**:
  ```typescript
  interface VideoExportOptions {
    duration: number; // seconds (default: 60)
    fps: number; // frames per second (default: 30)
    resolution: { width: number, height: number }; // default: 1920x1080
    format: 'webm' | 'mp4'; // Output format
  }
  ```

- **Implement frame capture loop**:
  1. Pause animation loop
  2. Step through time manually (0 to 60 seconds)
  3. Capture each frame at specified FPS
  4. Encode frames to video using MediaRecorder API

- **Use MediaRecorder API**:
  ```typescript
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm',
    videoBitsPerSecond: 5000000 // 5 Mbps
  });
  ```

#### UI Changes
- **New component**: `ExportModal.tsx` with options:
  - Duration slider (1-120 seconds)
  - FPS selector (24/30/60)
  - Resolution dropdown (720p/1080p/4K)
  - Format selector (WebM/MP4)
  - Progress bar during export

- Update "Create Rectangle" button to have dropdown:
  - "Export as Image" (current behavior)
  - "Export as Video" (new feature)

#### Implementation Details
- **Frame capture process**:
  - Calculate total frames: `duration * fps`
  - For each frame:
    - Set time: `iTime = currentFrame / fps`
    - Render shader
    - Capture frame: `canvas.toBlob()`
  - Compile frames into video

- **Performance considerations**:
  - High FPS + long duration = many frames (60s @ 60fps = 3600 frames)
  - Show estimated file size before export
  - Cancel button during export
  - Use Web Workers for encoding (if needed)

#### Challenges
- **Browser compatibility**: MediaRecorder support varies
- **File size**: 60s video at 1080p can be 20-50 MB
- **Export time**: Rendering 1800+ frames takes time
- **Figma limitations**: Large blobs may hit size limits for `postMessage`

#### Alternative Approach
- Generate frames as image sequence
- Download as ZIP file
- User assembles video externally (ffmpeg, video editor)

#### Bundle Impact
- Video encoding libraries (if needed): ~100-200 KB

#### Complexity: **High**
**Estimated Time**: 10-14 hours

---

## 6. HTML Export for Web Embedding

### Current State
- Shader only exists within Figma plugin
- No way to use shader outside Figma

### Proposed Changes

#### Architecture Changes
- **Create export template system**:
  ```typescript
  interface HTMLExportOptions {
    standalone: boolean; // Self-contained HTML vs. external files
    includeControls: boolean; // Include parameter sliders
    autoplay: boolean; // Start animation immediately
    loop: boolean; // Loop animation
    responsive: boolean; // Canvas scales to container
  }
  ```

- **Generate standalone HTML**:
  - Inline shader code as string
  - Inline minimal WebGL boilerplate
  - Inline uniform values and controls (optional)
  - No external dependencies

#### HTML Template Structure
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Styling for canvas and controls */
  </style>
</head>
<body>
  <canvas id="shader-canvas"></canvas>
  <!-- Optional: control sliders -->
  
  <script>
    // WebGL initialization
    // Shader compilation
    // Uniform management
    // Animation loop
    // Generated from plugin state
  </script>
</body>
</html>
```

#### UI Changes
- **New component**: `HTMLExportModal.tsx`
  - Preview of generated code
  - Copy to clipboard button
  - Download as `.html` file
  - Options checkboxes (controls, autoplay, etc.)
  - Iframe code snippet option

- Add "Export" tab/button to main interface
  - "Export as HTML" option
  - "Copy iframe code" option

#### Export Features
1. **Standalone HTML**: Complete, working file
2. **Iframe snippet**: 
   ```html
   <iframe src="shader.html" width="800" height="600"></iframe>
   ```
3. **Code snippet**: Just the shader + minimal JS
4. **Embeddable widget**: With attribution and link back

#### Implementation Details
- **Template file**: `src/app/templates/htmlExport.ts`
- **Code generation**:
  ```typescript
  function generateHTML(shader: string, uniforms: DynamicUniform[], options: HTMLExportOptions): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>...</head>
        <body>
          <canvas id="canvas"></canvas>
          <script>
            const FRAGMENT_SHADER = \`${shader}\`;
            const UNIFORMS = ${JSON.stringify(uniforms)};
            // ... WebGL boilerplate
          </script>
        </body>
      </html>
    `;
  }
  ```

- **Minification**: Optionally minify HTML/JS for smaller output
- **CDN option**: Generate code that loads libraries from CDN (for smaller inline code)

#### Use Cases
- Embed shader on personal website
- Share shader on CodePen/JSFiddle
- Create interactive shader gallery
- Use in web presentations/demos

#### Bundle Impact
- Template strings: ~2-5 KB
- Ace editor already included (for code preview)

#### Complexity: **Medium**
**Estimated Time**: 6-8 hours

---

## Implementation Priority & Timeline

### Phase 1: Foundation (MVP Enhancements)
**Timeline**: 2-3 weeks
1. ✅ **Preset Shader Library** (Low complexity, high value)
2. ✅ **Shader Save/Load System** (Option A: Local Storage)
3. ✅ **HTML Export** (Medium complexity, high shareability)

### Phase 2: Advanced Controls
**Timeline**: 3-4 weeks
4. ✅ **Multi-Type Uniform Support** (vec3/vec4 color pickers)
5. ⚠️ **Video Export** (High complexity, performance-intensive)

### Phase 3: Advanced Features
**Timeline**: 4-5 weeks
6. ⚠️ **Visual Variable System** (High complexity, requires UX design)

### Phase 4: Extended Features (Post-MVP)
**Timeline**: 6-10 weeks
7. 🎨 **Texture Support** (Image uploads as sampler2D uniforms)
8. 🎵 **Audio Reactivity** (Uniforms controlled by audio input)
9. 🤝 **Collaborative Editing** (Real-time multi-user shader editing)
10. 🤖 **AI Shader Generation** (Natural language → GLSL code)

---

## Technical Considerations

### Bundle Size Management
- **Current size**: 839 KB
- **After all features**: Estimated 950 KB - 1.1 MB
- **Mitigation strategies**:
  - Lazy load video export functionality
  - Use lightweight color picker library
  - Consider code splitting for advanced features

### Performance Implications
- Real-time shader recompilation on uniform changes
- Video export may freeze UI during rendering
- Consider Web Workers for heavy operations

### Figma Plugin Limitations
- **No network access** (unless approved by Figma)
- **PostMessage size limits** for large data transfers
- **Sandbox restrictions** for certain Web APIs
- **No persistent server** for cloud features

### Browser Compatibility
- WebGL 1.0 support (broadly compatible)
- MediaRecorder API (video export) - check support
- Color picker libraries work in all modern browsers
- Drag-and-drop APIs well-supported

---

## Testing Requirements

### Per Feature
1. **Unit tests**: WebGL functions, shader compilation
2. **Integration tests**: UI controls update shader correctly
3. **Visual regression tests**: Shader output matches expected
4. **Performance tests**: Frame rate maintains 60 FPS

### Overall
- Test with complex shaders (many uniforms, large code)
- Test save/load with edge cases (empty state, corrupt data)
- Test export features across browsers
- Test video export at different resolutions/durations

---

## Documentation Needs

### User-Facing
- Tutorial: Creating your first shader
- Guide: Understanding uniforms and variables
- Examples: Gallery of preset shaders with explanations
- FAQ: Common shader errors and fixes

### Developer
- Update `BUILD_SYSTEM.md` with new dependencies
- Update `copilot-instructions.md` with architecture changes
- API documentation for export formats
- Contributing guide for adding new presets

---

---

## 7. Texture Support (sampler2D Uniforms)

### Current State
- Only numeric uniforms supported (float, vec3, vec4)
- No way to use images/textures in shaders

### Proposed Changes

#### Architecture Changes
- **Extend uniform type system**:
  ```typescript
  interface DynamicUniform {
    id: string;
    name: string;
    type: 'float' | 'vec3' | 'vec4' | 'sampler2D';
    value: number | [number, number, number] | [number, number, number, number] | WebGLTexture;
    imageData?: {
      url: string;
      width: number;
      height: number;
      blob: Blob;
    };
  }
  ```

- **Texture management system**:
  - Upload images via file input or drag-and-drop
  - Convert uploaded images to WebGL textures
  - Support common formats: PNG, JPG, WebP, SVG
  - Texture filtering options: nearest, linear, mipmap
  - Wrapping modes: repeat, clamp, mirror

- **Update WebGL pipeline**:
  - Load images and create textures: `gl.createTexture()`
  - Bind textures to texture units: `gl.activeTexture(gl.TEXTURE0)`
  - Pass texture unit to shader: `gl.uniform1i()`
  - Handle texture loading async (show loading state)

#### UI Changes
- **New component**: `TextureUploadControl.tsx`
  - File upload button
  - Drag-and-drop zone
  - Thumbnail preview of uploaded image
  - Texture settings: filtering, wrapping, scale
  
- **UniformConfigModal**: Add `sampler2D` option
- **ControlPanel**: Show texture preview thumbnail

#### Implementation Details
```typescript
function loadTexture(gl: WebGLRenderingContext, imageUrl: string): WebGLTexture {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  // Placeholder pixel while image loads
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([255, 0, 255, 255]));
  
  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  };
  image.src = imageUrl;
  
  return texture;
}
```

#### Shader Usage Example
```glsl
uniform sampler2D uTexture;
uniform vec2 iResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution;
  vec4 texColor = texture2D(uTexture, uv);
  gl_FragColor = texColor;
}
```

#### Challenges
- **File size limits**: Large images may hit Figma's postMessage limits
- **Storage**: Need to serialize texture data for save/load
- **Performance**: Multiple textures increase GPU memory usage
- **Formats**: Handle different image formats and sizes

#### Bundle Impact
- Image processing libraries (if needed): ~20-40 KB

#### Complexity: **Medium-High**
**Estimated Time**: 8-12 hours

---

## 8. Audio Reactivity

### Current State
- Uniforms controlled manually via sliders
- No external input sources

### Proposed Changes

#### Architecture Changes
- **Audio analysis system**:
  ```typescript
  interface AudioReactiveUniform {
    uniformId: string;
    audioSource: 'microphone' | 'file';
    reactivityType: 'volume' | 'frequency' | 'beat' | 'waveform';
    frequencyRange?: { min: number, max: number }; // Hz
    smoothing: number; // 0-1
    multiplier: number; // Scale audio value
    offset: number; // Add constant offset
  }
  ```

- **Web Audio API integration**:
  - Request microphone access: `navigator.mediaDevices.getUserMedia()`
  - Analyze audio with `AnalyserNode`
  - Extract frequency data, volume, beat detection
  - Map audio values to uniform ranges

- **Audio processing pipeline**:
  ```typescript
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  
  function analyzeAudio() {
    analyser.getByteFrequencyData(dataArray);
    // Process frequency data and update uniforms
  }
  ```

#### UI Changes
- **New component**: `AudioReactivityPanel.tsx`
  - Enable/disable audio input
  - Select audio source (mic/file)
  - Link uniforms to audio features
  - Visual audio waveform/spectrum display
  - Sensitivity/multiplier controls

- **AudioBindingModal**: Configure how audio affects uniforms
  - Choose reactivity type (volume/frequency/beat)
  - Set frequency range for frequency-based
  - Adjust smoothing and scaling

#### Implementation Details
- **Beat detection**: Analyze bass frequencies for rhythm
- **Frequency bands**: Map different frequency ranges to different uniforms
- **Smoothing**: Apply exponential moving average to prevent jitter
- **Visualization**: Show real-time audio spectrum analyzer

#### Use Cases
- Music visualizers
- Audio-reactive backgrounds
- VJ tools for live performances
- Interactive sound-based art

#### Challenges
- **Permissions**: Requires microphone access (user prompt)
- **Performance**: Audio analysis + shader rendering can be intensive
- **Latency**: Minimize delay between audio input and visual response
- **Browser support**: Web Audio API support varies

#### Bundle Impact
- Web Audio API polyfills (if needed): ~10-20 KB

#### Complexity: **High**
**Estimated Time**: 12-18 hours

---

## 9. Collaborative Editing

### Current State
- Single-user plugin instance
- No sharing or real-time collaboration

### Proposed Changes

#### Architecture Changes
- **Requires network access** (major change to `manifest.json`)
- **WebSocket server** for real-time sync:
  ```typescript
  interface CollaborationSession {
    sessionId: string;
    creator: string;
    participants: User[];
    shaderState: {
      code: string;
      uniforms: DynamicUniform[];
      version: number;
    };
  }
  ```

- **Operational Transform (OT) or CRDT** for conflict resolution
- **Presence awareness**: Show who's editing what
- **Cursor tracking**: See other users' cursors in code editor
- **Change broadcasting**: Real-time uniform updates, code changes

#### Backend Requirements
- **WebSocket server**: Node.js + Socket.io or similar
- **Database**: Store sessions, user state
- **Authentication**: User accounts or anonymous sessions
- **Rate limiting**: Prevent abuse
- **Session management**: Create, join, leave sessions

#### UI Changes
- **New components**:
  - `CollaborationPanel.tsx` - Session management
  - `ParticipantList.tsx` - Show active users
  - `ShareDialog.tsx` - Generate shareable session links
  
- **Code editor enhancements**:
  - Multi-colored cursors for each user
  - User avatars/names
  - Lock/unlock sections to prevent conflicts

#### Implementation Details
```typescript
// Client-side WebSocket
const socket = io('wss://shader-studio-collab.example.com');

socket.on('uniform-update', (data) => {
  setDynamicUniforms(prevUniforms => 
    updateUniform(prevUniforms, data.uniformId, data.value)
  );
});

socket.emit('code-change', { 
  sessionId, 
  userId, 
  delta: codeDelta 
});
```

#### Challenges
- **Network access approval**: Major Figma plugin review requirement
- **Infrastructure costs**: Running servers for real-time sync
- **Conflict resolution**: Handle simultaneous edits gracefully
- **Security**: Prevent malicious code injection
- **Scalability**: Support many concurrent sessions
- **Offline mode**: Graceful degradation without network

#### Alternative Approach
- **Share via export/import**: Users export JSON, share manually
- **Figma document storage**: Use `setPluginData()` for team files
- **Git-style workflow**: Merge changes offline

#### Complexity: **Very High**
**Estimated Time**: 40-60 hours (frontend + backend)

---

## 10. AI Shader Generation

### Current State
- Users write GLSL code manually
- Requires shader programming knowledge

### Proposed Changes

#### Architecture Changes
- **AI integration options**:
  
  **Option A: API-based (OpenAI, Anthropic)**
  - Requires network access
  - Send natural language prompt to AI API
  - Receive generated GLSL code
  - Parse and validate output
  
  **Option B: Local AI model**
  - Use TensorFlow.js or ONNX Runtime
  - Load fine-tuned model for GLSL generation
  - Run inference in browser
  - No network required (but large bundle size)
  
  **Option C: Figma AI Integration (Recommended)**
  - Use Figma's native AI capabilities
  - No network access approval needed (uses Figma's infrastructure)
  - Access via Figma Plugin API if available
  - Potential methods:
    - `figma.ai.generateText()` or similar API (if exposed to plugins)
    - Leverage existing Figma AI features within plugin context
    - Prompt engineering to get shader-specific outputs
  - **Advantages**:
    - No external API costs
    - No bundle size increase
    - Seamless integration with Figma ecosystem
    - Already approved by Figma security review
  - **Challenges**:
    - API availability - need to check if Figma exposes AI to plugins
    - May require specific plugin capabilities/permissions
    - Limited control over AI model and prompting
    - Dependent on Figma's AI roadmap and features

- **Prompt engineering system**:
  ```typescript
  interface ShaderPrompt {
    userInput: string; // "Create a plasma effect with purple colors"
    context: {
      existingUniforms: string[];
      targetResolution: string;
      style: 'simple' | 'complex';
    };
    generatedCode?: string;
    confidence?: number;
  }
  ```

- **Code validation pipeline**:
  1. Generate GLSL code from prompt
  2. Validate syntax (check for compile errors)
  3. Test compile in WebGL context
  4. If errors, retry with error context
  5. Insert generated code into editor

#### UI Changes
- **New component**: `AIGeneratorModal.tsx`
  - Text input for natural language description
  - Style selector (minimal/detailed)
  - "Generate" button
  - Preview of generated shader
  - "Refine" button to iterate on result
  - "Accept" to insert into editor

- **Prompt examples**:
  - "Create a wavy gradient that transitions from blue to pink"
  - "Make a pulsing circle that responds to time"
  - "Generate a grid of rotating squares"
  - "Create a starfield effect"

#### Implementation Details

**Using Figma AI** (Option C - Recommended):
```typescript
// Check if Figma AI API is available
async function generateShaderWithFigmaAI(prompt: string): Promise<string> {
  try {
    // Hypothetical API - actual implementation depends on Figma's plugin API
    if (!figma.ai) {
      throw new Error('Figma AI not available in this version');
    }
    
    // Construct shader-specific prompt
    const systemPrompt = `Generate a GLSL ES 1.0 fragment shader that ${prompt}. 
      Include precision statement, uniforms for iResolution, iTime, and main() function.
      Output only valid GLSL code without markdown formatting.`;
    
    const response = await figma.ai.generateText({
      prompt: systemPrompt,
      maxTokens: 1000,
      temperature: 0.7
    });
    
    // Extract and validate GLSL code
    const glslCode = extractGLSLCode(response.text);
    return glslCode;
  } catch (error) {
    console.error('Figma AI generation failed:', error);
    throw error;
  }
}

// Fallback validation step
function validateGeneratedShader(code: string): boolean {
  // Check for required elements
  const hasPrecision = /precision\s+\w+\s+float;/.test(code);
  const hasMainFunction = /void\s+main\s*\(\s*\)/.test(code);
  const hasFragColor = /gl_FragColor/.test(code);
  
  return hasPrecision && hasMainFunction && hasFragColor;
}
```

**Alternative: Use Figma's Chat/AI UI**:
If direct API access is not available, implement a workflow:
1. User enters prompt in plugin
2. Plugin generates instructions for Figma AI
3. User pastes prompt into Figma's AI chat
4. User copies generated shader back to plugin
5. Plugin validates and inserts code

**Using OpenAI API** (Option A):
```typescript
async function generateShader(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: 'You are a GLSL shader expert. Generate fragment shader code.'
      }, {
        role: 'user',
        content: prompt
      }]
    })
  });
  
  const data = await response.json();
  return extractGLSLCode(data.choices[0].message.content);
}
```

**Fine-tuning approach**:
- Collect dataset of (description, GLSL code) pairs
- Fine-tune GPT-4 or similar on shader generation
- Include common GLSL patterns and best practices

#### Use Cases
- **Beginners**: Generate starter shaders from ideas
- **Rapid prototyping**: Quickly test visual concepts
- **Learning tool**: See how descriptions map to code
- **Iteration**: Refine shaders with natural language

#### Challenges
- **Figma AI API availability**: Need to verify if/when Figma exposes AI to plugins
- **API discovery**: Check Figma Plugin API documentation for AI capabilities
- **Prompt engineering**: Optimize prompts for shader generation specifically
- **API costs** (External APIs): Each generation costs money (OpenAI pricing)
- **Network requirement** (External APIs): Needs internet connection
- **Quality control**: AI may generate invalid/poor shaders
- **Rate limits**: API rate limiting may throttle users
- **Privacy** (External APIs): Sending user prompts to third-party API
- **Bundle size** (Local models): Local models are 50-200+ MB

**Research Required**:
1. Test Figma's AI with shader generation prompts to validate quality
2. Check Figma Plugin API docs for `figma.ai` or similar namespace
3. Contact Figma support/community about AI plugin integration
4. Monitor Figma's changelog for AI-related plugin features

#### Alternative Features
- **AI shader optimization**: Improve existing shader performance
- **AI documentation**: Generate comments for shader code
- **AI debugging**: Suggest fixes for shader errors
- **Style transfer**: "Make this shader look like that one"

#### Complexity: **Very High**
**Estimated Time**: 
- Option A (External API): 15-20 hours
- Option B (Local model): 40-60 hours
- Option C (Figma AI): 8-12 hours (if API available) / 4-6 hours (assisted workflow)

**Recommended Approach**: 
Start with Option C (Figma AI) as it provides the best integration with the Figma ecosystem, requires no network approval, and has zero API costs. If Figma's AI API is not yet available to plugins, implement the assisted workflow where users can easily copy prompts to Figma's AI and paste results back. Monitor Figma's plugin API updates for direct AI access in future versions.

---

## Implementation Priority & Timeline (Updated)

### Phase 1: Foundation (MVP Enhancements)
**Timeline**: 2-3 weeks
1. ✅ **Preset Shader Library** (Low complexity, high value)
2. ✅ **Shader Save/Load System** (Option A: Local Storage)
3. ✅ **HTML Export** (Medium complexity, high shareability)

### Phase 2: Advanced Controls
**Timeline**: 3-4 weeks
4. ✅ **Multi-Type Uniform Support** (vec3/vec4 color pickers)
5. ⚠️ **Video Export** (High complexity, performance-intensive)

### Phase 3: Advanced Features
**Timeline**: 4-5 weeks
6. ⚠️ **Visual Variable System** (High complexity, requires UX design)

### Phase 4: Extended Features (Post-MVP)
**Timeline**: 6-10 weeks
7. 🎨 **Texture Support** (8-12 hours) - Medium-High complexity
8. 🎵 **Audio Reactivity** (12-18 hours) - High complexity
9. 🤝 **Collaborative Editing** (40-60 hours) - Very High complexity, requires infrastructure
10. 🤖 **AI Shader Generation** (15-60 hours depending on approach) - Very High complexity

---

## Future Considerations (Beyond Roadmap)

### Additional Polish Features
- **Performance profiler**: Analyze shader GPU cost and suggest optimizations
- **Mobile preview**: Test shader rendering on mobile viewport sizes
- **Version control**: Track shader edit history with rollback capability
- **Community marketplace**: Share/sell shader presets with other users
- **Shader templates**: More structured starting points (e.g., "2D shapes", "3D raymarching")
- **Multi-pass rendering**: Support for render-to-texture and post-processing effects
- **Custom texture synthesis**: Generate procedural textures (noise, patterns) without uploads
- **Shader minifier**: Optimize GLSL code for smaller bundle size

### Technical Debt
- Migrate from Webpack 4 to Webpack 5 or Vite
- Add comprehensive TypeScript types for all WebGL operations
- Implement proper error boundaries for React components
- Add end-to-end testing with Playwright/Cypress
- Set up CI/CD pipeline for automated builds/tests

---

## Questions for Consideration

1. **Monetization**: Should any features be premium/paid?
2. **Branding**: Should exported content include "Made with Shader Studio" attribution?
3. **Analytics**: Track which features are most used? (privacy-respecting)
4. **Support**: How to handle user-submitted bug reports and feature requests?
5. **Versioning**: How to handle breaking changes to save format?
6. **Licensing**: What license for exported shaders and code?

---

## Conclusion

This roadmap provides a structured approach to adding significant new capabilities to Shader Studio. The phased implementation allows for iterative development, user feedback, and adjustments based on real-world usage.

**Recommended Starting Point**: Begin with Phase 1 features (Presets, Save/Load, HTML Export) as they provide immediate value with manageable complexity, then gather user feedback before tackling more complex features.
