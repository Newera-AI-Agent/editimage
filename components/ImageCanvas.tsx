'use client';

import { useRef, useEffect } from 'react';
import type { EditState } from '@/lib/types';
import { buildCssFilter, buildCssTransform } from '@/lib/image';

interface ImageCanvasProps {
  image: HTMLImageElement | null;
  editState: EditState;
  zoom: number;
  showOriginal: boolean;
}

export default function ImageCanvas({ image, editState, zoom, showOriginal }: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { rotation, flipH, flipV, crop } = editState.geometric;
    const adjustments = editState.adjustments;

    let srcX = 0;
    let srcY = 0;
    let srcW = image.naturalWidth;
    let srcH = image.naturalHeight;

    if (crop) {
      srcX = crop.x;
      srcY = crop.y;
      srcW = crop.width;
      srcH = crop.height;
    }

    const isRotated90 = rotation === 90 || rotation === 270;
    const outW = isRotated90 ? srcH : srcW;
    const outH = isRotated90 ? srcW : srcH;

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
      const filterStr = buildCssFilter(adjustments);
      if (filterStr) {
        ctx.filter = filterStr;
      }
    }

    ctx.drawImage(image, srcX, srcY, srcW, srcH, -srcW / 2, -srcH / 2, srcW, srcH);
    ctx.restore();
  }, [image, editState, showOriginal]);

  if (!image) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-1 rounded-lg border border-surface-3 min-h-[300px]">
        <div className="flex flex-col items-center gap-4 text-text-muted">
          <svg
            className="w-16 h-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-sm font-medium">No image loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center overflow-auto bg-surface-1 rounded-lg border border-surface-3 p-4">
      <div
        ref={wrapperRef}
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.15s ease-out' }}
        className="flex items-center justify-center"
      >
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain"
          style={{
            imageRendering: zoom > 2 ? 'pixelated' : 'auto',
          }}
          aria-label="Image preview canvas"
        />
      </div>
      <div className="sr-only" aria-live="polite" role="status">
        {showOriginal ? 'Showing original image' : 'Showing edited image'}
        {`, zoom: ${Math.round(zoom * 100)}%`}
      </div>
    </div>
  );
}
