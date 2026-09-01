export type { EditState, ImageFormat } from './types';

/**
 * Load an image from a File object.
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

/**
 * Build a CSS filter string from adjustment values.
 */
export function buildCssFilter(a: {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
}): string {
  const filters: string[] = [];
  if (a.brightness !== 0) filters.push(`brightness(${1 + a.brightness / 100})`);
  if (a.contrast !== 0) filters.push(`contrast(${1 + a.contrast / 100})`);
  if (a.saturation !== 0) filters.push(`saturate(${1 + a.saturation / 100})`);
  if (a.blur > 0) filters.push(`blur(${a.blur}px)`);
  if (a.grayscale > 0) filters.push(`grayscale(${a.grayscale}%)`);
  if (a.sepia > 0) filters.push(`sepia(${a.sepia}%)`);
  return filters.join(' ');
}

/**
 * Build CSS transform string from geometric edits.
 */
export function buildCssTransform(g: {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}): string {
  const transforms: string[] = [];
  if (g.rotation !== 0) transforms.push(`rotate(${g.rotation}deg)`);
  if (g.flipH) transforms.push('scaleX(-1)');
  if (g.flipV) transforms.push('scaleY(-1)');
  return transforms.join(' ');
}

/**
 * Export the edited image by drawing onto a canvas.
 */
export function exportEditedImage(
  source: HTMLImageElement,
  editState: EditState,
  format: ImageFormat,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const { rotation, flipH, flipV, crop } = editState.geometric;

    let srcW = source.naturalWidth;
    let srcH = source.naturalHeight;
    let srcX = 0;
    let srcY = 0;

    if (crop) {
      srcX = crop.x;
      srcY = crop.y;
      srcW = crop.width;
      srcH = crop.height;
    }

    // Calculate output dimensions after rotation
    const isRotated90 = rotation === 90 || rotation === 270;
    const outW = isRotated90 ? srcH : srcW;
    const outH = isRotated90 ? srcW : srcH;

    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    ctx.save();

    // Translate to canvas center for rotation
    ctx.translate(outW / 2, outH / 2);

    // Apply rotation
    if (rotation !== 0) {
      ctx.rotate((rotation * Math.PI) / 180);
    }

    // Apply flips
    if (flipH) ctx.scale(-1, 1);
    if (flipV) ctx.scale(1, -1);

    // Build filter
    const { adjustments } = editState;
    let filterStr = 'none';
    const filters: string[] = [];
    if (adjustments.brightness !== 0) filters.push(`brightness(${100 + adjustments.brightness}%)`);
    if (adjustments.contrast !== 0) filters.push(`contrast(${100 + adjustments.contrast}%)`);
    if (adjustments.saturation !== 0) filters.push(`saturate(${100 + adjustments.saturation}%)`);
    if (adjustments.blur > 0) filters.push(`blur(${adjustments.blur}px)`);
    if (adjustments.grayscale > 0) filters.push(`grayscale(${adjustments.grayscale}%)`);
    if (adjustments.sepia > 0) filters.push(`sepia(${adjustments.sepia}%)`);
    if (filters.length > 0) filterStr = filters.join(' ');

    if (filterStr !== 'none') {
      ctx.filter = filterStr;
    }

    // Draw the image centered
    ctx.drawImage(source, srcX, srcY, srcW, srcH, -srcW / 2, -srcH / 2, srcW, srcH);
    ctx.restore();

    const mimeType = `image/${format === 'jpeg' ? 'jpeg' : format}`;
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      mimeType,
      quality
    );
  });
}

/**
 * Create a downloadable URL and trigger download for a blob.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
