'use client';

import { useState } from 'react';
import { EditState } from '@/lib/types';

type SD = { key: string; label: string; min: number; max: number; step: number; unit: string; };

const SLIDERS: SD[] = [
  { key: 'brightness', label: 'Brightness', min: -100, max: 100, step: 1, unit: '' },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1, unit: '' },
  { key: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1, unit: '' },
  { key: 'blur', label: 'Blur', min: 0, max: 20, step: 0.5, unit: 'px' },
  { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'sepia', label: 'Sepia', min: 0, max: 100, step: 1, unit: '%' },
];

interface Props {
  editState: EditState;
  disabled: boolean;
  onAdjust: <K extends keyof EditState['adjustments']>(key: K, value: number) => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onReset: () => void;
  cropMode: boolean;
  onApplyPreset: (presetId: string) => void;
  onCropToggle: () => void;
}

export default function EditControls({ editState, disabled, onAdjust, onRotateLeft, onRotateRight, onFlipH, onFlipV, onReset, cropMode, onCropToggle }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 overflow-hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-primary hover:bg-surface-2 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        <span>Adjustments</span>
        <svg className={"w-4 h-4 transition-transform " + (isOpen ? 'rotate-180' : '')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          {SLIDERS.map((slider) => {
            const val = editState.adjustments[slider.key as keyof EditState['adjustments']];
            return (
              <div key={slider.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor={'slider-' + slider.key} className="text-xs text-text-secondary">{slider.label}</label>
                  <button
                    type="button"
                    onClick={() => onAdjust(slider.key as keyof EditState['adjustments'], 0)}
                    className="text-xs text-text-muted hover:text-accent transition-colors focus-visible:ring-1 focus-visible:ring-accent rounded px-1"
                    aria-label={'Reset ' + slider.label}
                  >
                    reset
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id={'slider-' + slider.key}
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={val}
                    onChange={(e) => onAdjust(slider.key as keyof EditState['adjustments'], parseFloat(e.target.value))}
                    disabled={disabled}
                    className="flex-1 h-1.5 bg-surface-3 rounded-lg appearance-none cursor-pointer accent-accent disabled:opacity-40"
                  />
                  <span className="text-xs text-text-muted w-12 text-right tabular-nums">
                    {val}{slider.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="border-t border-surface-3 px-4 py-3 flex flex-wrap gap-2">
        <button onClick={onRotateLeft} disabled={disabled} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-3 text-text-secondary hover:bg-surface-2 hover:text-text-primary disabled:opacity-40 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none" aria-label="Rotate left">
          Rotate Left
        </button>
        <button onClick={onRotateRight} disabled={disabled} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-3 text-text-secondary hover:bg-surface-2 hover:text-text-primary disabled:opacity-40 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none" aria-label="Rotate right">
          Rotate Right
        </button>
        <button onClick={onFlipH} disabled={disabled} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-3 text-text-secondary hover:bg-surface-2 hover:text-text-primary disabled:opacity-40 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none" aria-label="Flip horizontal">
          Flip H
        </button>
        <button onClick={onFlipV} disabled={disabled} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-3 text-text-secondary hover:bg-surface-2 hover:text-text-primary disabled:opacity-40 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none" aria-label="Flip vertical">
          Flip V
        </button>
        <button onClick={onCropToggle} disabled={disabled} className={"px-3 py-1.5 text-xs font-medium rounded-lg border " + (cropMode ? "border-accent bg-accent-subtle/30 text-accent" : "border-surface-3 text-text-secondary hover:bg-surface-2 hover:text-text-primary") + " disabled:opacity-40 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"} aria-label="Toggle crop mode">
          Crop
        </button>
        <button onClick={onReset} disabled={disabled} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 disabled:opacity-40 transition-colors focus-visible:ring-2 focus-visible:ring-danger focus-visible:outline-none" aria-label="Reset all edits">
          Reset All
        </button>
      </div>
    </div>
  );
}
