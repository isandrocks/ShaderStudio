// This shows the HTML page in "ui.html".
figma.showUI(__html__, { themeColors: true, width: 900, height: 575 });

let currentRect: RectangleNode | null = null;

// SavedShader interface for document storage
type UniformType = "float" | "vec3" | "vec4";

type UniformValue =
  | number // float
  | [number, number, number] // vec3 (RGB)
  | [number, number, number, number]; // vec4 (RGBA)

interface DynamicUniform {
  id: string;
  name: string;
  type: UniformType;
  value: UniformValue;
  min: number;
  max: number;
  step: number;
}

interface SavedShader {
  id: string;
  name: string;
  description?: string;
  fragmentShader: string;
  dynamicUniforms: DynamicUniform[];
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
}

// Load all saved shaders from document
async function loadSavedShaders(): Promise<SavedShader[]> {
  try {
    const data = figma.root.getPluginData("savedShaders");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("[loadSavedShaders] Parse error:", error);
    return [];
  }
}

// Save shaders array to document
async function saveShadersToDocument(shaders: SavedShader[]): Promise<void> {
  try {
    const dataString = JSON.stringify(shaders);
    const dataSize = dataString.length;

    // Log data size for monitoring
    console.log("[saveShadersToDocument] Total data size:", dataSize, "bytes");
    console.log("[saveShadersToDocument] Number of shaders:", shaders.length);

    // Warn if approaching limits (Figma's setPluginData has no hard limit per key,
    // but very large data can cause performance issues)
    if (dataSize > 500000) {
      // 500KB warning threshold
      console.warn(
        "[saveShadersToDocument] Large data size:",
        dataSize,
        "bytes",
      );
      figma.notify("Warning: Shader library is getting large", {
        timeout: 3000,
      });
    }

    figma.root.setPluginData("savedShaders", dataString);
  } catch (error) {
    console.error("[saveShadersToDocument] Error:", error);
    throw error;
  }
}

figma.ui.onmessage = async (msg: {
  type: string;
  imageData?: Uint8Array;
  error?: string;
  shader?: SavedShader;
  id?: string;
}) => {
  try {
    switch (msg.type) {
      case "create-rectangle": {
        createRectangle();
        break;
      }

      case "shader-rendered": {
        applyShaderToRectangle(msg.imageData!);
        break;
      }

      case "shader-error": {
        figma.notify(msg.error || "Shader rendering error", { error: true });
        throw new Error(`Shader Error: ${msg.error}`);
      }

      case "cancel": {
        figma.closePlugin();
        break;
      }

      case "load-shaders": {
        const shaders = await loadSavedShaders();
        figma.ui.postMessage({ type: "shaders-loaded", shaders });
        break;
      }

      case "save-shader": {
        try {
          const shaders = await loadSavedShaders();
          const existingIndex = shaders.findIndex(
            (s) => s.id === msg.shader!.id,
          );

          if (existingIndex >= 0) {
            // Update existing shader
            shaders[existingIndex] = { ...msg.shader!, updatedAt: Date.now() };
          } else {
            // Add new shader
            shaders.push(msg.shader!);
          }

          await saveShadersToDocument(shaders);
          figma.ui.postMessage({ type: "shader-saved", shader: msg.shader });
        } catch (error) {
          figma.ui.postMessage({
            type: "storage-error",
            error: `Failed to save shader: ${(error as Error).message}`,
          });
        }
        break;
      }

      case "delete-shader": {
        try {
          const shaders = await loadSavedShaders();
          const filtered = shaders.filter((s) => s.id !== msg.id);
          await saveShadersToDocument(filtered);
          figma.ui.postMessage({ type: "shader-deleted", id: msg.id });
        } catch (error) {
          figma.ui.postMessage({
            type: "storage-error",
            error: `Failed to delete shader: ${(error as Error).message}`,
          });
        }
        break;
      }
    }
  } catch (error) {
    console.error("[controller] Error:", error);
    figma.notify(`Plugin error: ${error}`, { error: true, timeout: 5000 });
    throw error; // Re-throw to keep window open and display in Figma
  }
};

function createRectangle() {
  try {
    const rect = figma.createRectangle();
    rect.resize(512, 512);
    rect.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];

    figma.currentPage.appendChild(rect);
    figma.currentPage.selection = [rect];
    figma.viewport.scrollAndZoomIntoView([rect]);

    currentRect = rect;
    figma.ui.postMessage({ type: "render-shader" });

    // Timeout fallback
    setTimeout(() => {
      if (
        currentRect &&
        (currentRect.fills as readonly Paint[])[0]?.type === "SOLID"
      ) {
        const timeoutError = new Error(
          "Shader rendering timed out after 10 seconds",
        );
        figma.notify(timeoutError.message, { error: true, timeout: 5000 });
        throw timeoutError;
      }
    }, 10000);
  } catch (error) {
    console.error("[createRectangle] Error:", error);
    figma.notify(`Failed to create rectangle: ${error}`, {
      error: true,
      timeout: 5000,
    });
    throw error;
  }
}

function applyShaderToRectangle(imageData: Uint8Array) {
  try {
    if (!imageData?.length) {
      const emptyDataError = new Error("Empty shader image data received");
      figma.notify(emptyDataError.message, { error: true, timeout: 5000 });
      throw emptyDataError;
    }

    console.log(
      "[applyShaderToRectangle] Image data length:",
      imageData.length,
    );
    const image = figma.createImage(imageData);

    if (!currentRect) {
      throw new Error("No rectangle to apply shader to");
    }

    currentRect.fills = [
      {
        type: "IMAGE",
        scaleMode: "FILL",
        imageHash: image.hash,
      },
    ];

    console.log("[applyShaderToRectangle] Shader applied successfully");
    figma.notify("Shader applied successfully!");
  } catch (error) {
    console.error("[applyShaderToRectangle] Error:", error);
    figma.notify(`Error applying shader: ${error}`, {
      error: true,
      timeout: 5000,
    });
    throw error; // Re-throw to prevent immediate close and show error
  }
}
