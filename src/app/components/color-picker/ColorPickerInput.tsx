import React, { useRef } from "react";
import { parseHexInput, toHex } from "./utils";

interface ColorPickerInputProps {
  r: number;
  g: number;
  b: number;
  a: number;
  type: "vec3" | "vec4";
  onChange: (value: [number, number, number] | [number, number, number, number]) => void;
}

export const ColorPickerInput: React.FC<ColorPickerInputProps> = ({ r, g, b, a, type, onChange }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const hexValue = `${toHex(r)}${toHex(g)}${toHex(b)}`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setInputValue(hexValue);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    const result = parseHexInput(inputValue, a);
    if (result) {
      if (type === "vec3") {
        onChange([result.r, result.g, result.b]);
      } else {
        onChange([result.r, result.g, result.b, result.a]);
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const result = parseHexInput(inputValue, a);
      if (result) {
        if (type === "vec3") {
          onChange([result.r, result.g, result.b]);
        } else {
          onChange([result.r, result.g, result.b, result.a]);
        }
      }
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const amount = e.shiftKey ? 10 : 1;
      const direction = e.key === 'ArrowUp' ? amount : -amount;
      
      // Increment RGB values
      const newR = Math.max(0, Math.min(1, r + direction / 255));
      const newG = Math.max(0, Math.min(1, g + direction / 255));
      const newB = Math.max(0, Math.min(1, b + direction / 255));
      
      if (type === "vec3") {
        onChange([newR, newG, newB]);
      } else {
        onChange([newR, newG, newB, a]);
      }
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="flex-1 w-full min-w-0 px-2 text-xs font-normal text-white text-left bg-transparent outline-none"
        style={{ cursor: "text" }}
        maxLength={8}
        spellCheck={false}
        autoComplete="off"
        aria-label="Hex color value"
      />
    );
  }

  return (
    <div 
      className="flex-1 px-2 text-xs font-normal text-white text-left select-none"
      onClick={handleClick}
    >
      {hexValue}
    </div>
  );
};
