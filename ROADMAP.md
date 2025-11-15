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

## Future Considerations (Beyond Roadmap)

### Additional Features
- **Texture support**: Upload images to use as `sampler2D` uniforms
- **Audio reactivity**: Uniforms controlled by audio input
- **Collaborative editing**: Real-time multi-user shader editing
- **AI shader generation**: Natural language → GLSL code
- **Performance profiler**: Analyze shader GPU cost
- **Mobile preview**: Test shader on mobile viewport sizes
- **Version control**: Track shader history and rollback
- **Community marketplace**: Share/sell shader presets

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
