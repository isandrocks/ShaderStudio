import React, { useState } from "react";
import { BaseModal } from "./BaseModal";
import type { DynamicUniform } from "../types";

interface AiGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (shader: {
    fragmentShader: string;
    uniforms: DynamicUniform[];
  }) => void;
}

export const AiGenerationModal: React.FC<AiGenerationModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("Please enter a Gemini API Key");
      return;
    }
    if (!prompt) {
      setError("Please enter a description");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const systemPrompt = `
You are an expert GLSL shader developer.
Generate a GLSL fragment shader based on the user's description.
You must output a JSON object with the following structure:
{
  "fragmentShader": "string (the full GLSL code)",
  "uniforms": [
    {
      "id": "string (unique id)",
      "name": "string (uniform name in GLSL, e.g. uSpeed)",
      "type": "float" | "vec2" | "vec3" | "vec4",
      "value": number | [number, number] | [number, number, number] | [number, number, number, number],
      "min": number,
      "max": number,
      "step": number
    }
  ]
}

GLSL Requirements:
- Use 'precision mediump float;'
- Standard uniforms available: 'uniform vec2 iResolution;', 'uniform float iTime;'
- Do NOT use 'iMouse'
- Output to 'gl_FragColor'
- Ensure the code is valid WebGL 1.0 GLSL.
- IMPORTANT: You MUST define a 'vec4 col' variable for the color and end the main function with 'gl_FragColor = col;'.

Uniform Requirements:
- Create 2 or more dynamic uniforms for the most important parameters (speed, color, size, position, etc).
- Use 'float' for numbers, 'vec2' for coordinate positions, 'vec3' for colors, and 'vec4' for colors with alpha.
- Provide reasonable min/max/step values.
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: systemPrompt + "\n\nUser Request: " + prompt }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "Failed to generate shader");
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      const result = JSON.parse(content);

      if (!result.fragmentShader || !Array.isArray(result.uniforms)) {
        throw new Error("Invalid response format from AI");
      }

      onGenerate(result);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Shader with AI"
      maxWidth="w-[500px]"
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-300
              hover:text-white bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded
              transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-medium text-white rounded
            transition-colors flex items-center gap-2 ${
              isLoading
                ? "bg-primary/50 cursor-not-allowed"
                : "bg-primary hover:bg-primary-active"
            }`}
          >
            {isLoading ? (
              <>
                <span
                  className="w-3 h-3 border-2 border-white/30 border-t-white
                    rounded-full animate-spin"
                />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </button>
        </div>
      }
    >
      <div className="p-4 space-y-2 overflow-hidden">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-400">
            Gemini API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIza..."
            className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2
              text-xs text-white focus:border-blue-500 outline-none"
          />
          <p className="text-[10px] text-gray-500">
            Key is not saved and will be discarded when you close the plugin.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-400">
            Model
          </label>
          <select
            title="Select AI Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2
              text-xs text-white focus:border-blue-500 outline-none"
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="gemini-3-pro-preview">Gemini 3 Pro Preview</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-400">
            Description
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the shader you want (e.g., 'A psychedelic spiral pattern with neon colors that pulses to the beat')"
            className="w-full h-32 bg-[#1e1e1e] border border-[#3c3c3c] rounded
              p-2 text-xs text-white focus:border-blue-500 outline-none
              resize-none"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
      </div>
    </BaseModal>
  );
};
