// This shows the HTML page in "ui.html".
figma.showUI(__html__, { themeColors: true, width: 825, height: 650 });

let currentRect: RectangleNode | null = null;

figma.ui.onmessage = async (msg: {
  type: string;
  imageData?: Uint8Array;
  error?: string;
}) => {
  try {
    switch (msg.type) {
      case "create-rectangle":
        createRectangle();
        break;

      case "shader-rendered":
        applyShaderToRectangle(msg.imageData!);
        break;

      case "shader-error":
        figma.notify(msg.error || "Shader rendering error", { error: true });
        throw new Error(`Shader Error: ${msg.error}`);

      case "cancel":
        figma.closePlugin();
        break;
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
