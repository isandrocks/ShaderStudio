// This shows the HTML page in "ui.html".
figma.showUI(__html__, { themeColors: true, width: 825, height: 650 });

let currentRect: RectangleNode | null = null;

figma.ui.onmessage = async (msg: {
  type: string;
  imageData?: Uint8Array;
  error?: string;
}) => {
  switch (msg.type) {
    case "create-rectangle":
      createRectangle();
      break;

    case "shader-rendered":
      applyShaderToRectangle(msg.imageData!);
      break;

    case "shader-error":
      figma.notify(msg.error || "Shader rendering error", { error: true });
      figma.closePlugin();
      break;

    case "cancel":
      figma.closePlugin();
      break;
  }
};

function createRectangle() {
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
      figma.notify("Shader rendering timed out", { error: true });
    }
  }, 10000);
}

function applyShaderToRectangle(imageData: Uint8Array) {
  if (!imageData?.length) {
    figma.notify("Empty shader image data", { error: true });
    figma.closePlugin();
    return;
  }

  try {
    const image = figma.createImage(imageData);

    if (currentRect) {
      currentRect.fills = [
        {
          type: "IMAGE",
          scaleMode: "FILL",
          imageHash: image.hash,
        },
      ];
      figma.notify("Shader applied successfully!");
    }

    figma.closePlugin();
  } catch (error) {
    figma.notify(`Error applying shader: ${error}`, { error: true });
    figma.closePlugin();
  }
}
