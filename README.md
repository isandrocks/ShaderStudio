# Shader Studio

A Figma plugin that creates dynamic backgrounds, textures, and animated fills using real-time GLSL shaders with WebGL rendering.

![Shader Studio Plugin](https://img.shields.io/badge/Figma-Plugin-F24E1E?logo=figma&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1-06B6D4?logo=tailwindcss&logoColor=white)

## Features

✨ **Real-time Shader Preview** - See your GLSL shaders render live with WebGL  
🎨 **Dynamic Uniforms** - Create custom parameters with sliders on the fly  
📝 **Advanced Code Editor** - Edit shaders with syntax highlighting (Ace Editor)  
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
2. Configure uniform properties:
   - **Name**: GLSL identifier (e.g., `uMyParam`)
   - **Min/Max**: Value range
   - **Step**: Increment size
   - **Initial Value**: Starting value
3. Click **Create** - uniform auto-injected into shader

### Editing Shader Code

1. Click **"Advanced Editor"** button
2. Edit GLSL fragment shader code with syntax highlighting
3. Click **"Apply Shader"** to recompile
4. Errors display in dismissible popup overlay

## Architecture

This plugin uses a **two-process architecture**:

- **Plugin Sandbox** (`src/plugin/controller.ts`): Figma API access, runs in restricted environment
- **UI Iframe** (`src/app/`): React app with WebGL rendering, runs in browser context

Communication via `postMessage` between contexts.

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
│   ├── components/         # React components
│   │   ├── ControlPanel.tsx
│   │   ├── ShaderCanvas.tsx
│   │   ├── ShaderModal.tsx
│   │   ├── SliderControl.tsx
│   │   ├── UniformConfigModal.tsx
│   │   ├── PlusIcon.tsx
│   │   └── DeleteIcon.tsx
│   ├── App.tsx             # Main component
│   ├── webgl.ts            # WebGL rendering logic
│   ├── shaders.ts          # GLSL shader source
│   ├── styles.css          # Tailwind CSS
│   └── index.tsx           # React entry point
└── plugin/
    └── controller.ts       # Figma plugin controller
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
- `renderShader()` - Render single frame with current uniform values
- `recompileShader()` - Hot-reload shader with new code
- `captureShaderAsImage()` - Capture canvas as PNG for Figma

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
- Current: **~839 KB** (includes React + Tailwind + Ace Editor)
- Performance warnings disabled in `webpack.config.js`

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features:

- 🎨 Multi-type uniforms (vec3/vec4 color pickers)
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

[Your License Here]

---

**Built with ❤️ for the Figma community**
