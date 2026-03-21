/**
 * Image loading and resizing utilities (browser-only).
 */

const MAX_DIMENSION = 1200;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface LoadedImage {
  imageData: ImageData;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  fileName: string;
}

export class ImageLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageLoadError';
  }
}

export function validateImageFile(file: File): void {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ImageLoadError(
      `File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`,
    );
  }
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new ImageLoadError(
      'Unsupported format. Please use JPEG, PNG, or WebP.',
    );
  }
}

/**
 * Load a File or Blob into an ImageData, resizing to MAX_DIMENSION on the longest edge.
 */
export function loadImageFromFile(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    validateImageFile(file);

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const result = imageElementToImageData(img, file.name);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageLoadError('Failed to load image.'));
    };

    img.src = url;
  });
}

/**
 * Load an image from a URL (used for sample gallery images).
 */
export function loadImageFromUrl(url: string): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const fileName = url.split('/').pop() ?? 'sample';
        const result = imageElementToImageData(img, fileName);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new ImageLoadError('Failed to load sample image.'));
    };

    img.src = url;
  });
}

function imageElementToImageData(
  img: HTMLImageElement,
  fileName: string,
): LoadedImage {
  const originalWidth = img.naturalWidth;
  const originalHeight = img.naturalHeight;

  let width = originalWidth;
  let height = originalHeight;

  // Resize to max dimension
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width > height) {
      height = Math.round((height / width) * MAX_DIMENSION);
      width = MAX_DIMENSION;
    } else {
      width = Math.round((width / height) * MAX_DIMENSION);
      height = MAX_DIMENSION;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ImageLoadError('Canvas 2D context not available.');

  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);

  return { imageData, width, height, originalWidth, originalHeight, fileName };
}

/**
 * Extract image from a ClipboardEvent paste.
 */
export function getImageFromClipboard(event: ClipboardEvent): File | null {
  const items = event.clipboardData?.items;
  if (!items) return null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return null;
}
