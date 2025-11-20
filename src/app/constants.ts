/**
 * Application-wide constants
 */

// ============================================================================
// Canvas Configuration
// ============================================================================

/** Default canvas size for shader rendering (width and height in pixels) */
export const CANVAS_SIZE = 512;

// ============================================================================
// Thumbnail Configuration
// ============================================================================

/** JPEG quality for thumbnail generation (0.0 to 1.0) */
export const THUMBNAIL_QUALITY = 0.7;

/** Maximum thumbnail size in bytes before falling back to placeholder */
export const THUMBNAIL_MAX_SIZE = 50000;

/** Placeholder thumbnail when image is too large */
export const THUMBNAIL_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='sans-serif' font-size='12'%3EShader%3C/text%3E%3C/svg%3E";

// ============================================================================
// Slider Control Configuration
// ============================================================================

/** Calculate decimal places for slider display based on step size */
export const getDecimalPlaces = (step: number): number => {
  const stepStr = step.toString();
  const decimalIndex = stepStr.indexOf(".");
  return decimalIndex === -1 ? 0 : stepStr.length - decimalIndex - 1;
};

// ============================================================================
// WebGL Configuration
// ============================================================================

/** Timeout for shader rendering operations (milliseconds) */
export const SHADER_RENDER_TIMEOUT = 10000;
