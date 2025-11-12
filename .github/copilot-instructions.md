# GLSL Texture & Shaders Figma Plugin

## Architecture Overview

This is a Figma plugin that renders GLSL shaders in WebGL and applies them as image fills to rectangles. The plugin uses a **two-process architecture**:

1. **Plugin sandbox** (`code.ts` → `code.js`): Runs in Figma's restricted environment with access to the Figma API
2. **UI iframe** (`ui.html`): Runs in a browser context with full DOM/WebGL access but no Figma API access

Communication flows via `postMessage` between the two contexts:
- Plugin → UI: `figma.ui.postMessage({ type: 'render-shader' })`
- UI → Plugin: `parent.postMessage({ pluginMessage: { type: 'shader-rendered', imageData } }, '*')`

## Critical Workflows

### Development Build Process
```bash
npm run build        # Compile TypeScript once
npm run watch        # Auto-compile on file changes (recommended during development)
```

The TypeScript compiler (`tsc`) transforms `code.ts` → `code.js`. The `code.js` output file is **committed to the repo** because Figma loads it directly via `manifest.json`.

### Testing in Figma
1. Run `npm run watch` to enable auto-compilation
2. In Figma: Plugins → Development → Import plugin from manifest
3. Select `manifest.json` from this directory
4. Changes to `code.ts` auto-compile; reload plugin in Figma to test

## Key Technical Patterns

### Shader Rendering Pipeline
The WebGL shader rendering happens entirely in `ui.html`:
1. User adjusts parameters (speed, lineCount, amplitude, yOffset)
2. Real-time preview renders in `<canvas id="glCanvas">` via `requestAnimationFrame`
3. On "Create Rectangle" click:
   - Plugin creates a 512×512 rectangle via `figma.createRectangle()`
   - Plugin sends `render-shader` message to UI
   - UI captures canvas as PNG blob via `canvas.toBlob()`
   - UI sends `Uint8Array` image data back to plugin
   - Plugin converts to Figma image and applies as `IMAGE` fill type

### Message Type Protocol
All cross-boundary messages use a `type` discriminator:
- `'create-rectangle'`: Initialize rectangle creation flow
- `'shader-rendered'`: Shader canvas captured, includes `imageData: Uint8Array`
- `'shader-error'`: WebGL/rendering failed
- `'cancel'`: Close plugin without creating
- `'render-shader'`: Trigger single-frame capture (from plugin → UI)

### Shader State Management
Global `state` object in `ui.html` holds:
- `gl`/`program`: WebGL context and compiled shader program
- `params`: Live shader parameters (speed, lineCount, amplitude, yOffset, paused)
- `startTime`/`pausedTime`: Animation timing control

Uniforms are updated every frame in `renderShader()` to reflect current param values.

## File Responsibilities

- `code.ts`: Figma API interactions, rectangle creation, image fill application, message routing
- `ui.html`: Complete WebGL setup, GLSL shader source, parameter controls, canvas capture
- `manifest.json`: Plugin metadata, defines `ui: "ui.html"` and `main: "code.js"` entry points
- `tsconfig.json`: TypeScript targets ES6 with `@figma/plugin-typings` for Figma API types

## Constraints & Gotchas

- **No network access**: `manifest.json` sets `"allowedDomains": ["none"]` — all assets must be inline
- **Plugin sandbox limitations**: Cannot access DOM, WebGL, or browser APIs in `code.ts`
- **UI iframe limitations**: Cannot access Figma API in `ui.html`
- **Image data transfer**: Use `Uint8Array` for binary data across the postMessage boundary
- **Timeout protection**: 10-second timeout in `createRectangle()` catches stuck shader renders
- **Shader compilation**: Errors logged to console but also trigger `shader-error` message to close gracefully

## ESLint Configuration

Inline eslint config in `package.json` uses:
- `@figma/figma-plugins/recommended` rules specific to Figma plugin development
- Unused vars prefixed with `_` are ignored (common for event handlers)
- TypeScript strict mode enabled in `tsconfig.json`

Run `npm run lint` to check, `npm run lint:fix` for auto-fixes.
