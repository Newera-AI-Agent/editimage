'use client';

import { useState, useCallback } from 'react';
import { EditState, PresetFilter, PRESET_FILTERS } from '@/lib/types';

type SD = { key: string; label: string; min: number; max: number; step: number; unit: string };

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
  onApplyPreset: (preset: PresetFilter) => void;
  cropMode: boolean;
  onCropToggle: () => void;
}

export default function EditControls({
  editState, disabled, onAdjust, onRotateLeft, onRotateRight,
  onFlipH, onFlipV, onReset, onApplyPreset, cropMode, onCropToggle,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [showPresets, setShowPresets] = useState(true);

  const isDefault = useCallback(() => {
    const a = editState.adjustments;
    return a.brightness === 0 && a.contrast === 0 && a.saturation === 0 &&
      a.blur === 0 && a.grayscale === 0 && a.sepia === 0;
  }, [editState.adjustments]);

  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 overflow-hidden">
      {/* Preset Filters */}
      <button
        type="button"
        aria-expanded={showPresets}
        onClick={() => setShowPresets(!showPresets)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-primary hover:bg-surface-2 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        <span>Presets</span>
        <svg className={`w-4 h-4 transition-transform ${showPresets ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {showPresets && (
        <div className="px-4 pb-3">
          <div className="grid grid-cols-3 gap-1.5">
            {PRESET_FILTERS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                disabled={disabled}
                onClick={() => onApplyPreset(preset)}
                className="px-2 py-1.5 text-xs font-medium rounded-lg border border-surface-3 text-text-secondary hover:bg-surface-2 hover:text-text-primary hover:border-accent/50 disabled:opacity-40 transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                title={preset.description}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={disabled || isDefault()}
            onClick={onReset}
            className="mt-2 w-full px-3 py-1.5 text-xs font-medium rounded-lg bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 disabled:opacity-30 transition-colors focus-visible:ring-2 focus-visible:ring-danger focus-visible:outline-none"
            aria-label="Reset all adjustments"
          >
            Reset to Original
          </button>
        </div>
      )}

      <div className="border-t border-surface-3" />

      {/* Adjustments */}
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-primary hover:bg-surface-2 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        <span>Adjustments</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
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
                  <label htmlFor={`slider-${slider.key}`} className="text-xs text-text-secondary">{slider.label}</label>
                  <button
                    type="button"
                    onClick={() => onAdjust(slider.key as keyof EditState['adjustments'], 0)}
                    className="text-xs text-text-muted hover:text-accent transition-colors focus-visible:ring-1 focus-visible:ring-accent rounded px-1"
                    aria-label={`Reset ${slider.label}`}
                  >
                    reset
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id={`slider-${slider.key}`}
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

      {/* Transform tools */}
      <div className="border-t border-surface-3 px-4 py-3 flex flex-wrap gap-2">
        <button onClick={onRotateLeft} disabled={disabled} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-3 text-text-secondary hover:bg-surface-2 hover:text-text-primary disabled:opacity-40 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none" aria-label="Rotate left 90 degrees">
          <svg className="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.75H6.75A2.25 2.25 0 004.5 6v12a2.25 2.25 0 002.25 2.25h12A2.25 2.25 0 0021 18v-3M9.75 3.75h4.5M9.75 3.75V9m4.5-5.25V9M15 15l-3-3m0 0l-3 3m3-3v13.5"/></svg>
          Rotate L
        </button>
        <button onClick={onRotateRight} disabled={disabled} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-3 text-text-secondary hover:bg-surface-2 hover:text-text-primary disabled:opacity-40 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none" aria-label="Rotate right 90 degrees">
          <svg className="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 3.75h3A2.25 2.25 0 0120.5 6v12a2.25 2.25 0 01-2.25 2.25h-12A2.25 2.25 0 014 18v-3M14.25 3.75h-4.5M14.25 3.75V9m-4.5-5.25V9M9 15l3-3m0 0l3 3m-3-3v13.5"/></svg>
          Rotate R
        </button>
        <button onClick={onFlipH} disabled={disabled} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${editState.geometric.flipH ? 'border-accent bg-accent-subtle/30 text-accent' : 'border-surface-3 text-text-secondary hover:bg-surface-2 hover:text-text-primary'} disabled:opacity-40`} aria-label="Flip horizontal" aria-pressed={editState.geometric.flipH}>
          Flip H
        </button>
        <button onClick={onFlipV} disabled={disabled} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${editState.geometric.flipV ? 'border-accent bg-accent-subtle/30 text-accent' : 'border-surface-3 text-text-secondary hover:bg-surface-2 hover:text-text-primary'} disabled:opacity-40`} aria-label="Flip vertical" aria-pressed={editState.geometric.flipV}>
          Flip V
        </button>
        <button onClick={onCropToggle} disabled={disabled} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${cropMode ? 'border-accent bg-accent-subtle/30 text-accent' : 'border-surface-3 text-text-secondary hover:bg-surface-2 hover:text-text-primary'} disabled:opacity-40`} aria-label="Toggle crop mode" aria-pressed={cropMode}>
          Crop
        </button>
      </div>
    </div>
  );
}
