'use client';

import { useCallback, useRef, useState } from 'react';
import { CropRect } from '@/lib/types';

interface Props {
  imageWidth: number;
  imageHeight: number;
  zoom: number;
  crop: CropRect | null;
  onCropChange: (crop: CropRect | null) => void;
  onCropApply: (crop: CropRect | null) => void;
  disabled: boolean;
}

export default function CropOverlay({
  imageWidth,
  imageHeight,
  zoom,
  crop,
  onCropChange,
  onCropApply,
  disabled,
}: Props) {
  const [active, setActive] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const displayW = imageWidth * zoom;
  const displayH = imageHeight * zoom;

  const defaultCrop: CropRect = {
    x: Math.round(imageWidth * 0.05),
    y: Math.round(imageHeight * 0.05),
    width: Math.round(imageWidth * 0.9),
    height: Math.round(imageHeight * 0.9),
  };

  const rect = crop || defaultCrop;

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (disabled || !overlayRef.current) return;
    const b = overlayRef.current.getBoundingClientRect();
    setStart({ x: clientX - b.left, y: clientY - b.top });
    setDragging(true);
  }, [disabled]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!dragging || !start || !overlayRef.current) return;
    const b = overlayRef.current.getBoundingClientRect();
    const curX = clientX - b.left;
    const curY = clientY - b.top;
    const x1 = start.x;
    const y1 = start.y;
    const nx = Math.round(Math.min(x1, curX) / zoom);
    const ny = Math.round(Math.min(y1, curY) / zoom);
    const nw = Math.round(Math.abs(curX - x1) / zoom);
    const nh = Math.round(Math.abs(curY - y1) / zoom);
    onCropChange({
      x: Math.max(0, nx),
      y: Math.max(0, ny),
      width: Math.min(nw, imageWidth - nx),
      height: Math.min(nh, imageHeight - ny),
    });
  }, [dragging, start, zoom, imageWidth, imageHeight, onCropChange]);

  const handleEnd = useCallback(() => {
    setDragging(false);
    setStart(null);
  }, []);

  const handleApply = useCallback(() => {
    onCropApply(crop);
    setActive(false);
  }, [crop, onCropApply]);

  const handleCancel = useCallback(() => {
    onCropApply(null);
    setActive(false);
  }, [onCropApply]);

  const handleActivate = useCallback(() => {
    if (!active) {
      onCropChange(defaultCrop);
      setActive(true);
    }
  }, [active, onCropChange, defaultCrop]);

  return (
    <div className="flex flex-col gap-1">
      {active && (
        <div
          ref={overlayRef}
          className="relative border border-surface-3 rounded overflow-hidden"
          style={{ width: displayW, height: displayH }}
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute border-2 border-accent"
            style={{
              left: rect.x * zoom,
              top: rect.y * zoom,
              width: rect.width * zoom,
              height: rect.height * zoom,
            }}
          >
            <div className="absolute inset-0 bg-white/10" />
            {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
              <div
                key={c}
                className="absolute w-3 h-3 border-white"
                style={{
                  top: c[0] === 't' ? -1 : undefined,
                  bottom: c[0] === 'b' ? -1 : undefined,
                  left: c[1] === 'l' ? -1 : undefined,
                  right: c[1] === 'r' ? -1 : undefined,
                  borderTopWidth: c[0] === 't' ? 2 : 0,
                  borderBottomWidth: c[0] === 'b' ? 2 : 0,
                  borderLeftWidth: c[1] === 'l' ? 2 : 0,
                  borderRightWidth: c[1] === 'r' ? 2 : 0,
                }}
              />
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-1 mt-1">
        <button
          type="button"
          onClick={active ? handleApply : handleActivate}
          disabled={disabled}
          className={"px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors " +
            (active
              ? "bg-accent text-white border-accent hover:bg-accent-strong"
              : "border-surface-3 text-text-secondary hover:bg-surface-2 hover:text-text-primary"
            )}
        >
          {active ? 'Apply Crop' : 'Crop'}
        </button>
        {active && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-3 text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
