'use client';

import { useCallback, useRef, useState } from 'react';
import { SUPPORTED_TYPES, MAX_FILE_SIZE } from '@/lib/types';

interface ImportZoneProps {
  onFiles: (files: File[]) => void;
  disabled: boolean;
  compact?: boolean;
}

export default function ImportZone({ onFiles, disabled, compact }: ImportZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndLoad = useCallback((file: File) => {
    setValidationError(null);
    if (!SUPPORTED_TYPES.includes(file.type as typeof SUPPORTED_TYPES[number])) {
      setValidationError(`Unsupported file type: ${file.type || 'unknown'}. Use PNG, JPEG, or WebP.`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setValidationError(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
      return;
    }
    onFiles([file]);
  }, [onFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) validateAndLoad(files[0]);
  }, [disabled, validateAndLoad]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) validateAndLoad(files[0]);
    if (inputRef.current) inputRef.current.value = '';
  }, [validateAndLoad]);

  if (compact) {
    return (
      <div>
        <button
          type="button"
          onClick={() => !disabled && inputRef.current?.click()}
          disabled={disabled}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-3 text-text-secondary hover:bg-surface-2 hover:text-text-primary disabled:opacity-40 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          aria-label="Import new image"
        >
          New Image
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleChange}
          className="hidden"
          aria-hidden="true"
        />
        {validationError && (
          <p role="alert" className="mt-2 text-sm text-danger">{validationError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label="Import image — click or drag and drop"
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !disabled && inputRef.current?.click(); } }}
        className={`
          relative flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed
          transition-colors duration-200 cursor-pointer outline-none
          focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0
          ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
          ${dragOver
            ? 'border-accent bg-accent-subtle/30'
            : 'border-surface-3 hover:border-text-muted'
          }
        `}
      >
        {dragOver ? (
          <p className="text-accent text-sm font-medium">Drop image here</p>
        ) : (
          <>
            <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-text-secondary">
              <span className="text-accent font-medium">Click to browse</span> or drag and drop
            </p>
            <p className="text-xs text-text-muted">PNG, JPEG, WebP — up to 20MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>
      {validationError && (
        <p role="alert" className="mt-2 text-sm text-danger">{validationError}</p>
      )}
    </div>
  );
}
