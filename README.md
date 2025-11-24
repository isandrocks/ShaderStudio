# Shader Studio

A Figma plugin that creates dynamic backgrounds, textures, and animated fills using real-time GLSL shaders with WebGL rendering.

![Shader Studio Plugin](https://img.shields.io/badge/Figma-Plugin-F24E1E?logo=figma&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1-06B6D4?logo=tailwindcss&logoColor=white)

## Features

✨ **Real-time Shader Preview** - See your GLSL shaders render live with WebGL  
🎨 **Dynamic Uniforms** - Create float sliders and vec3/vec4 color pickers on the fly  
📝 **Advanced Code Editor** - Edit shaders with GLSL syntax highlighting (Ace Editor)  
🎭 **Preset Library** - Browse and load curated shader presets by category  
💾 **Save & Load Shaders** - Persistent shader storage in Figma documents  
⏸️ **Animation Controls** - Pause/play shader animations  
🔧 **Zero Configuration** - No GLSL knowledge required to start  
📦 **Export to Figma** - Apply shader output as image fills to rectangles

## Quick Start

### Prerequisites

Download and install Node.js (includes NPM):  
https://nodejs.org/en/download/

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

### Development Workflow

For active development with auto-recompile:

```bash
npm run build:watch
```

Then in Figma:
1. **Plugins** → **Development** → **Import plugin from manifest**
2. Select `manifest.json` from this directory
3. Make changes to any file in `src/`
4. Plugin auto-recompiles (watch terminal for "Compiled successfully")
5. Reload plugin in Figma: **Cmd/Ctrl+Option/Alt+P** → Rerun plugin

## Usage

### Creating Your First Shader

1. **Run the plugin** in Figma
2. **Adjust uniforms** using the sliders:
   - `uSpeed`: Animation speed
   - `uLineCount`: Number of wave lines
   - `uAmplitude`: Wave height
   - `uYOffset`: Vertical offset
3. **Click "Create Rectangle"** to apply shader as image fill

### Adding Custom Uniforms

1. Click the **+** button in the Parameters panel
2. Choose uniform **type**:
   - **float**: Slider control (min/max/step)
   - **color (RGB/RGBA)**: vec3/vec4 color picker with alpha
3. Configure properties:
   - **Name**: GLSL identifier (e.g., `uMyParam`)
   - **Min/Max/Step**: Value range (float only)
   - **Initial Value**: Starting value or color
4. Click **Add** - uniform auto-injected into shader

### Saving & Loading Shaders

**Save a shader:**
1. Click **💾 Save** button in Parameters panel
2. Enter name and optional description
3. Optionally include thumbnail (auto-captured from canvas)
4. Shader saved to Figma document storage

**Load a saved shader:**
1. Click **Advanced Editor ▼** → **My Shaders**
2. Browse saved shaders (sort by name/newest/oldest)
3. Click card to load shader with all uniforms
4. Delete unwanted shaders with **×** button

### Using Preset Shaders

1. Click **Advanced Editor ▼** → **Presets**
2. Filter by category: All / Waves / Noise / Patterns / Effects
3. Click preset card to load shader
4. Modify uniforms and shader code as needed

### Editing Shader Code

1. Click **"Advanced Editor"** button
2. Edit GLSL fragment shader code with syntax highlighting
3. Click **"Apply Shader"** to recompile
4. Errors display in dismissible popup overlay

## Architecture

This plugin uses a **two-process architecture** with **React 19.2** and **Tailwind CSS v4**:

- **Plugin Sandbox** (`src/plugin/controller.ts`): Figma API access, runs in restricted environment
- **UI Iframe** (`src/app/`): React app with WebGL rendering, runs in browser context

Communication via `postMessage` between contexts.

### State Management

- **React Hooks**: `useState` for UI state, `useRef` for WebGL context
- **useSyncedRef Hook**: Custom hook to keep refs in sync with state (solves closure issues in animation loops)
- **Dynamic Uniforms**: Array of configurable uniforms with CRUD operations
- **Shader Storage**: Saved to Figma document via `figma.root.getPluginData()` / `setPluginData()`

### Key Technical Patterns

**Ref Synchronization Pattern:**
```tsx
const paramsRef = useSyncedRef(params); // Always has current value
// Animation loop reads from paramsRef.current
```

**Dynamic Uniform Injection:**
- Uniforms auto-declared in shader via `buildFragmentSource()`
- Inserted after `precision mediump float;` statement
- Supports `float`, `vec3`, `vec4` types

**Message Protocol:**
- `create-rectangle` → `render-shader` → `shader-rendered` → Apply image fill
- `save-shader` / `load-shaders` / `delete-shader` for storage operations

### Tech Stack

- **React 19.2** - UI framework with hooks
- **TypeScript 5.3** - Type-safe development
- **Tailwind CSS v4.1** - Utility-first styling with CSS-first config
- **Webpack 4** - Module bundler with PostCSS integration
- **WebGL** - Real-time shader rendering
- **Ace Editor** - GLSL syntax highlighting

### Project Structure

```
src/
├── app/
│   ├── components/           # React components
│   │   ├── ControlPanel.tsx      # Dynamic uniform controls sidebar
│   │   ├── ShaderCanvas.tsx      # WebGL canvas with pause/play
│   │   ├── ShaderModal.tsx       # Advanced editor (Ace Editor)
│   │   ├── SliderControl.tsx     # Reusable slider with delete
│   │   ├── ColorControl.tsx      # vec3/vec4 color picker
│   │   ├── UniformConfigModal.tsx # Add new uniform dialog
│   │   ├── BaseModal.tsx         # Reusable modal wrapper
│   │   ├── PresetGallery.tsx     # Preset shader browser
│   │   ├── PresetCard.tsx        # Individual preset card
│   │   ├── SaveShaderModal.tsx   # Save shader dialog
│   │   ├── SavedShadersGallery.tsx # Saved shader browser
│   │   ├── SaveIcon.tsx          # Save button icon
│   │   ├── PlusIcon.tsx          # Add button icon
│   │   └── DeleteIcon.tsx        # Delete button icon
│   ├── hooks/                # Custom React hooks
│   │   └── useSyncedRef.ts       # Keep ref in sync with state
│   ├── generated/            # Auto-generated files
│   │   ├── preset-thumbnails.ts  # Preset thumbnail data
│   │   └── preset-thumbnails.json # Thumbnail source
│   ├── App.tsx               # Main React component
│   ├── webgl.ts              # WebGL/shader rendering logic
│   ├── shaders.ts            # GLSL shader source constants
│   ├── presets.ts            # Preset shader definitions
│   ├── types.ts              # TypeScript type definitions
│   ├── constants.ts          # App-wide constants
│   ├── styles.css            # Tailwind CSS v4 with theme
│   ├── index.tsx             # React entry point
│   └── index.html            # HTML template
└── plugin/
    └── controller.ts         # Figma plugin controller

dist/                         # Build output (auto-generated)
├── code.js                   # Compiled plugin (~4 KB)
└── ui.html                   # Compiled UI with inlined JS (~1.5 MB)
```

## Scripts

```bash
npm run build              # Production build (minified)
npm run build:watch        # Development build with auto-recompile
npm run watch              # Alias for build:watch
npm run lint               # Check code for errors
npm run lint:fix           # Auto-fix linting issues
npm run fmt                # Format code with Prettier
```

## API Documentation

### Dynamic Uniforms

Uniforms are automatically injected into your shader:

```glsl
precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;        // Auto-injected
uniform float uLineCount;    // Auto-injected
uniform float uAmplitude;    // Auto-injected

void main() {
  // Your shader code here
  // Access uniforms directly
}
```

### WebGL Functions (webgl.ts)

- `initWebGL()` - Initialize WebGL context and compile shaders
- `buildFragmentSource()` - Inject dynamic uniforms into shader source
- `injectUniforms()` - Low-level uniform injection (base uniforms excluded)
- `stripInjectedUniforms()` - Remove auto-injected uniforms from code
- `renderShader()` - Render single frame with current uniform values (supports float/vec3/vec4)
- `recompileShader()` - Hot-reload shader with new code
- `captureShaderAsImage()` - Capture canvas as PNG for Figma

### Type System (types.ts)

```typescript
type UniformType = "float" | "vec3" | "vec4";
type UniformValue = number | [number, number, number] | [number, number, number, number];

interface DynamicUniform {
  id: string;
  name: string;
  type: UniformType;
  value: UniformValue;
  min: number;
  max: number;
  step: number;
}
```

### Custom Hooks (hooks/)

**useSyncedRef** - Keep ref in sync with state value:
```tsx
const countRef = useSyncedRef(count);
// countRef.current always has latest count, even in callbacks
```

## Figma Plugin API

Official Figma plugin documentation:  
https://www.figma.com/plugin-docs/

### Key Figma APIs Used

- `figma.createRectangle()` - Create rectangle nodes
- `figma.createImage()` - Convert image data to Figma image
- `figma.ui.postMessage()` - Send messages to UI
- `figma.closePlugin()` - Close plugin window

### Plugin Manifest

Located in `manifest.json`:
- **ID**: `1570153150483583043`
- **Name**: Shader Studio
- **Network Access**: None (all assets inline)
- **Capabilities**: Basic rectangle and image creation

## Troubleshooting

### Build Errors

- Ensure Node.js v16+ is installed
- Delete `node_modules/` and `dist/`, then run `npm install`
- Check for TypeScript errors: `npm run lint`

### Shader Compilation Errors

- Check browser console (right-click plugin → Inspect)
- Errors display in red popup overlay
- Look for `[functionName]` prefixed console logs

### Plugin Not Loading

- Verify `manifest.json` is in root directory
- Rebuild plugin: `npm run build`
- Check `dist/code.js` and `dist/ui.html` exist

## Development Tips

### Hot Reloading
Run `npm run build:watch` and reload plugin after each compile.

### Debugging
- Right-click plugin window → **Inspect** for DevTools
- Console shows WebGL errors, shader compilation issues
- Inline source maps enabled in development builds

### Bundle Size
- Current: **~1.5 MB** (includes React + Tailwind + Ace Editor + react-colorful)
- Plugin code: **~4 KB** (controller only)
- Performance warnings disabled in `webpack.config.js`

**Recent Refactorings (November 2025):**
- ✅ Replaced manual ref syncing with `useSyncedRef` custom hook
- ✅ Consolidated uniform type defaulting with `ensureUniformTypes()` helper
- ✅ Removed redundant `buildFragmentSource()` logic - now uses `injectUniforms()`
- ✅ Cleaned up commented/mothballed code from ControlPanel
- ✅ Improved documentation and simplified error handling

## Code Quality

See [ROADMAP.md](./ROADMAP.md) for detailed plans. Recently completed:

✅ **Multi-type uniforms** - vec3/vec4 color pickers with RGB/RGBA support  
✅ **Preset library** - Curated shaders organized by category  
✅ **Save/load shaders** - Persistent storage in Figma documents  
✅ **Thumbnail generation** - Auto-capture shader previews

Planned features:

- 🖼️ Texture support (sampler2D uniforms)
- 🎵 Audio reactivity
- 🤖 AI shader generation
- 📹 Video export (60-second loops)
- 📤 HTML export for web embedding

## Contributing

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** strict mode

Format code before committing:
```bash
npm run lint:fix
npm run fmt
```

## Resources

- [Figma Plugin Quickstart](https://www.figma.com/plugin-docs/plugin-quickstart-guide/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [GLSL Reference](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

## License

MIT License - see [LICENSE](./LICENSE) file for details.

Copyright (c) 2025 iSandRocks

Free to use, modify, and distribute. Commercial use allowed.

---

**Built with ❤️ for the Figma community**
