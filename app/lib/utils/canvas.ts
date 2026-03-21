/**
 * Canvas utility helpers.
 */

/**
 * Draw an ImageData object onto a canvas element, scaling to fill it.
 */
export function drawImageDataToCanvas(
  canvas: HTMLCanvasElement,
  imageData: ImageData,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Create a canvas with the given dimensions and return it along with its 2D context.
 */
export function createOffscreenCanvas(
  width: number,
  height: number,
): { canvas: OffscreenCanvas; ctx: OffscreenCanvasRenderingContext2D } | null {
  if (typeof OffscreenCanvas === 'undefined') return null;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  return { canvas, ctx };
}

/**
 * Get the ImageData from a canvas element.
 */
export function getCanvasImageData(
  canvas: HTMLCanvasElement,
): ImageData | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}
