'use client';

import { useRef, useEffect } from 'react';
import { EditState } from '@/lib/types';

interface Props {
  image: HTMLImageElement | null;
  editState: EditState;
  zoom: number;
  showOriginal: boolean;
}

function buildFilter(adj: EditState['adjustments']): string {
  const parts: string[] = [];
  if (adj.brightness !== 0) parts.push('brightness(' + (100 + adj.brightness) + '%)');
  if (adj.contrast !== 0) parts.push('contrast(' + (100 + adj.contrast) + '%)');
  if (adj.saturation !== 0) parts.push('saturate(' + (100 + adj.saturation) + '%)');
  if (adj.blur > 0) parts.push('blur(' + adj.blur + 'px)');
  if (adj.grayscale > 0) parts.push('grayscale(' + adj.grayscale + '%)');
  if (adj.sepia > 0) parts.push('sepia(' + adj.sepia + '%)');
  return parts.join(' ');
}

export default function ImageCanvas({ image, editState, zoom, showOriginal }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { rotation, flipH, flipV, crop } = editState.geometric;
    let srcW = image.naturalWidth;
    let srcH = image.naturalHeight;
    let srcX = 0;
    let srcY = 0;

    if (crop) {
      srcX = crop.x;
      srcY = crop.y;
      srcW = crop.width;
      srcH = crop.height;
    }

    const isRotated = rotation === 90 || rotation === 270;
    const outW = isRotated ? srcH : srcW;
    const outH = isRotated ? srcW : srcH;

    canvas.width = outW;
    canvas.height = outH;

    ctx.clearRect(0, 0, outW, outH);
    ctx.save();
    ctx.translate(outW / 2, outH / 2);

    if (rotation !== 0) {
      ctx.rotate((rotation * Math.PI) / 180);
    }
    if (flipH) ctx.scale(-1, 1);
    if (flipV) ctx.scale(1, -1);

    if (!showOriginal) {
      ctx.filter = buildFilter(editState.adjustments);
    }

    ctx.drawImage(image, srcX, srcY, srcW, srcH, -srcW / 2, -srcH / 2, srcW, srcH);
    ctx.restore();
  }, [image, editState, zoom, showOriginal]);

  if (!image) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-muted bg-surface-1 rounded-xl border border-surface-3">
        <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm">No image loaded</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-xl border border-surface-3 bg-surface-1" style={{ maxHeight: '70vh' }}>
      <div style={{ transform: 'scale(' + zoom + ')', transformOrigin: 'top left' }}>
        <canvas ref={canvasRef} className="block" aria-label="Image preview" />
      </div>
    </div>
  );
}
