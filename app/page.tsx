'use client';

import { useCallback, useEffect, useState } from 'react';
import ImportZone from '@/components/ImportZone';
import ImageCanvas from '@/components/ImageCanvas';
import EditControls from '@/components/EditControls';
import ExportPanel from '@/components/ExportPanel';
import Toolbar from '@/components/Toolbar';
import StatusBar from '@/components/StatusBar';
import CropOverlay from '@/components/CropOverlay';
import { exportEditedImage, downloadBlob, loadImageFromFile } from '@/lib/image';
import { useEditorStore } from '@/lib/editor-store';

export default function EditorPage() {
  const { store, actions } = useEditorStore();

  const handleFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    actions.setStatus('loading');
    actions.setStatusMessage('Loading image...');
    loadImageFromFile(file).then((img) => {
      actions.setImage({
        source: img,
        objectUrl: URL.createObjectURL(file),
        fileName: file.name,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }).catch((err) => {
      actions.setError({ code: 'LOAD_ERROR', message: err.message });
      actions.setStatus('error');
      actions.setStatusMessage('Failed to load image');
    });
  }, [actions]);

  const handleExport = useCallback(async (format: string, quality: number, filename: string) => {
    if (!store.image) return;
    actions.setStatus('exporting');
    actions.setStatusMessage('Exporting...');
    try {
      const blob = await exportEditedImage(
        store.image.source,
        store.editState,
        format as 'png' | 'jpeg' | 'webp',
        quality
      );
      downloadBlob(blob, filename + '.' + (format === 'jpeg' ? 'jpg' : format));
      actions.setStatus('ready');
      actions.setStatusMessage('Exported!');
    } catch (err: unknown) {
      actions.setStatus('error');
      actions.setStatusMessage((err as Error).message || 'Export failed');
    }
  }, [store.image, store.editState, actions]);

  const dims = store.image ? `${store.image.width} x ${store.image.height} px` : null;
  const isReady = store.status === 'ready';
  // Calculate display dimensions for crop overlay (before rotation)

  const [cropMode, setCropMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Keyboard shortcuts and clipboard paste
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (store.canUndo) actions.undo();
      } else if (e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (store.canRedo) actions.redo();
      } else if (e.key === 's') {
        e.preventDefault();
        // Trigger export via a known DOM element
        const exportBtn = document.querySelector('[data-export-btn]') as HTMLButtonElement | null;
        if (exportBtn && !exportBtn.disabled) exportBtn.click();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [actions, store.canUndo, store.canRedo]);

  // Clipboard paste support
  useEffect(() => {
    const pasteHandler = (e: ClipboardEvent) => {
      if (!isReady && store.status !== 'loading') {
        const items = e.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
              e.preventDefault();
              const file = items[i].getAsFile();
              if (file) handleFiles([file]);
              return;
            }
          }
        }
      }
    };
    window.addEventListener('paste', pasteHandler);
    return () => window.removeEventListener('paste', pasteHandler);
  }, [isReady, store.status, handleFiles]);

  // Escape to cancel crop
  useEffect(() => {
    if (!cropMode) return;
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCropMode(false);
        actions.setCrop(null);
        actions.setStatusMessage('Crop cancelled');
      }
    };
    window.addEventListener('keydown', escHandler);
    return () => window.removeEventListener('keydown', escHandler);
  }, [cropMode, actions]);

  return (
    <div className="flex flex-col h-screen bg-surface-0">
      {!store.image ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          {/* Empty-state illustration */}
          <div className="relative w-48 h-48 text-surface-4">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
              <rect x="40" y="30" width="120" height="140" rx="12" stroke="currentColor" strokeWidth="2" />
              <circle cx="100" cy="85" r="30" stroke="currentColor" strokeWidth="2" />
              <path d="M55 150l30-35 20 20 40-45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="100" cy="85" r="8" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">EditImage</h1>
            <p className="text-text-secondary text-sm max-w-md">
              A fast, privacy-first image editor. No uploads, no tracking — your images stay on your device.
            </p>
          </div>
          <ImportZone onFiles={handleFiles} disabled={store.status === 'loading'} />
          <div className="flex gap-6 text-xs text-text-muted flex-wrap justify-center">
            <span>Drag & drop</span>
            <span className="hidden sm:inline">—</span>
            <span className="hidden sm:inline">Click to browse</span>
            <span className="hidden sm:inline">—</span>
            <span>Paste from clipboard</span>
          </div>
          <div className="text-xs text-text-muted mt-2 space-y-1 text-center">
            <p>Once loaded: <kbd className="px-1.5 py-0.5 text-xs bg-surface-2 border border-surface-3 rounded">Ctrl+Z</kbd> undo · <kbd className="px-1.5 py-0.5 text-xs bg-surface-2 border border-surface-3 rounded">Ctrl+S</kbd> export · <kbd className="px-1.5 py-0.5 text-xs bg-surface-2 border border-surface-3 rounded">R</kbd> rotate · <kbd className="px-1.5 py-0.5 text-xs bg-surface-2 border border-surface-3 rounded">F</kbd> before/after</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-4 py-2 border-b border-surface-3 shrink-0">
            <Toolbar
              zoom={store.zoom}
              onZoomIn={() => actions.setZoom(Math.min(store.zoom + 0.25, 4))}
              onZoomOut={() => actions.setZoom(Math.max(store.zoom - 0.25, 0.1))}
              onZoomReset={() => actions.setZoom(1)}
              onToggleOriginal={() => actions.toggleOriginal()}
              showOriginal={store.showOriginal}
              onUndo={actions.undo}
              onRedo={actions.redo}
              canUndo={store.canUndo}
              canRedo={store.canRedo}
              disabled={!isReady}
            />
            <ImportZone onFiles={handleFiles} compact disabled={!isReady} />
          </div>
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
              <div className="relative">
                <ImageCanvas
                  image={store.image.source}
                  editState={store.editState}
                  zoom={store.zoom}
                  showOriginal={store.showOriginal}
                />
                {cropMode && store.image && (
                  <CropOverlay
                    imageWidth={store.image.width}
                    imageHeight={store.image.height}
                    zoom={store.zoom}
                    
                    crop={store.editState.geometric.crop}
                    onCropChange={actions.setCrop}
                    onCropApply={(crop) => { actions.setCrop(crop); setCropMode(false); }}
                    disabled={!isReady}
                  />
                )}
              </div>
            </div>
            {/* Sidebar toggle for mobile */}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden fixed bottom-4 right-4 z-30 p-3 rounded-full bg-accent text-white shadow-lg hover:bg-accent-strong transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'} />
              </svg>
            </button>
            <aside className={`${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 w-72 shrink-0 border-l border-surface-3 overflow-y-auto p-4 space-y-4 transition-transform duration-200 lg:static fixed right-0 top-0 bottom-0 z-20 bg-surface-1 pt-16 lg:pt-4`}>
              <EditControls
                editState={store.editState}
                disabled={!isReady}
                onAdjust={actions.updateAdjustment}
                onApplyPreset={actions.applyPreset}
                onRotateLeft={() => actions.setRotation(-90)}
                onRotateRight={() => actions.setRotation(90)}
                onFlipH={actions.toggleFlipH}
                onFlipV={actions.toggleFlipV}
                onReset={actions.resetEdits}
                cropMode={cropMode}
                onCropToggle={() => setCropMode(!cropMode)}
              />
              <ExportPanel
                disabled={!isReady}
                onExport={handleExport}
              />
            </aside>
          </div>
          <StatusBar
            status={store.status}
            message={store.statusMessage}
            fileName={store.image?.fileName ?? null}
            dimensions={dims}
          />
        </>
      )}
    </div>
  );
}
