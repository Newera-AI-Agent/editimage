'use client';

import { useState, useCallback, useRef } from 'react';
import { CropRect } from '@/lib/types';

interface Props {
  imageWidth: number;
  imageHeight: number;
  displayWidth: number;
  displayHeight: number;
  crop: CropRect | null;
  onCropChange: (crop: CropRect | null) => void;
  onCropApply: (crop: CropRect | null) => void;
  disabled: boolean;
}

export default function CropOverlay({
  imageWidth,
  imageHeight,
  scale,
  crop,
  onCropChange,
  onCropApply,
  disabled,
}: Props) {
  const [active, setActive] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const defaultCrop: CropRect = {
    x: Math.round(imageWidth * 0.05),
    y: Math.round(imageHeight * 0.05),
    width: Math.round(imageWidth * 0.9),
    height: Math.round(imageHeight * 0.9),
  };

  const rect = crop || defaultCrop;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    const el = overlayRef.current;
    if (!el) return;
    const bounds = el.getBoundingClientRect();
    setDragStart({
      x: (e.clientX - bounds.left) / scale,
      y: (e.clientY - bounds.top) / scale,
    });
    setDragging(true);
  }, [disabled, scale]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !dragStart || !overlayRef.current) return;
    const bounds = overlayRef.current.getBoundingClientRect();
    const currentX = (e.clientX - bounds.left) / scale;
    const currentY = (e.clientY - bounds.top) / scale;

    const newX = Math.max(0, Math.min(dragStart.x, currentX));
    const newY = Math.max(0, Math.min(dragStart.y, currentY));
    const newW = Math.abs(currentX - dragStart.x);
    const newH = Math.abs(currentY - dragStart.y);

    onCropChange({
      x: Math.round(newX),
      y: Math.round(newY),
      width: Math.round(Math.min(newW, imageWidth - newX)),
      height: Math.round(Math.min(newH, imageHeight - newY)),
    });
  }, [dragging, dragStart, scale, imageWidth, imageHeight, onCropChange]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
    setDragStart(null);
  }, []);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    if (active) {
      onCropApply(crop);
    } else {
      onCropChange(defaultCrop);
    }
    setActive(!active);
  }, [active, disabled, crop, onCropApply, onCropChange]);

  const handleCancel = useCallback(() => {
    setActive(false);
    setDragging(false);
    onCropApply(null);
    onCropChange(null);
  }, [onCropApply, onCropChange]);

  return (
    <div className="relative">
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={"px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none " +
            (active
              ? "bg-accent text-white border-accent"
              : "border-surface-3 text-text-secondary hover:bg-surface-2 hover:text-text-primary"
            )}
          aria-label={active ? 'Apply crop' : 'Crop image'}
        >
          {active ? 'Apply Crop' : 'Crop'}
        </button>
        {active && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-3 text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            aria-label="Cancel crop"
          >
            Cancel
          </button>
        )}
      </div>
      {active && (
        <div
          ref={overlayRef}
          className="relative overflow-hidden rounded-lg border border-surface-3 bg-surface-1/50"
          style={{ width: imageWidth * scale, height: imageHeight * scale }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute border-2 border-accent bg-transparent"
            style={{
              left: rect.x * scale,
              top: rect.y * scale,
              width: rect.width * scale,
              height: rect.height * scale,
            }}
          >
            <div className="absolute inset-0 bg-white/5" />
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white -translate-x-0.5 -translate-y-0.5" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white translate-x-0.5 -translate-y-0.5" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white -translate-x-0.5 translate-y-0.5" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white translate-x-0.5 translate-y-0.5" />
          </div>
        </div>
      )}
    </div>
  );
}
