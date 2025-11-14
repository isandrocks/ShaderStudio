# GLSL Texture & Shaders Figma Plugin

## Architecture Overview

This is a Figma plugin that renders GLSL shaders in WebGL and applies them as image fills to rectangles. The plugin uses a **two-process architecture**:

1. **Plugin sandbox** (`src/plugin/controller.ts` → `dist/code.js`): Runs in Figma's restricted environment with access to the Figma API
2. **UI iframe** (`src/app/index.ts` → `dist/ui.html`): Runs in a browser context with full DOM/WebGL access but no Figma API access

Communication flows via `postMessage` between the two contexts:
- Plugin → UI: `figma.ui.postMessage({ type: 'render-shader' })`
- UI → Plugin: `parent.postMessage({ pluginMessage: { type: 'shader-rendered', imageData } }, '*')`

## Critical Workflows

### Development Build Process
```bash
npm run build              # Production build (minified, no source maps)
npm run build:watch        # Development build with auto-recompile (recommended)
npm run watch             # Alias for build:watch
```

Webpack bundles the TypeScript source files:
- `src/plugin/controller.ts` → `dist/code.js` (plugin controller)
- `src/app/index.ts` + `src/app/styles.css` → `dist/ui.html` (UI with inlined JS/CSS)

The `dist/` folder is **git-ignored** and generated on each build.

### Testing in Figma
1. Run `npm run build:watch` to enable auto-compilation on file changes
2. In Figma: Plugins → Development → Import plugin from manifest
3. Select `manifest.json` from this directory
4. Changes to `src/plugin/controller.ts` or `src/app/index.ts` will auto-compile
5. Reload plugin in Figma to test changes

## Key Technical Patterns

### Shader Rendering Pipeline
The WebGL shader rendering happens entirely in `src/app/index.ts`:
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
Global `state` object in `src/app/index.ts` holds:
- `gl`/`program`: WebGL context and compiled shader program
- `params`: Live shader parameters (speed, lineCount, amplitude, yOffset, paused)
- `startTime`/`pausedTime`: Animation timing control

Uniforms are updated every frame in `renderShader()` to reflect current param values.

## Project Structure

```
src/
├── app/                          # UI code (WebGL shader rendering)
│   ├── index.html               # HTML template
│   ├── index.ts                 # UI entry point with WebGL logic
│   └── styles.css               # UI styles
└── plugin/                      # Plugin code (Figma API)
    └── controller.ts            # Plugin controller entry point

dist/                            # Build output (auto-generated, git-ignored)
├── code.js                      # Compiled plugin code
└── ui.html                      # Compiled UI with inlined JS/CSS
```

## File Responsibilities

- `src/plugin/controller.ts`: Figma API interactions, rectangle creation, image fill application, message routing
- `src/app/index.ts`: Complete WebGL setup, GLSL shader source, parameter controls, canvas capture
- `src/app/styles.css`: All UI styling (imported into index.ts)
- `src/app/index.html`: HTML template (JavaScript is inlined by Webpack during build)
- `manifest.json`: Plugin metadata, defines `ui: "dist/ui.html"` and `main: "dist/code.js"` entry points
- `webpack.config.js`: Webpack configuration with dual entry points, loaders, and HTML inlining
- `tsconfig.json`: TypeScript targets ES6 with DOM types and `@figma/plugin-typings`

## Constraints & Gotchas

- **No network access**: `manifest.json` sets `"allowedDomains": ["none"]` — all assets must be inline
- **Plugin sandbox limitations**: Cannot access DOM, WebGL, or browser APIs in `src/plugin/controller.ts`
- **UI iframe limitations**: Cannot access Figma API in `src/app/index.ts`
- **Image data transfer**: Use `Uint8Array` for binary data across the postMessage boundary
- **Timeout protection**: 10-second timeout in `createRectangle()` catches stuck shader renders
- **Shader compilation**: Errors logged to console but also trigger `shader-error` message to close gracefully
- **Webpack inlining**: All UI JavaScript must be inlined into `dist/ui.html` (handled automatically by `HtmlWebpackInlineSourcePlugin`)
- **Source maps**: Must use `inline-source-map` in development due to Figma's sandbox eval limitations

## Webpack Build System

### Key Features
- **Two entry points**: `ui` (src/app/index.ts) and `code` (src/plugin/controller.ts)
- **TypeScript compilation**: Via `ts-loader` with `transpileOnly: true` for fast builds
- **CSS processing**: `style-loader` + `css-loader` to inject styles into DOM
- **HTML generation**: `HtmlWebpackPlugin` creates ui.html from template
- **JS inlining**: `HtmlWebpackInlineSourcePlugin` embeds all JS into HTML (required for Figma)
- **Development mode**: Includes inline source maps for debugging
- **Production mode**: Minified output with no source maps

### Build Output
- `dist/code.js`: ~2.3 KB minified plugin controller
- `dist/ui.html`: ~35 KB self-contained HTML with inlined JS and CSS
- `dist/ui.js`: Intermediate file (not used by Figma, JS is inlined into ui.html)

## ESLint Configuration

Inline eslint config in `package.json` uses:
- `@figma/figma-plugins/recommended` rules specific to Figma plugin development
- Unused vars prefixed with `_` are ignored (common for event handlers)
- TypeScript strict mode enabled in `tsconfig.json`

Run `npm run lint` to check, `npm run lint:fix` for auto-fixes.

Note: ESLint may show errors for `webpack.config.js` (CommonJS require statements) - this is expected and can be ignored as Webpack configs use CommonJS by convention.
