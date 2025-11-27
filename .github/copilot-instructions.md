# GLSL Texture & Shaders Figma Plugin

> **Recent Refactorings (November 2025):** Major architectural refactoring completed. App.tsx reduced from 640 to 294 lines (54% reduction) through extraction of business logic into modular hooks and handlers. Codebase now follows clean separation of concerns with App.tsx serving purely as component composition and layout. All files adhere to 550-line maximum guideline.

> **Documentation Note:** All refactoring summaries, migration guides, and change documentation should be stored in the `change logs/` folder. Do NOT create summary documents in the root directory or other locations.

## Architecture Overview

This is a Figma plugin that renders GLSL shaders in WebGL and applies them as image fills to rectangles. The plugin uses a **two-process architecture** with a **React + Tailwind CSS v4** frontend. It features two distinct editing modes:
1.  **Code Mode**: Direct GLSL editing with dynamic uniforms
2.  **Layer Builder**: Visual composition of effects (gradients, noise, shapes) without coding

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

### Design System
The UI follows **Figma's dark theme** design patterns:
- Dark backgrounds (#1e1e1e, #2a2a2a)
- Input fields: `bg-[#383838] border border-[#444444]`
- Primary blue (#0d99ff) for interactive elements
- Subtle borders (#3c3c3c)
- High contrast text (white/gray-300)
- Consistent spacing and hover states
- Reference: `figma-kit` components for styling patterns

## Critical Workflows

### Development Build Process
```bash
npm run build              # Production build (minified, no source maps)
npm run build:watch        # Development build with auto-recompile (recommended)
npm run watch             # Alias for build:watch
```

Webpack bundles the TypeScript/React source files:
- `src/plugin/controller.ts` → `dist/code.js` (plugin controller ~7 KB)
- `src/app/index.tsx` + React components + `src/app/styles.css` → `dist/ui.html` (UI with inlined JS/CSS ~1.5 MB)

The `dist/` folder is **git-ignored** and generated on each build.

### Testing in Figma
1. Run `npm run build:watch` to enable auto-compilation on file changes
2. In Figma: Plugins → Development → Import plugin from manifest
3. Select `manifest.json` from this directory
4. Changes to any `src/` files will auto-compile
5. Reload plugin in Figma (Cmd/Ctrl+Option/Alt+P) to test changes

## Code Organization Principles

### File Size Guidelines
**CRITICAL**: Files must be refactored when they exceed **550 lines**. This ensures:
- Maintainability and readability
- Logical separation of concerns
- Easier testing and debugging
- Better code navigation

### Icon Management
**CRITICAL**: All SVG icon components must be placed in `src/app/components/icons/`.
- Do not place icon files directly in `src/app/components/`.
- Use the existing icon components as templates for new icons.
- Ensure icons use `currentColor` for fill/stroke to support theming.

### App.tsx Architecture
**`App.tsx` is ONLY for component composition and layout**. It should:
- ✅ Import components and hooks
- ✅ Declare state with `useState` and `useRef`
- ✅ Call custom hooks and handler factories
- ✅ Render JSX with Tailwind CSS classes
- ❌ NO inline function implementations
- ❌ NO business logic
- ❌ NO WebGL code
- ❌ NO API calls

**Current App.tsx structure** (294 lines):
```tsx
import { hooks } from "./hooks";
import { handlers } from "./handlers";

const App: React.FC = () => {
  // State declarations (60 lines)
  const [state] = useState(...)
  const [viewMode, setViewMode] = useState<"builder" | "code">("code");
  
  // Refs (20 lines)
  const ref = useRef(...)
  
  // Hooks (40 lines)
  const { methods } = useCustomHook(...)
  const { handlers } = createHandlers(...)
  
  // Lifecycle (20 lines)
  useShaderLifecycle(...)
  
  // JSX layout (150 lines)
  return (
    <div>
      {viewMode === "builder" ? <LayerPanel /> : <ControlPanel />}
      <ShaderCanvas />
    </div>
  );
};
```

### Modular Architecture

The codebase is organized into clear domains:

```
src/app/
├── App.tsx                    # Component composition ONLY (294 lines)
├── components/                # UI components (each <350 lines)
│   ├── color-picker/         # Modular color picker (6 files)
│   ├── layers/               # Layer Builder components
│   │   ├── LayerPanel.tsx    # Main layer list interface
│   │   ├── LayerProperties.tsx # Layer settings
│   │   └── EffectPicker.tsx  # Effect selection modal
│   ├── video-export/         # Video export utilities
│   └── [28 component files]
├── hooks/                     # Custom React hooks
│   ├── useShaderEngine.ts    # WebGL rendering engine (175 lines)
│   ├── useShaderLifecycle.ts # Lifecycle & message handling (189 lines)
│   ├── useSyncedRef.ts       # Ref syncing utility
│   └── index.ts              # Hook exports
├── handlers/                  # Business logic factories
│   ├── uniformHandlers.ts    # Uniform CRUD (60 lines)
│   ├── layerHandlers.ts      # Layer CRUD (80 lines)
│   ├── shaderLoadHandlers.ts # Preset/shader loading (70 lines)
│   ├── figmaHandlers.ts      # Figma API comm (50 lines)
│   ├── modalHandlers.ts      # Modal operations (50 lines)
│   ├── videoExportHandler.ts # Video export (50 lines)
│   └── index.ts              # Handler exports
├── utils/                     # Pure utility functions
│   ├── shaderUtils.ts        # Shader utilities (110 lines)
│   └── layerShaderGenerator.ts # Layer composition logic (175 lines)
├── webgl.ts                   # WebGL core logic (240 lines)
├── types.ts                   # TypeScript type definitions
├── presets.ts                 # Shader presets
├── layerTemplates.tsx         # Layer effect definitions
├── constants.ts               # App constants
└── styles.css                 # Tailwind CSS v4
```

## Key Technical Patterns

### React Component Architecture

Component hierarchy:

```
App.tsx (Pure composition - NO business logic)
├── ControlPanel (Code Mode Sidebar)
│   ├── SliderControl × N (Float uniforms)
│   └── ColorControl × N (Color pickers)
├── LayerPanel (Builder Mode Sidebar)
│   ├── LayerList (Draggable layers)
│   ├── LayerProperties (Effect settings)
│   └── EffectPicker (Add new layer)
├── ShaderCanvas (WebGL canvas with pause/play)
├── ShaderModal (Ace Editor for shader code)
├── UniformConfigModal (Add new uniform)
├── PresetGallery (Browse shader presets)
├── SaveShaderModal (Save custom shader)
├── SavedShadersGallery (Load/delete saved shaders)
└── VideoExportModal (Export video settings)
```

### State Management Pattern

```tsx
// App.tsx - State declaration ONLY
const [state, setState] = useState(initialValue);
const ref = useRef(initialValue);

// Synced refs for animation loops (solves closure issues)
const stateRef = useSyncedRef(state);

// Custom hooks handle complex logic
const { methods } = useShaderEngine({
  // Dependencies passed as params
});

// Handler factories for grouped operations
const { handlers } = createUniformHandlers(
  dependencies...
);
```

### Custom Hooks Architecture

**`hooks/useShaderEngine.ts`** (175 lines)
- Core WebGL rendering engine
- Methods: `renderLoop()`, `captureShader()`, `handleRecompileShader()`, `getCurrentTime()`
- Manages animation frame loop
- Handles shader compilation errors

**`hooks/useShaderLifecycle.ts`** (189 lines)
- Component lifecycle management
- WebGL initialization and cleanup
- Figma postMessage event handling
- Shader recompilation on uniform changes

**`hooks/useSyncedRef.ts`** (30 lines)
- Keeps refs in sync with state
- Solves closure issues in `requestAnimationFrame` loops
- Pattern: `const ref = useSyncedRef(state);`

### Handler Factory Pattern

Handler factories use **dependency injection** for testability:

```tsx
// handlers/uniformHandlers.ts
export const createUniformHandlers = (
  dynamicUniforms: DynamicUniform[],
  setDynamicUniforms: Dispatch<SetStateAction<DynamicUniform[]>>,
  setOpenModal: (modal: "none") => void,
  setCriticalError: (error: string | null) => void
) => {
  const addUniform = (config: UniformConfig) => { /* ... */ };
  const updateUniform = (id: string, value: UniformValue) => { /* ... */ };
  const removeUniform = (id: string) => { /* ... */ };
  
  return { addUniform, updateUniform, removeUniform };
};
```

### Layer Composition System

The Layer Builder allows visual composition of shaders:
1.  User adds layers (gradients, shapes, noise) via `LayerPanel`
2.  `generateLayeredShader()` constructs GLSL code:
    - Injects blend mode functions
    - Injects effect template functions
    - Composes layers using `mix()` operations
3.  Resulting shader is passed to `useShaderEngine`
4.  Layer properties are mapped to dynamic uniforms

### Shader Rendering Pipeline

1. User adjusts dynamic uniforms via controls
2. Real-time preview renders via `requestAnimationFrame` in `useShaderEngine`
3. Dynamic uniforms auto-injected into shader code via `buildFragmentSource()`
4. On "Apply to Selection" or "Create Rectangle":
   - Plugin sends `render-shader` message to UI
   - `useShaderEngine.captureShader()` captures canvas as PNG with supersampling (2x resolution)
   - UI sends `Uint8Array` image data back to plugin
   - Plugin converts to Figma image and applies as `IMAGE` fill type

### Message Type Protocol

All cross-boundary messages use a `type` discriminator:

**UI → Plugin:**
- `'apply-to-selection'`: Apply shader to selected rectangle
- `'create-rectangle'`: Create new 512×512 rectangle
- `'get-selection-dimensions'`: Request selection size for overlay
- `'load-shaders'`: Request saved shaders from storage
- `'save-shader'`: Save shader with metadata
- `'delete-shader'`: Delete saved shader by ID

**Plugin → UI:**
- `'render-shader'`: Trigger shader capture
- `'selection-info'`: Selected object dimensions (shows overlay)
- `'selection-dimensions'`: Dimensions for overlay toggle
- `'selection-error'`: Selection validation error
- `'shaders-loaded'`: Saved shaders list
- `'shader-saved'`: Shader saved successfully
- `'shader-deleted'`: Shader deleted successfully
- `'storage-error'`: Storage operation failed

### Dynamic Uniforms System

Dynamic uniforms are:
- Stored in `dynamicUniforms` state array
- Each has: `id`, `name`, `type` (float/vec3/vec4), `value`, `min`, `max`, `step`
- Auto-injected into shader source after `precision mediump float;`
- Cached locations in `shaderState.dynamicUniforms`
- Updated every frame via `renderShader()`
- Can be added/removed/modified at runtime

**Uniform Types:**
- `float`: Single number (slider control)
- `vec3`: RGB color (color picker, no alpha)
- `vec4`: RGBA color (color picker with alpha)

## Project Structure

```
src/
├── app/                              # React UI code
│   ├── components/                   # UI components
│   │   ├── color-picker/            # Modular color picker (6 files)
│   │   │   ├── ColorPicker.tsx      # Main component with HSV state
│   │   │   ├── ColorPickerArea.tsx  # 2D saturation/value selector
│   │   │   ├── ColorPickerHue.tsx   # Hue slider with pointer capture
│   │   │   ├── ColorPickerAlpha.tsx # Alpha/transparency slider
│   │   │   ├── ColorPickerInput.tsx # Hex input field
│   │   │   ├── utils.ts             # RGB/HSV conversions
│   │   │   └── index.ts             # Exports
│   │   ├── video-export/            # Video export module
│   │   │   ├── videoExportUtils.ts  # Export pipeline (289 lines)
│   │   │   └── index.ts             # Exports
│   │   ├── BaseModal.tsx            # Reusable modal component
│   │   ├── ColorControl.tsx         # Color uniform control (100 lines)
│   │   ├── ControlPanel.tsx         # Left sidebar controls
│   │   ├── PresetGallery.tsx        # Preset browser with categories
│   │   ├── SavedShadersGallery.tsx  # Saved shader management
│   │   ├── SaveShaderModal.tsx      # Save shader dialog
│   │   ├── ShaderCanvas.tsx         # Canvas with pause/play
│   │   ├── ShaderModal.tsx          # Ace Editor for shaders
│   │   ├── SliderControl.tsx        # Float uniform slider
│   │   ├── UniformConfigModal.tsx   # Add uniform dialog
│   │   ├── VideoExportModal.tsx     # Video export dialog
│   │   └── [Icon components]        # Plus, Delete, Save, Edit, etc.
│   ├── hooks/                        # Custom React hooks
│   │   ├── useShaderEngine.ts       # WebGL rendering engine (175 lines)
│   │   ├── useShaderLifecycle.ts    # Lifecycle management (189 lines)
│   │   ├── useSyncedRef.ts          # Ref syncing utility (30 lines)
│   │   └── index.ts                 # Hook exports
│   ├── handlers/                     # Business logic factories
│   │   ├── uniformHandlers.ts       # Uniform CRUD (60 lines)
│   │   ├── shaderLoadHandlers.ts    # Preset/shader loading (70 lines)
│   │   ├── figmaHandlers.ts         # Figma API (50 lines)
│   │   ├── modalHandlers.ts         # Modal operations (50 lines)
│   │   ├── videoExportHandler.ts    # Video export (50 lines)
│   │   └── index.ts                 # Handler exports
│   ├── utils/                        # Pure utility functions
│   │   └── shaderUtils.ts           # Shader utilities (110 lines)
│   ├── generated/                    # Auto-generated files
│   │   └── preset-thumbnails.ts     # Preset images (large)
│   ├── App.tsx                       # Component composition ONLY (294 lines)
│   ├── webgl.ts                      # WebGL core logic (240 lines)
│   ├── types.ts                      # TypeScript definitions
│   ├── presets.ts                    # Shader presets with metadata
│   ├── shaders.ts                    # GLSL source constants
│   ├── constants.ts                  # App constants
│   ├── styles.css                    # Tailwind CSS v4
│   ├── index.html                    # HTML template
│   └── index.tsx                     # React entry point
└── plugin/                           # Plugin code (Figma API)
    └── controller.ts                 # Plugin controller (350 lines)

dist/                                 # Build output (git-ignored)
├── code.js                           # Compiled plugin (~7 KB)
├── ui.html                           # Compiled UI (~1.5 MB inlined)
└── ui.js                             # Intermediate (inlined into ui.html)
```

## File Responsibilities

### Core Application Files

**`src/app/App.tsx`** (294 lines) - **COMPOSITION ONLY**
- ✅ Import statements (hooks, handlers, components)
- ✅ State declarations with `useState`
- ✅ Ref declarations with `useRef`
- ✅ Synced refs with `useSyncedRef`
- ✅ Hook calls (`useShaderEngine`, `useShaderLifecycle`)
- ✅ Handler factory calls (uniform, shader, figma, modal, video handlers)
- ✅ JSX layout with Tailwind CSS classes
- ❌ NO function implementations
- ❌ NO business logic
- ❌ NO useEffect hooks (moved to useShaderLifecycle)

**`src/app/webgl.ts`** (240 lines) - WebGL Core
- `initWebGL()`: Initialize context, compile shaders, set up uniforms
- `buildFragmentSource()`: Delegates to `injectUniforms()`
- `injectUniforms()`: Auto-inject uniform declarations
- `stripInjectedUniforms()`: Remove injected uniforms
- `createShader()`: Compile shaders with error handling
- `recompileShader()`: Hot-reload with new uniforms
- `renderShader()`: Render frame with all uniform values
- `captureShaderAsImage()`: Capture canvas as PNG

**`src/app/types.ts`** - TypeScript Definitions
- `ShaderState`: WebGL state interface
- `DynamicUniform`: Uniform configuration
- `UniformType`: 'float' | 'vec3' | 'vec4'
- `UniformValue`: number | [number, number, number] | [number, number, number, number]
- `SavedShader`: Persisted shader metadata
- `ModalType`: Modal state discriminator
- All shared interfaces

**`src/app/types.ts`** - TypeScript Definitions
- `ShaderState`: WebGL state interface
- `DynamicUniform`: Uniform configuration
- `UniformType`: 'float' | 'vec3' | 'vec4'
- `UniformValue`: number | [number, number, number] | [number, number, number, number]
- `SavedShader`: Persisted shader metadata
- `ModalType`: Modal state discriminator
- All shared interfaces

### Custom Hooks

**`hooks/useShaderEngine.ts`** (175 lines) - WebGL Rendering Engine
- Returns: `getCurrentTime`, `renderLoop`, `captureShader`, `handleRecompileShader`, `handleShaderError`
- Manages WebGL rendering pipeline
- Handles animation frame loop
- Canvas capture with 2x supersampling
- Shader compilation error handling
- Dependencies injected via parameters

**`hooks/useShaderLifecycle.ts`** (189 lines) - Lifecycle Management
- WebGL initialization on mount
- Figma postMessage event listener
- Shader recompilation on uniform changes
- Cleanup on unmount
- Message routing for all plugin communication

**`hooks/useSyncedRef.ts`** (30 lines) - Ref Syncing Utility
- Keeps refs in sync with state
- Solves closure issues in `requestAnimationFrame`
- Pattern: `const ref = useSyncedRef(state);`
- Auto-updates on state changes

### Handler Factories

**`handlers/uniformHandlers.ts`** (60 lines) - Uniform CRUD
- Factory: `createUniformHandlers()`
- Returns: `addUniform`, `updateUniform`, `removeUniform`
- Unique name generation
- Error handling

**`handlers/layerHandlers.ts`** (80 lines) - Layer CRUD
- Factory: `createLayerHandlers()`
- Returns: `addLayer`, `removeLayer`, `updateLayer`, `reorderLayers`
- Manages layer state and property updates

**`handlers/shaderLoadHandlers.ts`** (70 lines) - Shader Loading
- Factory: `createShaderLoadHandlers()`
- Returns: `loadPreset`, `loadSavedShader`, `deleteSavedShader`
- Backward compatibility with `ensureUniformTypes()`
- Auto-recompilation on load

**`handlers/figmaHandlers.ts`** (50 lines) - Figma API
- Factory: `createFigmaHandlers()`
- Returns: `handlePauseChange`, `handleApplyToSelection`, `handleCreateRectangle`, `handleToggleOverlay`
- Time management for pause state
- postMessage communication

**`handlers/modalHandlers.ts`** (50 lines) - Modal Operations
- Factory: `createModalHandlers()`
- Returns: `handleApplyShader`, `handleResetShader`
- Strips/injects uniforms
- Snapshot-based reset

**`handlers/videoExportHandler.ts`** (50 lines) - Video Export
- Factory: `createVideoExportHandler()`
- Returns: `handleExportVideo`
- Uses `videoExportUtils.exportShaderVideo()`
- Loading state management

### Component Modules

**`components/color-picker/`** (6 files, ~400 lines total)
- `ColorPicker.tsx`: Main component with HSV state management via useRef
- `ColorPickerArea.tsx`: 2D saturation/value selector with pointer capture
- `ColorPickerHue.tsx`: Hue slider with pointer capture (preserves hue at 0 saturation)
- `ColorPickerAlpha.tsx`: Alpha/transparency slider
- `ColorPickerInput.tsx`: Editable hex color input
- `utils.ts`: RGB/HSV conversions, hex parsing/formatting
- `index.ts`: Exports all components

**`components/video-export/`** (2 files)
- `videoExportUtils.ts` (289 lines): Complete video export pipeline
  - `createOffscreenCanvas()`: 1080p canvas setup
  - `renderFrame()`: Frame rendering with time calculation
  - `exportShaderVideo()`: MediaRecorder API integration
  - `downloadVideo()`: Blob download
  - Supports normal/bounce playback modes
- `index.ts`: Exports utilities

**`components/layers/`** (Layer Builder)
- `LayerPanel.tsx`: Main list view with drag-and-drop reordering
- `LayerProperties.tsx`: Property editors for selected layer
- `EffectPicker.tsx`: Grid of available effects to add
- `LayerItem.tsx`: Individual layer row with visibility toggle

**`components/ColorControl.tsx`** (100 lines) - Color Uniform Control
- Imports modular color-picker
- Displays color swatch
- Delete button
- Type support for vec3/vec4

**`components/ControlPanel.tsx`** - Controls Sidebar
- Renders all dynamic uniforms
- Add uniform button
- Action buttons (Apply, Create, Presets, Save)
- Video export button

**`components/ShaderCanvas.tsx`** - Canvas Component
- WebGL canvas ref forwarding
- Pause/play toggle button
- Aspect ratio overlay
- Overlay toggle button

**`components/ShaderModal.tsx`** - Shader Editor
- React Ace editor with GLSL highlighting
- Monokai theme for Figma dark UI
- Error display overlay
- Apply/Reset buttons

**`components/UniformConfigModal.tsx`** - Add Uniform Dialog
- Uniform type selection (float/color)
- Name input with GLSL validation
- Min/max/step/value inputs
- Color type supports vec3/vec4

**`components/PresetGallery.tsx`** - Preset Browser
- Categorized shader presets
- Thumbnail previews
- Click to load preset

**`components/SavedShadersGallery.tsx`** - Saved Shader Management
- List saved shaders
- Load/delete operations
- Thumbnail previews

**`components/SaveShaderModal.tsx`** - Save Shader Dialog
- Name and description inputs
- Auto-generated thumbnail from canvas
- Saves to Figma storage

**`components/VideoExportModal.tsx`** - Video Export Settings
- Duration input (seconds)
- FPS selection (24/30/60)
- Playback mode (normal/bounce)
- Export button with loading state

### Utility Modules

**`utils/shaderUtils.ts`** (110 lines) - Shader Utilities
- `ensureUniformTypes()`: Backward compatibility (defaults to 'float')
- `generateUniqueUniformName()`: Appends _1, _2, etc. to duplicate names
- `createDynamicUniform()`: Factory for new uniform objects
- `calculateCaptureResolution()`: 2x supersampling for high-quality captures

**`utils/layerShaderGenerator.ts`** (175 lines) - Layer Composition
- `generateLayeredShader()`: Main composition function
- Injects blend mode helper functions
- Injects used template functions
- Generates `main()` function with layer blending logic
- Cleans up previous injections to prevent duplication

**`webgl.ts`** (240 lines) - WebGL Core
- `initWebGL()`: Context creation, shader compilation, uniform setup
- `buildFragmentSource()`: Delegates to `injectUniforms()`
- `injectUniforms()`: Auto-inject uniform declarations after precision
- `stripInjectedUniforms()`: Remove auto-injected uniforms for clean saves
- `createShader()`: Compile with error handling
- `recompileShader()`: Hot-reload with error callback
- `renderShader()`: Frame rendering with all uniforms (float/vec3/vec4)
- `captureShaderAsImage()`: PNG capture with callback

### Configuration Files

**`src/app/presets.ts`** - Shader Presets
- Array of `ShaderPreset` objects
- Each with: name, category, description, fragmentShader, defaultUniforms, thumbnail
- Categories: Patterns, Colors, Effects, Noise, Gradients

**`src/app/layerTemplates.tsx`** - Layer Definitions
- Array of `EffectTemplate` objects
- Defines available effects for Layer Builder
- Contains GLSL snippets and default properties

**`src/app/constants.ts`** - App Constants
- Color palette definitions
- Default values
- Configuration constants

**`src/app/shaders.ts`** - GLSL Source
- `VERTEX_SHADER`: Standard quad vertex shader
- `FRAGMENT_SHADER`: Default fragment shader template

**`src/plugin/controller.ts`** (350 lines) - Plugin Controller
- Figma API operations
- Rectangle creation and selection
- Image fill application
- Storage operations (save/load/delete shaders)
- Message routing between plugin and UI
- Error handling and validation

## Tailwind CSS v4 Integration

### Figma Dark Theme
The UI matches Figma's design system:

```css
@theme {
  /* Primary colors */
  --color-primary: #0d99ff;
  --color-primary-hover: #3daeff;
  --color-primary-active: #0a7acc;
  
  /* Dark backgrounds */
  --color-bg-primary: #1e1e1e;
  --color-bg-secondary: #2a2a2a;
  --color-bg-tertiary: #3c3c3c;
  
  /* Text colors */
  --color-text-primary: #ffffff;
  --color-text-secondary: #999999;
  
  /* Borders */
  --color-border: #3c3c3c;
}
```

### Custom Utilities

**Slider Input:**
```css
@utility slider-input {
  @apply w-full h-1 bg-[#3c3c3c] rounded-lg appearance-none cursor-pointer;
  
  &::-webkit-slider-thumb {
    @apply appearance-none w-3 h-3 rounded-full bg-white cursor-pointer;
  }
  
  &::-moz-range-thumb {
    @apply w-3 h-3 rounded-full bg-white cursor-pointer border-0;
  }
}
```

### Configuration Approach
- **No `tailwind.config.js`** - CSS-first configuration
- `@theme` directive for theme variables
- `@utility` API for custom utilities
- Direct CSS variable access: `bg-primary`, `text-secondary`

### PostCSS Setup
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}
```

## Constraints & Best Practices

### Code Organization Rules

1. **File Size Limit: 550 lines maximum**
   - Refactor into modules when approaching limit
   - Extract logical sections into separate files
   - Use factory pattern for handler groups

2. **App.tsx is COMPOSITION ONLY**
   - No inline function implementations
   - No business logic
   - No useEffect hooks (use custom hooks)
   - Only imports, state, hook calls, JSX

3. **Separation of Concerns**
   - Hooks: Stateful logic, side effects, lifecycle
   - Handlers: Business logic, data transformations
   - Components: UI rendering only
   - Utils: Pure functions, no side effects
   - WebGL: Graphics logic only

4. **Dependency Injection**
   - Handler factories accept dependencies as parameters
   - Hooks receive configuration via props
   - No global state or hidden dependencies

### React Patterns

**Animation Loop Closures:**
```tsx
// ❌ WRONG - stale closure
const renderLoop = () => {
  console.log(params.paused); // Always shows initial value
  requestAnimationFrame(renderLoop);
};

// ✅ CORRECT - use useSyncedRef
const paramsRef = useSyncedRef(params);
const renderLoop = () => {
  console.log(paramsRef.current.paused); // Always current
  requestAnimationFrame(renderLoop);
};
```

**Handler Factory Pattern:**
```tsx
// ❌ WRONG - inline handlers
const addUniform = (config) => { /* ... */ };

// ✅ CORRECT - factory with DI
const { addUniform } = createUniformHandlers(
  dynamicUniforms,
  setDynamicUniforms,
  setOpenModal,
  setCriticalError
);
```

**Component Composition:**
```tsx
// ❌ WRONG - logic in App.tsx
const App = () => {
  const handleClick = () => {
    // Complex logic here
  };
  return <Button onClick={handleClick} />;
};

// ✅ CORRECT - extracted handler
const App = () => {
  const { handleClick } = createHandlers(...);
  return <Button onClick={handleClick} />;
};
```

### Figma Plugin Constraints

**Sandbox Limitations:**
- **Plugin (controller.ts)**: Has Figma API, NO DOM/WebGL
- **UI (React app)**: Has DOM/WebGL, NO Figma API
- Communication ONLY via `postMessage`

**Image Data Transfer:**
```tsx
// ✅ CORRECT - use Uint8Array
canvas.toBlob((blob) => {
  const reader = new FileReader();
  reader.onload = () => {
    const arrayBuffer = reader.result as ArrayBuffer;
    const imageData = new Uint8Array(arrayBuffer);
    parent.postMessage({ pluginMessage: { type: 'shader-rendered', imageData }}, '*');
  };
  reader.readAsArrayBuffer(blob);
});
```

**Network Access:**
- `manifest.json` sets `"allowedDomains": ["none"]`
- All assets must be inlined
- No external API calls

### WebGL Patterns

**Uniform Injection:**
```glsl
// Auto-injected after precision statement:
precision mediump float;
uniform float u_myUniform; // ← Injected
uniform vec3 u_myColor;    // ← Injected
```

**Shader Recompilation:**
```tsx
// Always strip before saving
const cleanCode = stripInjectedUniforms(shaderCode, dynamicUniforms);
customFragmentShaderRef.current = cleanCode;

// Re-inject for rendering
const withUniforms = injectUniforms(cleanCode, dynamicUniforms);
handleRecompileShader(withUniforms);
```

**Canvas Capture:**
```tsx
// Use 2x supersampling for quality
const { width, height } = calculateCaptureResolution(renderWidth, renderHeight);
canvas.width = width * 2;
canvas.height = height * 2;
// Render then restore original size
```

## Webpack Build System

### Build Configuration

**Entry Points:**
- `ui`: src/app/index.tsx → dist/ui.js (inlined into ui.html)
- `code`: src/plugin/controller.ts → dist/code.js

**Loaders:**
- `ts-loader`: TypeScript compilation with `transpileOnly: true`
- `css-loader` + `postcss-loader@^4`: Tailwind CSS v4
- `style-loader`: CSS injection

**Plugins:**
- `HtmlWebpackPlugin`: Generate ui.html from template
- `HtmlWebpackInlineSourcePlugin`: Inline all JS into HTML (Figma requirement)

**Development:**
```bash
npm run build:watch  # Auto-recompile on changes
```

**Production:**
```bash
npm run build  # Minified, no source maps
```

### Build Output

- `dist/code.js`: ~7 KB (plugin controller)
- `dist/ui.html`: ~1.5 MB (React + Tailwind + Ace inlined)
- `dist/ui.js`: Intermediate (inlined into ui.html)

Performance warnings disabled: `performance: { hints: false }`

### Dependencies

**Production:**
- `react@^19.2.0`, `react-dom@^19.2.0`
- `react-ace@^14.0.1`, `ace-builds@^1.43.4`

**Development:**
- `tailwindcss@^4.1.17`, `@tailwindcss/postcss@^4.1.17`
- `postcss@^8.5.6`, `postcss-loader@^4.3.0`
- `typescript@^5.3.2`
- `webpack@^4.39.1`
- `@types/react@^19.2.4`, `@types/react-dom@^19.2.3`

## ESLint Configuration

**Rules:**
- `@figma/figma-plugins/recommended`: Figma-specific rules
- `@typescript-eslint/recommended`: TypeScript linting
- Unused vars with `_` prefix ignored
- TypeScript strict mode enabled

**Commands:**
```bash
npm run lint       # Check for errors
npm run lint:fix   # Auto-fix issues
```

## Development Workflow

### Adding New Features

1. **Determine scope** - Is it UI, logic, or WebGL?
2. **Choose location:**
   - UI component → `components/`
   - Business logic → `handlers/`
   - Stateful logic → `hooks/`
   - Pure utility → `utils/`
   - WebGL code → `webgl.ts`
3. **Check file size** - Refactor if >500 lines
4. **Use factories** for handler groups
5. **Export from index.ts** for clean imports
6. **Update App.tsx** - Import and compose only

### Refactoring Guidelines

**When to refactor:**
- File exceeds 550 lines
- Component has mixed concerns
- Business logic in App.tsx
- Duplicated code across files

**How to refactor:**
1. Identify logical boundaries
2. Extract to new module (hook/handler/util)
3. Use factory pattern for dependencies
4. Create index.ts for exports
5. Update imports in App.tsx
6. Test build: `npm run build`
7. Verify in Figma

### Debugging Tips

**Browser DevTools:**
- Right-click plugin window → Inspect
- Console shows WebGL errors, React errors
- Network tab (should be empty - no network calls)

**Shader Errors:**
- Display in dismissible overlay
- Full compilation log in console
- Line numbers for error location

**Common Issues:**
- **Stale closures**: Use `useSyncedRef`
- **Shader won't compile**: Check `stripInjectedUniforms` before custom edits
- **Image not applying**: Verify `Uint8Array` conversion
- **Hot reload not working**: Check webpack output for compilation errors

### Testing in Figma

1. `npm run build:watch` in terminal
2. Import plugin from manifest in Figma
3. Make code changes
4. Wait for "Compiled successfully"
5. Cmd/Ctrl+Option/Alt+P → Rerun plugin
6. Test feature
7. Check console for errors

### Adding Dynamic Uniforms

**Via UI:**
1. Click + icon in ControlPanel
2. Select type (float/color)
3. Enter name (validates GLSL rules)
4. Set min/max/step/value
5. Uniform auto-injected and cached

**Via Code:**
1. Add to preset `defaultUniforms` array
2. Specify: name, type, value, min, max, step
3. Will be injected on preset load

### Modifying Shaders

**Default Shader:**
- Edit `FRAGMENT_SHADER` in `src/app/shaders.ts`

**Runtime Editing:**
- Use "Advanced Editor" button
- Ace Editor with GLSL syntax highlighting
- Apply button recompiles with error handling
- Reset button restores snapshot

**Shader Reference:**
- `customFragmentShaderRef` stores clean shader (no injected uniforms)
- `shaderCode` state has injected uniforms for display
- Always strip before saving to storage

## Common Patterns & Examples

### Adding a New Uniform Handler

```tsx
// handlers/myHandlers.ts
export const createMyHandlers = (
  dependency1: Type1,
  dependency2: Type2
) => {
  const myHandler = () => {
    // Implementation
  };
  
  return { myHandler };
};

// App.tsx
import { createMyHandlers } from "./handlers";

const { myHandler } = createMyHandlers(dep1, dep2);
```

### Creating a Custom Hook

```tsx
// hooks/useMyFeature.ts
export const useMyFeature = (params: Params) => {
  useEffect(() => {
    // Side effects
  }, [params]);
  
  return { value, method };
};

// Add to hooks/index.ts
export { useMyFeature } from "./useMyFeature";

// App.tsx
import { useMyFeature } from "./hooks";

const { value, method } = useMyFeature(params);
```

### Adding a New Component

```tsx
// components/MyComponent.tsx
export const MyComponent: React.FC<Props> = ({ prop }) => {
  return (
    <div className="bg-[#1e1e1e] p-4 rounded">
      {/* Figma dark theme styling */}
    </div>
  );
};

// App.tsx
import MyComponent from "./components/MyComponent";

return <MyComponent prop={value} />;
```

---

**Last Updated:** November 25, 2025
**Document Version:** 2.0 (Post-refactoring)
**Codebase State:** Modular architecture with 54% App.tsx reduction
