# GLSL Texture & Shaders Figma Plugin

> **Recent Refactorings (November 2025):** Codebase has been optimized to remove redundancies, simplify complex patterns, and improve maintainability. Key changes: replaced manual ref syncing with `useSyncedRef` hook, consolidated duplicate uniform injection logic, removed unused/commented code, and improved type safety.

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
├── ControlPanel (Left sidebar with dynamic uniform controls)
│   ├── PlusIcon (Add new uniform button)
│   ├── SliderControl × N (Float uniforms with delete buttons)
│   ├── ColorControl × N (vec3/vec4 color pickers with delete buttons)
│   └── SaveIcon (Save shader button)
├── ShaderCanvas (WebGL canvas with pause/play toggle)
├── ShaderModal (Advanced shader editor with Ace Editor)
├── UniformConfigModal (Configure new uniform properties - float or color)
├── PresetGallery (Browse preset shaders by category)
├── SaveShaderModal (Save shader with name/description/thumbnail)
└── SavedShadersGallery (Browse, load, and delete saved shaders)
```

**State Management:**
- `useState` for UI state (params, modal visibility, shader code, errors)
- `useRef` for WebGL state (gl context, program, uniforms, animation frame)
- `useSyncedRef` hook for params and dynamicUniforms (keeps refs in sync with state)
- `ensureUniformTypes()` helper for backward compatibility

**Key Hook Pattern:**
```tsx
import { useSyncedRef } from "./hooks/useSyncedRef";

const paramsRef = useSyncedRef(params); // Automatically synced
const dynamicUniformsRef = useSyncedRef(dynamicUniforms);

// Animation loop reads from refs - always has current values
const renderLoop = () => {
  renderShader(canvas, shaderState, {
    ...paramsRef.current,
    dynamicUniforms: dynamicUniformsRef.current
  }, getCurrentTime());
  requestAnimationFrame(renderLoop);
};
```

### Shader Rendering Pipeline
The WebGL shader rendering happens in `src/app/webgl.ts` (extracted from App.tsx):
1. User adjusts dynamic uniforms via SliderControl components
2. Real-time preview renders in `<canvas>` via `requestAnimationFrame`
3. Dynamic uniforms are auto-injected into shader code via `buildFragmentSource()`
4. On "Create Rectangle" click:
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
- `uniforms`: Base uniform locations (position, resolution, time)
- `dynamicUniforms`: Cached locations for user-created uniforms

Dynamic uniforms are:
- Stored in `dynamicUniforms` state array (each with id, name, value, min, max, step)
- Auto-injected into shader source via `buildFragmentSource()` in `webgl.ts`
- Updated every frame in `renderShader()` via `dynamicUniformsRef.current`
- Can be added/removed/modified at runtime via UniformConfigModal

## Project Structure

```
src/
├── app/                          # React UI code
│   ├── components/              # React components
│   │   ├── ControlPanel.tsx    # Dynamic uniform controls sidebar
│   │   ├── ShaderCanvas.tsx    # Canvas with pause/play toggle
│   │   ├── ShaderModal.tsx     # Advanced shader editor with Ace Editor
│   │   ├── SliderControl.tsx   # Reusable slider with delete button
│   │   ├── UniformConfigModal.tsx # Configure new uniform properties
│   │   ├── PlusIcon.tsx        # Add uniform icon button
│   │   └── DeleteIcon.tsx      # Delete uniform icon button
│   ├── App.tsx                  # Main React component (state management)
│   ├── webgl.ts                 # WebGL logic (extracted from App.tsx)
│   ├── index.tsx                # React root mount point
│   ├── shaders.ts               # GLSL shader source constants
│   ├── styles.css               # Tailwind CSS v4 styles
│   └── index.html               # HTML template
└── plugin/                      # Plugin code (Figma API)
    └── controller.ts            # Plugin controller entry point

dist/                            # Build output (auto-generated, git-ignored)
├── code.js                      # Compiled plugin code (~2.9 KB)
├── ui.html                      # Compiled UI with inlined JS/CSS (~839 KB)
└── ui.js                        # Intermediate file (inlined into ui.html)
```

## File Responsibilities

### React Components

- **`src/app/App.tsx`**: Main React component containing:
  - State management for dynamic uniforms, modals, shader code, errors
  - WebGL initialization via `initWebGL()` from webgl.ts
  - Dynamic uniform CRUD operations (add, update, remove)
  - Shader recompilation with `buildFragmentSource()` auto-injection
  - Animation loop management (`renderLoop`)
  - Canvas capture for Figma (`captureShader`)
  - Event handlers for all user interactions
  - Uses `useSyncedRef` hook for params and dynamicUniforms (solves closure issues)
  - `ensureUniformTypes()` helper for backward compatibility (defaults type to 'float')

- **`src/app/webgl.ts`**: WebGL logic containing:
  - `initWebGL()`: Initialize WebGL context, compile shaders, set up uniforms
  - `buildFragmentSource()`: Simplified - now delegates to `injectUniforms()`
  - `injectUniforms()`: Auto-inject dynamic uniform declarations after precision statement
  - `stripInjectedUniforms()`: Remove auto-injected uniforms (excludes base uniforms)
  - `createShader()`: Compile vertex/fragment shaders with error handling
  - `recompileShader()`: Hot-reload shader code with new uniforms
  - `renderShader()`: Render frame with all uniform values (supports float/vec3/vec4)
  - `captureShaderAsImage()`: Capture canvas as PNG for Figma
  - `DynamicUniform` interface: id, name, type, value, min, max, step

- **`src/app/hooks/useSyncedRef.ts`**: Custom hook to keep ref in sync with state
  - Solves closure issues in animation loops
  - Used for `paramsRef` and `dynamicUniformsRef` in App.tsx
  - Ensures refs always have current values in requestAnimationFrame callbacks

- **`src/app/components/ControlPanel.tsx`**: Dynamic uniform controls container:
  - Renders all uniforms from `dynamicUniforms` array
  - PlusIcon button to add new uniforms
  - SliderControl for each uniform with delete button
  - Action buttons: Create, Cancel, Advanced Editor

- **`src/app/components/SliderControl.tsx`**: Reusable slider with:
  - Label, value display, min/max/step controls
  - Optional delete button via `onDelete` prop
  - Custom Tailwind styling with `slider-input` utility

- **`src/app/components/UniformConfigModal.tsx`**: Modal for creating new uniforms:
  - Input for uniform name (validates GLSL identifier rules)
  - Min/max/step/initial value inputs
  - Create/Cancel buttons
  - Validation and error display

- **`src/app/components/ShaderCanvas.tsx`**: Canvas with pause/play toggle:
  - Forwards ref to App.tsx for WebGL context
  - Pause/play button with ⏸︎/⏵︎ icons
  - Toggles animation loop

- **`src/app/components/ShaderModal.tsx`**: Advanced shader editor:
  - React Ace editor component with GLSL syntax highlighting
  - Monokai theme for dark UI consistency
  - Line numbers, auto-indentation
  - Error display as dismissible popup overlay
  - Apply/Reset buttons
  - `onClearError` callback for error dismissal

- **`src/app/components/PlusIcon.tsx`**: Clickable + icon for adding uniforms

- **`src/app/components/DeleteIcon.tsx`**: Clickable × icon for removing uniforms

- **`src/app/shaders.ts`**: GLSL shader source constants (`VERTEX_SHADER`, `FRAGMENT_SHADER`)

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
- **Animation loop closures**: Use `useSyncedRef` hook to keep refs in sync with state for `requestAnimationFrame` loops
  - Import from `./hooks/useSyncedRef`
  - Pattern: `const paramsRef = useSyncedRef(params);`
  - No manual `useEffect` syncing needed
- **Canvas ref forwarding**: ShaderCanvas forwards ref to App.tsx for WebGL context access
- **Modal state**: Controlled via `isModalOpen` state in App.tsx, passed as prop to modals
- **Backward compatibility**: All uniforms default type to 'float' via `ensureUniformTypes()` helper

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
- `dist/code.js`: ~2.9 KB minified plugin controller
- `dist/ui.html`: ~839 KB self-contained HTML with inlined React + Tailwind + Ace Editor
- `dist/ui.js`: Intermediate file (not used by Figma, JS is inlined into ui.html)
- Performance warnings disabled via `performance: { hints: false }` in webpack.config.js

### Dependencies
```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-ace": "^14.0.1",
    "ace-builds": "^1.43.4"
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

### Adding New Uniforms
**Via UI (Recommended)**:
1. Click + icon in ControlPanel
2. Fill in UniformConfigModal (name, min, max, step, value)
3. Uniform auto-injected into shader via `buildFragmentSource()`
4. SliderControl dynamically rendered

**Via Code**:
1. Add to `dynamicUniforms` state array in `App.tsx`
2. `buildFragmentSource()` auto-injects declaration after `precision mediump float;`
3. Uniform location cached in `shaderState.dynamicUniforms`
4. Value updated every frame in `renderShader()`

### Modifying Shader Code
- **Default shader**: Edit `FRAGMENT_SHADER` in `src/app/shaders.ts`
- **Runtime editing**: Use "Advanced Editor" button (Ace Editor with GLSL syntax highlighting)
- **Base shader reference**: `customFragmentShaderRef` tracks clean shader without auto-injected uniforms
- **Shader compilation errors**: Display as dismissible popup overlay with full error log
- **Debug logging**: Extensive console logs with `[functionName]` prefixes throughout pipeline
