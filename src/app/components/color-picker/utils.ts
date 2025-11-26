/**
 * Color utility functions for HSV/RGB conversions and hex parsing
 */

export interface HSV {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

export interface RGB {
  r: number; // 0-1
  g: number; // 0-1
  b: number; // 0-1
}

/**
 * Convert RGB [0-1] to HSV
 */
export const rgbToHsv = (r: number, g: number, b: number): HSV => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / delta + 2) / 6;
    } else {
      h = ((r - g) / delta + 4) / 6;
    }
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h: h * 360, s: s * 100, v: v * 100 };
};

/**
 * Convert HSV to RGB [0-1]
 */
export const hsvToRgb = (h: number, s: number, v: number): RGB => {
  h = h / 360;
  s = s / 100;
  v = v / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0,
    g = 0,
    b = 0;
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return { r, g, b };
};

/**
 * Convert RGB [0-1] value to hex string (00-FF)
 */
export const toHex = (val: number): string =>
  Math.round(val * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();

/**
 * Parse hex input and return RGB(A) values [0-1]
 * Supports 1-8 character hex codes with auto-expansion
 */
export const parseHexInput = (
  input: string,
  currentAlpha: number = 1,
): { r: number; g: number; b: number; a: number } | null => {
  // Remove # if present and get valid hex characters
  const cleaned = input.replace(/[^0-9a-fA-F]/g, "");

  if (cleaned.length === 0) return null;

  let hex = cleaned;

  // Expand short forms
  if (hex.length === 1) {
    hex = hex.repeat(6);
  } else if (hex.length === 2) {
    hex = hex.repeat(3);
  } else if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c.repeat(2))
      .join("");
  } else if (hex.length === 4) {
    // RGBA shorthand
    hex = hex
      .split("")
      .map((c) => c.repeat(2))
      .join("");
  } else if (hex.length === 5) {
    // Invalid, but try to handle
    hex =
      hex
        .slice(0, 3)
        .split("")
        .map((c) => c.repeat(2))
        .join("") + hex.slice(3);
  } else if (hex.length > 8) {
    hex = hex.slice(0, 8);
  }

  // Parse RGB (and optionally A)
  if (hex.length >= 6) {
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

    let a = currentAlpha;
    if (hex.length >= 8) {
      a = parseInt(hex.substring(6, 8), 16) / 255;
      if (isNaN(a)) a = currentAlpha;
    }

    return { r, g, b, a };
  }

  return null;
};

/**
 * Get RGB string for CSS (0-255 values)
 */
export const rgbToCssString = (r: number, g: number, b: number): string =>
  `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;

/**
 * Get RGBA string for CSS (0-255 for RGB, 0-1 for alpha)
 */
export const rgbaToCssString = (
  r: number,
  g: number,
  b: number,
  a: number,
): string =>
  `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a.toFixed(2)})`;
