'use client';

import { useCallback, useEffect } from 'react';
import ImportZone from '@/components/ImportZone';
import ImageCanvas from '@/components/ImageCanvas';
import EditControls from '@/components/EditControls';
import ExportPanel from '@/components/ExportPanel';
import Toolbar from '@/components/Toolbar';
import StatusBar from '@/components/StatusBar';
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
              <ImageCanvas
                image={store.image.source}
                editState={store.editState}
                zoom={store.zoom}
                showOriginal={store.showOriginal}
              />
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
