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

  return (
    <div className="flex flex-col h-screen bg-surface-0">
      {!store.image ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <ImportZone onFiles={handleFiles} disabled={store.status === 'loading'} />
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
            <aside className="w-72 shrink-0 border-l border-surface-3 overflow-y-auto p-4 space-y-4">
              <EditControls
                editState={store.editState}
                disabled={!isReady}
                onAdjust={actions.updateAdjustment}
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
