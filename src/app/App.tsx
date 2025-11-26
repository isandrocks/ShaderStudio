import React, { useRef, useState } from "react";
import ControlPanel from "./components/ControlPanel";
import ShaderCanvas from "./components/ShaderCanvas";
import ShaderModal from "./components/ShaderModal";
import UniformConfigModal from "./components/UniformConfigModal";
import { PresetGallery } from "./components/PresetGallery";
import SaveShaderModal from "./components/SaveShaderModal";
import { SavedShadersGallery } from "./components/SavedShadersGallery";
import { VideoExportModal } from "./components/video-export";
import HelpIcon from "./components/icons/HelpIcon";
import { SHADER_PRESETS } from "./presets";
import { useSyncedRef, useShaderEngine, useShaderLifecycle } from "./hooks";
import {
  createUniformHandlers,
  createShaderLoadHandlers,
  createFigmaHandlers,
  createModalHandlers,
  createVideoExportHandler,
} from "./handlers";
import { LayerPanel } from "./components/layers/LayerPanel";
import { LayerProperties } from "./components/layers/LayerProperties";
import { EffectPicker } from "./components/layers/EffectPicker";
import { createLayerHandlers } from "./handlers/layerHandlers";
import { generateLayeredShader } from "./utils/layerShaderGenerator";
import { LAYER_TEMPLATES } from "./layerTemplates";
import { injectUniforms } from "./webgl";
import type {
  ShaderState,
  SavedShader,
  ModalType,
  EffectLayer, // Added
} from "./types";

const App: React.FC = () => {
  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State: params
  const [params, setParams] = useState({
    paused: false,
    pausedTime: 0.0,
  });

  // State: modals
  const [openModal, setOpenModal] = useState<ModalType>("none");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // State: shaders
  const [savedShaders, setSavedShaders] = useState<SavedShader[]>([]);
  const [shaderCode, setShaderCode] = useState(
    SHADER_PRESETS[0].fragmentShader,
  );
  // State: Base shader for layering (preserves code when switching to builder)
  const [baseShaderCode, setBaseShaderCode] = useState(
    SHADER_PRESETS[0].fragmentShader,
  );
  const [shaderError, setShaderError] = useState("");

  // Helper to update both shader code and base shader
  const handleShaderUpdate = (code: string) => {
    setShaderCode(code);
    setBaseShaderCode(code);
  };

  // State: selection and rendering
  const [selectionError, setSelectionError] = useState("");
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [renderWidth, setRenderWidth] = useState(512);
  const [renderHeight, setRenderHeight] = useState(512);
  const [showAspectRatio, setShowAspectRatio] = useState(false);
  const [dynamicUniforms, setDynamicUniforms] = useState(
    SHADER_PRESETS[0].defaultUniforms,
  );

  // State: Layer Builder
  const [layers, setLayers] = useState<EffectLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isEffectPickerOpen, setIsEffectPickerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"builder" | "code">("code"); // Default to code for now

  // Refs: shader state
  const shaderStateRef = useRef<ShaderState>({
    gl: null,
    program: null,
    uniforms: {},
    dynamicUniforms: {},
  });
  const startTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number | undefined>(undefined);
  const customFragmentShaderRef = useRef<string | null>(null);
  const modalShaderSnapshotRef = useRef<string | null>(null);

  // Synced refs for closures
  const paramsRef = useSyncedRef(params);
  const dynamicUniformsRef = useSyncedRef(dynamicUniforms);

  // Shader engine hook
  const {
    getCurrentTime,
    renderLoop,
    captureShader,
    handleRecompileShader,
    handleShaderError,
  } = useShaderEngine({
    canvasRef,
    shaderStateRef,
    paramsRef,
    dynamicUniformsRef,
    startTimeRef,
    animationFrameRef,
    customFragmentShaderRef,
    renderWidth,
    renderHeight,
    setShaderError,
    setCriticalError,
  });

  // Uniform handlers
  const { addUniform, updateUniform, removeUniform } = createUniformHandlers(
    dynamicUniforms,
    setDynamicUniforms,
    setOpenModal,
    setCriticalError,
  );

  // Shader load handlers
  const { loadPreset, loadSavedShader, deleteSavedShader } =
    createShaderLoadHandlers(
      customFragmentShaderRef,
      shaderStateRef,
      handleShaderUpdate, // Use helper to update base as well
      setDynamicUniforms,
      setShaderError,
      setCriticalError,
    );

  // Figma handlers
  const {
    handlePauseChange,
    handleApplyToSelection,
    handleCreateRectangle,
    handleToggleOverlay,
  } = createFigmaHandlers(
    startTimeRef,
    paramsRef,
    setParams,
    setSelectionError,
    setShowAspectRatio,
  );

  // Modal handlers
  const { handleApplyShader, handleResetShader } = createModalHandlers(
    shaderCode,
    dynamicUniforms,
    customFragmentShaderRef,
    modalShaderSnapshotRef,
    handleRecompileShader,
    handleShaderUpdate, // Use helper to update base as well
    setShaderError,
  );

  // Video export handler
  const handleExportVideo = createVideoExportHandler(
    customFragmentShaderRef,
    dynamicUniformsRef,
    shaderCode,
    setIsVideoModalOpen,
    setIsExportingVideo,
    setCriticalError,
  );

  // Layer handlers
  const {
    addLayer,
    removeLayer,
    updateLayer,
    updateLayerProperty,
    reorderLayers,
  } = createLayerHandlers(
    layers,
    setLayers,
    dynamicUniforms,
    setDynamicUniforms,
    setSelectedLayerId,
  );

  // Effect: Generate shader when layers change
  React.useEffect(() => {
    if (viewMode === "builder") {
      // Pass baseShaderCode to inject layers into it
      const newShader = generateLayeredShader(
        layers,
        LAYER_TEMPLATES,
        baseShaderCode,
      );
      // Inject uniform declarations so they appear in Advanced Editor
      const shaderWithUniforms = injectUniforms(newShader, dynamicUniforms);
      setShaderCode(shaderWithUniforms);
      handleRecompileShader(newShader);
    }
  }, [
    layers,
    viewMode,
    handleRecompileShader,
    setShaderCode,
    baseShaderCode,
    dynamicUniforms,
  ]);

  // Lifecycle hook
  useShaderLifecycle({
    canvasRef,
    shaderStateRef,
    customFragmentShaderRef,
    animationFrameRef,
    dynamicUniforms,
    renderLoop,
    handleShaderError,
    handleRecompileShader,
    setShaderCode: handleShaderUpdate, // Use helper to update base as well
    setSavedShaders,
    setSelectionError,
    setRenderWidth,
    setRenderHeight,
    setShowAspectRatio,
    setCriticalError,
    captureShader,
  });

  return (
    <div
      className="font-sans bg-[#1e1e1e] text-white p-4 flex flex-col
        items-center gap-4 overflow-hidden"
    >
      {criticalError && (
        <div
          className="w-full bg-red-900/30 border border-red-500 rounded p-3
            text-sm"
        >
          <div className="font-semibold text-red-400 mb-1">Critical Error:</div>
          <div className="text-red-200">{criticalError}</div>
          <button
            onClick={() => {
              setCriticalError(null);
              window.location.reload();
            }}
            className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-500 rounded
              text-xs"
          >
            Reload Plugin
          </button>
        </div>
      )}

      <div className="flex gap-4 items-start">
        {viewMode === "builder" ? (
          <LayerPanel
            layers={layers}
            selectedLayerId={selectedLayerId}
            onSelect={setSelectedLayerId}
            onAdd={() => setIsEffectPickerOpen(true)}
            onRemove={removeLayer}
            onToggleVisibility={(id) =>
              updateLayer(id, {
                visible: !layers.find((l) => l.id === id)?.visible,
              })
            }
            onReorder={reorderLayers}
            onToggleCodeMode={() => setViewMode("code")}
          />
        ) : (
          <ControlPanel
            onApplyToSelection={handleApplyToSelection}
            onCreateRectangle={handleCreateRectangle}
            selectionError={selectionError}
            onAdvancedEditorClick={() => {
              // Capture current shader state as snapshot for reset
              modalShaderSnapshotRef.current = shaderCode;
              setOpenModal("shader");
            }}
            onPresetsClick={() => setOpenModal("presets")}
            onSaveShader={() => setOpenModal("save")}
            onOpenSavedShaders={() => setOpenModal("saved-shaders")}
            onExportVideo={() => setIsVideoModalOpen(true)}
            dynamicUniforms={dynamicUniforms}
            onAddUniform={() => setOpenModal("config")}
            onUpdateUniform={updateUniform}
            onRemoveUniform={removeUniform}
            onToggleBuilderMode={() => {
              // Sync base shader when entering builder mode
              setBaseShaderCode(shaderCode);
              setViewMode("builder");
            }}
          />
        )}

        <ShaderCanvas
          canvasRef={canvasRef}
          isPaused={params.paused}
          onPauseChange={handlePauseChange}
          showAspectRatio={showAspectRatio}
          aspectWidth={renderWidth}
          aspectHeight={renderHeight}
          onToggleOverlay={handleToggleOverlay}
          className={viewMode === "builder" ? "w-[340px] h-[340px]" : undefined}
        />

        {viewMode === "builder" && (
          <LayerProperties
            layer={layers.find((l) => l.id === selectedLayerId) || null}
            onUpdate={(updates) =>
              selectedLayerId && updateLayer(selectedLayerId, updates)
            }
            onUpdateProperty={(key, value) =>
              selectedLayerId &&
              updateLayerProperty(selectedLayerId, key, value)
            }
          />
        )}
      </div>

      <p className="text-[11px] text-[#999999] text-center max-w-lg absolute bottom-4">
        Live shader preview above • Adjust parameters in real-time
      </p>

      {/* Help Icon & Tooltip */}
      <div className="absolute bottom-4 left-4 z-10">
        <div
          className="text-[#999999] hover:text-white cursor-pointer transition-colors"
          onMouseEnter={() => setShowHelp(true)}
          onMouseLeave={() => setShowHelp(false)}
        >
          <HelpIcon className="w-5 h-5" />
        </div>

        {showHelp && (
          <div className="absolute bottom-8 left-0 w-64 bg-[#2c2c2c] border border-[#3c3c3c] rounded-lg p-3 shadow-xl text-xs text-gray-300">
            <h4 className="font-bold text-white mb-2">Using Parameters</h4>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Add a parameter using the + button</li>
              <li>Open Advanced Editor</li>
              <li>
                Declare the uniform in your code (e.g.{" "}
                <code className="bg-[#1e1e1e] px-1 rounded">
                  uniform float myParam;
                </code>
                )
              </li>
              <li>Control the value from the main panel</li>
            </ol>
          </div>
        )}
      </div>

      <EffectPicker
        isOpen={isEffectPickerOpen}
        onClose={() => setIsEffectPickerOpen(false)}
        onSelect={(templateId) => {
          addLayer(templateId);
          setIsEffectPickerOpen(false);
        }}
      />

      <ShaderModal
        isOpen={openModal === "shader"}
        shaderCode={shaderCode}
        error={shaderError}
        onClose={() => {
          modalShaderSnapshotRef.current = null;
          setOpenModal("none");
        }}
        onShaderChange={handleShaderUpdate} // Update base as well
        onApply={handleApplyShader}
        onReset={handleResetShader}
        onClearError={() => setShaderError("")}
      />

      <UniformConfigModal
        isOpen={openModal === "config"}
        onClose={() => setOpenModal("none")}
        onAdd={addUniform}
      />

      <PresetGallery
        isOpen={openModal === "presets"}
        onClose={() => setOpenModal("none")}
        onSelectPreset={loadPreset}
      />

      <SaveShaderModal
        isOpen={openModal === "save"}
        onClose={() => setOpenModal("none")}
        shaderCode={shaderCode}
        customFragmentShaderRef={customFragmentShaderRef}
        dynamicUniforms={dynamicUniforms}
        canvasRef={canvasRef}
        shaderStateRef={shaderStateRef}
        getCurrentTime={getCurrentTime}
        isPaused={params.paused}
      />

      <SavedShadersGallery
        isOpen={openModal === "saved-shaders"}
        savedShaders={savedShaders}
        onClose={() => setOpenModal("none")}
        onLoadShader={loadSavedShader}
        onDeleteShader={deleteSavedShader}
      />

      <VideoExportModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onExport={handleExportVideo}
      />

      {/* Exporting Video Spinner Overlay */}
      {isExportingVideo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-6 flex flex-col items-center gap-4 border border-[#3c3c3c]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-300 font-medium">Exporting Video...</div>
            <div className="text-xs text-gray-500">This may take a moment</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
