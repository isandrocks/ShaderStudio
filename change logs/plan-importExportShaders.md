# Plan: Implement Import/Export for Saved Shaders

## Goal
Allow users to export saved shaders to JSON files and import them back into the plugin. This enables sharing shaders between files or users.

## Steps

1.  **Create Icons**
    -   Create `src/app/components/icons/ImportIcon.tsx`
    -   Create `src/app/components/icons/ExportIcon.tsx`

2.  **Update `SavedShadersGallery.tsx`**
    -   **Import Functionality**:
        -   Add a hidden `<input type="file" accept=".json" />` element.
        -   Add an "Import" button in the header area (e.g., near the "My Shaders" title or Sort controls).
        -   Implement `handleImportClick` to trigger the file input.
        -   Implement `handleFileChange` to read the file, parse JSON, and validate it matches `SavedShader` structure (roughly).
        -   Dispatch a `save-shader` message to the plugin (via `parent.postMessage`) to save the imported shader.
            -   *Note*: We might need to generate a new ID to avoid conflicts, or ask the user. For simplicity, let's generate a new ID if one exists, or just save it as a new entry.
    -   **Export Functionality**:
        -   Add an "Export" button to each shader card (e.g., next to the delete button or in a corner).
        -   Implement `handleExportClick` which takes a `SavedShader`.
        -   Create a JSON Blob from the shader data.
        -   Create a temporary `<a>` tag with `download` attribute and click it to trigger download.

## Code Snippets

### Icons
(Standard SVG icons for Import/Export)

### Export Logic
```typescript
const handleExport = (shader: SavedShader) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(shader, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `${shader.name.replace(/\s+/g, '_')}.json`);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
```

### Import Logic
```typescript
const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const importedShader = JSON.parse(content) as SavedShader;
      
      // Basic validation
      if (!importedShader.fragmentShader || !importedShader.dynamicUniforms) {
        alert("Invalid shader file");
        return;
      }

      // Ensure unique ID for import
      const newShader = {
        ...importedShader,
        id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${importedShader.name} (Imported)`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Save to storage
      parent.postMessage(
        { pluginMessage: { type: "save-shader", shader: newShader } },
        "*"
      );
      
      // Optional: Refresh list or show success message
    } catch (err) {
      console.error("Failed to import shader", err);
      alert("Failed to parse shader file");
    }
  };
  reader.readAsText(file);
};
```
