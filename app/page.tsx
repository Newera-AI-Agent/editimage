'use client';

import { useCallback } from 'react';
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
        store.image!.source,
        store.editState,
        format as 'png' | 'jpeg' | 'webp',
        quality
      );
      downloadBlob(blob, filename + '.' + (format === 'jpeg' ? 'jpg' : format));
      actions.setStatus('ready');
      actions.setStatusMessage('Exported!');
    } catch (err: any) {
      actions.setStatus('error');
      actions.setStatusMessage(err.message || 'Export failed');
    }
  }, [store.image, store.editState, actions]);