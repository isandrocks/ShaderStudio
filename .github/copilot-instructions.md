# GLSL Texture & Shaders Figma Plugin

## Architecture Overview

This is a Figma plugin that renders GLSL shaders in WebGL and applies them as image fills to rectangles. The plugin uses a **two-process architecture** with a **React + Tailwind CSS v4** frontend:

1. **Plugin sandbox** (`src/plugin/controller.ts` → `dist/code.js`): Runs in Figma's restricted environment with access to the Figma API
2. **UI iframe** (React app in `src/app/` → `dist/ui.html`): Runs in a browser context with full DOM/WebGL access but no Figma API access

Communication flows via `postMessage` between the two contexts:
- Plugin → UI: `figma.ui.postMessage({ type: 'render-shader' })`
- UI → Plugin: `parent.postMessage({ pluginMessage: { type: 'shader-rendered', imageData } }, '*')`

### Tech Stack
- **React 19.2**: Functional components with hooks for state management
- **Tailwind CSS v4.1**: Utility-first CSS with `@theme` variables and `@utility` API
- **TypeScript 5.3**: Type-safe development with JSX support
- **Webpack 4**: Module bundler with PostCSS v4 integration
- **WebGL**: Real-time GLSL shader rendering

## Critical Workflows

### Development Build Process
```bash
npm run build              # Production build (minified, no source maps)
npm run build:watch        # Development build with auto-recompile (recommended)
npm run watch             # Alias for build:watch
```

Webpack bundles the TypeScript/React source files:
- `src/plugin/controller.ts` → `dist/code.js` (plugin controller)
- `src/app/index.tsx` + React components + `src/app/styles.css` → `dist/ui.html` (UI with inlined JS/CSS)

The `dist/` folder is **git-ignored** and generated on each build.

### Testing in Figma
1. Run `npm run build:watch` to enable auto-compilation on file changes
2. In Figma: Plugins → Development → Import plugin from manifest
3. Select `manifest.json` from this directory
4. Changes to any `src/` files will auto-compile
5. Reload plugin in Figma (Cmd/Ctrl+Option/Alt+P) to test changes

## Key Technical Patterns

### React Component Architecture

The UI follows a modular component structure:

```
App.tsx (Main Component)
├── ControlPanel (Left sidebar with parameter controls)
│   └── SliderControl × 4 (Speed, Line Count, Amplitude, Y Offset)
├── ShaderCanvas (WebGL canvas with pause overlay)
└── ShaderModal (Advanced shader code editor)
```

**State Management:**
- `useState` for UI state (params, modal visibility, shader code, errors)
- `useRef` for WebGL state (gl context, program, uniforms, animation frame)
- `paramsRef` pattern to solve closure issues in animation loops (refs always have current values)

**Key Hook Pattern:**
```tsx
const paramsRef = useRef(params);
useEffect(() => {
  paramsRef.current = params; // Keep ref in sync
}, [params]);
// Animation loop reads from paramsRef.current to get latest values
```

### Shader Rendering Pipeline
The WebGL shader rendering happens in `src/app/App.tsx`:
1. User adjusts parameters via SliderControl components
2. Real-time preview renders in `<canvas>` via `requestAnimationFrame`
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
`shaderStateRef` in `App.tsx` holds:
- `gl`: WebGL context
- `program`: Compiled shader program
- `uniforms`: Locations for all shader uniforms (position, resolution, time, speed, lineCount, amplitude, yOffset)

Uniforms are updated every frame in `renderShader()` to reflect current param values from `paramsRef.current`.

## Project Structure

```
src/
├── app/                          # React UI code
│   ├── components/              # React components
│   │   ├── ControlPanel.tsx    # Parameter controls sidebar
│   │   ├── ShaderCanvas.tsx    # Canvas with pause overlay
│   │   ├── ShaderModal.tsx     # Advanced shader editor modal
│   │   └── SliderControl.tsx   # Reusable slider input
│   ├── App.tsx                  # Main React component (WebGL logic)
│   ├── index.tsx                # React root mount point
│   ├── shaders.ts               # GLSL shader source constants
│   ├── styles.css               # Tailwind CSS v4 styles
│   └── index.html               # HTML template
└── plugin/                      # Plugin code (Figma API)
    └── controller.ts            # Plugin controller entry point

dist/                            # Build output (auto-generated, git-ignored)
├── code.js                      # Compiled plugin code (~2.3 KB)
├── ui.html                      # Compiled UI with inlined JS/CSS (~228 KB)
└── ui.js                        # Intermediate file (inlined into ui.html)
```

## File Responsibilities

### React Components

- **`src/app/App.tsx`**: Main React component containing:
  - WebGL initialization (`initWebGL`, `createShader`)
  - Shader compilation and recompilation (`recompileShader`)
  - Animation loop management (`renderLoop`, `renderShader`)
  - Canvas capture for Figma (`captureShader`)
  - Event handlers for all user interactions
  - State management with hooks and refs

- **`src/app/components/ControlPanel.tsx`**: Container for all parameter controls and action buttons (Create, Cancel, Advanced Editor)

- **`src/app/components/SliderControl.tsx`**: Reusable slider component with label, value display, and custom styling

- **`src/app/components/ShaderCanvas.tsx`**: Canvas element with pause checkbox overlay (forwards ref to App.tsx for WebGL context)

- **`src/app/components/ShaderModal.tsx`**: Modal dialog for editing raw GLSL fragment shader code with error display

- **`src/app/shaders.ts`**: GLSL shader source code constants (`VERTEX_SHADER`, `FRAGMENT_SHADER`)

### Core Files

- **`src/app/index.tsx`**: React application entry point (mounts App to `#root` div)
- **`src/app/styles.css`**: Tailwind CSS v4 with `@theme` variables and `@utility slider-input` definition
- **`src/plugin/controller.ts`**: Figma API interactions, rectangle creation, image fill application, message routing
- **`manifest.json`**: Plugin metadata, defines `ui: "dist/ui.html"` and `main: "dist/code.js"` entry points
- **`webpack.config.js`**: Webpack 4 configuration with dual entry points, loaders, and HTML inlining
- **`postcss.config.js`**: PostCSS configuration for `@tailwindcss/postcss` plugin
- **`tsconfig.json`**: TypeScript config with `"jsx": "react"` for TSX support

## Tailwind CSS v4 Integration

### Configuration Approach
Tailwind CSS v4 uses **CSS-first configuration** (no `tailwind.config.js`):

**`styles.css`:**
```css
@import "tailwindcss";

@theme {
  --color-primary: #0d99ff;
  --color-primary-hover: #3daeff;
  --color-primary-active: #0a7acc;
}

@utility slider-input {
  /* Custom utility with nested pseudo-selectors */
  &::-webkit-slider-thumb { /* ... */ }
  &::-moz-range-thumb { /* ... */ }
}
```

**Key Features:**
- `@theme` directive defines custom CSS variables (replaces `tailwind.config.js` theme extension)
- `@utility` API creates reusable utilities with nested selectors (replaces `@layer components`)
- Theme variables accessible in components via Tailwind classes (`bg-primary`, `text-primary-hover`)
- Custom slider styling centralized in one utility class

### PostCSS Setup
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}
```

No `autoprefixer` needed (built into Tailwind v4).

## Constraints & Gotchas

### General
- **No network access**: `manifest.json` sets `"allowedDomains": ["none"]` — all assets must be inline
- **Plugin sandbox limitations**: Cannot access DOM, WebGL, or browser APIs in `src/plugin/controller.ts`
- **UI iframe limitations**: Cannot access Figma API in React components
- **Image data transfer**: Use `Uint8Array` for binary data across the postMessage boundary
- **Timeout protection**: 10-second timeout in `createRectangle()` catches stuck shader renders
- **Webpack inlining**: All UI JavaScript must be inlined into `dist/ui.html` (handled automatically by `HtmlWebpackInlineSourcePlugin`)
- **Source maps**: Must use `inline-source-map` in development due to Figma's sandbox eval limitations

### React-Specific
- **Animation loop closures**: Use `useRef` + `useEffect` pattern to keep refs in sync with state for `requestAnimationFrame` loops
- **Canvas ref forwarding**: ShaderCanvas forwards ref to App.tsx for WebGL context access
- **Modal state**: Controlled via `isModalOpen` state in App.tsx, passed as prop to ShaderModal

### Tailwind CSS v4
- **No config file**: Configuration is CSS-based via `@theme` directive
- **New syntax**: `@import "tailwindcss"` replaces `@tailwind` directives
- **CSS variables**: Theme values accessed as `var(--color-primary)` in custom CSS
- **Utility API**: `@utility` with nested selectors replaces `@layer components`
- **Webpack 4 compatibility**: Must use `postcss-loader@^4` (v8+ requires Webpack 5)

## Webpack Build System

### Key Features
- **Two entry points**: `ui` (src/app/index.tsx) and `code` (src/plugin/controller.ts)
- **TypeScript compilation**: Via `ts-loader` with `transpileOnly: true` for fast builds
- **CSS processing**: `style-loader` + `css-loader` + `postcss-loader@^4` for Tailwind v4
- **PostCSS v4 integration**: Explicit config path in `postcss-loader` options
- **HTML generation**: `HtmlWebpackPlugin` creates ui.html from template
- **JS inlining**: `HtmlWebpackInlineSourcePlugin` embeds all JS into HTML (required for Figma)
- **Development mode**: Includes inline source maps for debugging
- **Production mode**: Minified output with no source maps

### Build Output
- `dist/code.js`: ~2.3 KB minified plugin controller
- `dist/ui.html`: ~228 KB self-contained HTML with inlined React + Tailwind
- `dist/ui.js`: Intermediate file (not used by Figma, JS is inlined into ui.html)

### Dependencies
```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.1.17",
    "@tailwindcss/postcss": "^4.1.17",
    "postcss": "^8.5.6",
    "postcss-loader": "^4.3.0",
    "typescript": "^5.3.2",
    "webpack": "^4.39.1",
    "@types/react": "^19.2.4",
    "@types/react-dom": "^19.2.3"
  }
}
```

## ESLint Configuration

Inline eslint config in `package.json` uses:
- `@figma/figma-plugins/recommended` rules specific to Figma plugin development
- `@typescript-eslint/recommended` for TypeScript linting
- Unused vars prefixed with `_` are ignored (common for event handlers)
- TypeScript strict mode enabled in `tsconfig.json`

Run `npm run lint` to check, `npm run lint:fix` for auto-fixes.

## Development Tips

### Hot Reloading
Run `npm run build:watch` during development. After making changes:
1. Webpack auto-compiles (watch for "Compiled successfully" in terminal)
2. In Figma, reload plugin (Cmd/Ctrl+Option/Alt+P, then rerun plugin)

### Debugging
- Use browser DevTools in Figma plugin window (right-click → Inspect)
- Check console for WebGL errors, shader compilation issues, or React errors
- Inline source maps enabled in development builds for easier debugging

### Adding New Parameters
1. Add to `params` state in `App.tsx`
2. Add uniform to `uniforms` interface and `initWebGL()`
3. Update `renderShader()` to set uniform value from `paramsRef.current`
4. Add SliderControl in `ControlPanel.tsx`
5. Add corresponding GLSL uniform in `FRAGMENT_SHADER` (`shaders.ts`)

### Modifying Shader Code
- Default shader: Edit `FRAGMENT_SHADER` in `src/app/shaders.ts`
- Runtime editing: Use "Advanced Editor" button to test custom GLSL code
- Shader compilation errors display in modal and browser console
