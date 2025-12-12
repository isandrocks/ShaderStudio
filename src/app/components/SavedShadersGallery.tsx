import React, { useState, useRef } from "react";
import type { SavedShader } from "../types";
import DeleteIcon from "./icons/DeleteIcon";
import ImportIcon from "./icons/ImportIcon";
import ExportIcon from "./icons/ExportIcon";
import {
  validateImportedShader,
  validateFileSize,
} from "../utils/shaderValidator";

interface SavedShadersGalleryProps {
  isOpen: boolean;
  savedShaders: SavedShader[];
  onClose: () => void;
  onLoadShader: (shader: SavedShader) => void;
  onDeleteShader: (id: string) => void;
}

type SortOption = "name" | "newest" | "oldest";

export const SavedShadersGallery: React.FC<SavedShadersGalleryProps> = ({
  isOpen,
  savedShaders,
  onClose,
  onLoadShader,
  onDeleteShader,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = (e: React.MouseEvent, shader: SavedShader) => {
    e.stopPropagation();
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(shader, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `${shader.name.replace(/\s+/g, "_")}.json`,
    );
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Validate file type
      if (!file.name.endsWith(".json")) {
        alert("Please select a JSON file");
        return;
      }

      // Validate file size before reading
      validateFileSize(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;

          // Parse JSON
          const parsedData = JSON.parse(content);

          // Validate and sanitize the shader data
          const validatedShader = validateImportedShader(parsedData);

          // Add "(Imported)" to the name if not already present
          const finalShader = {
            ...validatedShader,
            name: validatedShader.name.includes("(Imported)")
              ? validatedShader.name
              : `${validatedShader.name} (Imported)`,
          };

          // Save to storage
          parent.postMessage(
            { pluginMessage: { type: "save-shader", shader: finalShader } },
            "*",
          );

          // Reset input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          // Success - no alert needed as the shader will appear in the list
        } catch (err) {
          console.error("Failed to import shader", err);
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error";
          alert(`Failed to import shader:\n${errorMessage}`);
        }
      };

      reader.onerror = () => {
        alert("Failed to read file");
      };

      reader.readAsText(file);
    } catch (err) {
      console.error("File validation failed", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert(`File validation failed:\n${errorMessage}`);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const sortedShaders = [...savedShaders].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "newest") return b.createdAt - a.createdAt;
    if (sortBy === "oldest") return a.createdAt - b.createdAt;
    return 0;
  });

  const handleLoad = (shader: SavedShader) => {
    onLoadShader(shader);
    onClose();
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteShader(id);
    setDeleteConfirmId(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60
        p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-[#1e1e1e] rounded-lg
          shadow-xl flex flex-col"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b
            border-[#3c3c3c]"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">My Shaders</h2>
            <button
              onClick={handleImportClick}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded
                bg-[#3c3c3c] text-white hover:bg-[#4c4c4c] transition-colors"
              title="Import Shader JSON"
            >
              <ImportIcon className="w-3 h-3" />
              Import
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
              aria-label="Import shader"
            />
          </div>
          <button
            onClick={onClose}
            className="text-[#999999] hover:text-white transition-colors
              text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Sort options */}
        <div
          className="flex gap-2 p-4 border-b border-[#3c3c3c] flex-wrap
            items-center"
        >
          <span className="text-sm text-[#999999] mr-2">Sort by:</span>
          <button
            onClick={() => setSortBy("newest")}
            className={`px-3 py-1.5 rounded text-xs transition-colors ${
              sortBy === "newest"
                ? "bg-[#3c3c3c] text-white border border-[#4c4c4c]"
                : `bg-[#2c2c2c] text-[#999999] hover:bg-[#333333]
                  hover:text-white`
              }`}
          >
            Newest First
          </button>
          <button
            onClick={() => setSortBy("oldest")}
            className={`px-3 py-1.5 rounded text-xs transition-colors ${
              sortBy === "oldest"
                ? "bg-[#3c3c3c] text-white border border-[#4c4c4c]"
                : `bg-[#2c2c2c] text-[#999999] hover:bg-[#333333]
                  hover:text-white`
              }`}
          >
            Oldest First
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`px-3 py-1.5 rounded text-xs transition-colors ${
              sortBy === "name"
                ? "bg-[#3c3c3c] text-white border border-[#4c4c4c]"
                : `bg-[#2c2c2c] text-[#999999] hover:bg-[#333333]
                  hover:text-white`
              }`}
          >
            Name
          </button>
        </div>

        {/* Shader grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {sortedShaders.length === 0 ? (
            <div className="text-center text-[#666666] py-12">
              <p className="text-lg mb-2">No saved shaders yet</p>
              <p className="text-sm">
                Create and save your first shader to see it here!
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {sortedShaders.map((shader) => (
                <div key={shader.id} className="relative group">
                  <div
                    onClick={() => handleLoad(shader)}
                    className="cursor-pointer rounded-lg border border-[#3c3c3c]
                      bg-[#2c2c2c] p-4 transition-all hover:border-[#4c4c4c]
                      hover:bg-[#333333]"
                  >
                    {/* Preview/Thumbnail */}
                    <div
                      className="mb-3 h-32 w-full rounded bg-[#1e1e1e] flex
                        items-center justify-center text-[#666666] text-xs
                        overflow-hidden"
                    >
                      {shader.thumbnail ? (
                        <img
                          src={shader.thumbnail}
                          alt={shader.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        "No Preview"
                      )}
                    </div>

                    {/* Shader name */}
                    <h3 className="font-semibold text-white mb-1 truncate">
                      {shader.name}
                    </h3>

                    {/* Date badge */}
                    <div className="mb-2">
                      <span
                        className="inline-block px-2 py-1 text-[10px] rounded
                          bg-[#3c3c3c] text-gray-400"
                      >
                        {formatDate(shader.createdAt)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-[#999999] line-clamp-2">
                      {shader.description || "\u00A0"}
                    </p>

                    {/* Parameter count */}
                    <p className="text-xs text-[#666666] mt-2">
                      {shader.dynamicUniforms.length} parameter
                      {shader.dynamicUniforms.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Delete button or confirmation */}
                  {deleteConfirmId === shader.id ? (
                    <div
                      className="absolute inset-0 bg-[#1e1e1e]/95 flex flex-col
                        items-center justify-center gap-3 rounded-lg p-4 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-sm text-white font-medium text-center">
                        Delete this shader?
                      </p>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={(e) => handleConfirmDelete(e, shader.id)}
                          className="flex-1 px-2 py-1.5 bg-red-600 text-white
                            text-xs rounded hover:bg-red-500 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          className="flex-1 px-2 py-1.5 bg-[#3c3c3c] text-white
                            text-xs rounded hover:bg-[#4c4c4c]
                            transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="absolute top-3 right-7 opacity-0
                        group-hover:opacity-100 transition-all flex-row-reverse
                        gap-2"
                    >
                      <button
                        onClick={(e) => handleExport(e, shader)}
                        className="p-2 pr-5"
                        title="Export shader"
                      >
                        <ExportIcon
                          className="absolute h-7 cursor-pointer p-1 rounded-lg
                            transition-all hover:bg-[#3c3c3c] text-white"
                        />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, shader.id)}
                        className="p-2"
                        title="Delete shader"
                      >
                        <DeleteIcon
                          className="h-7 cursor-pointer p-1 rounded-lg
                            transition-all hover:bg-red-900"
                        />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t border-[#3c3c3c] text-sm text-[#999999]
            text-center"
        >
          {sortedShaders.length > 0
            ? "Click a shader to load it • Hover to delete"
            : "Shaders are stored in this Figma document"}
        </div>
      </div>
    </div>
  );
};
