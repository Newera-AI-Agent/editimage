import os
BASE = '/home/runner/work/editimage/editimage'

def w(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w') as f:
        f.write(content)
    print(f'Wrote {path} ({len(content)} chars)')

# === ExportPanel.tsx ===
w('components/ExportPanel.tsx', """'use client';

import { useState } from 'react';

interface Props {
  disabled: boolean;
  onExport: (format: string, quality: number, filename: string) => Promise<void>;
}

export default function ExportPanel({ disabled, onExport }: Props) {
  const [format, setFormat] = useState('PNG');
  const [quality, setQuality] = useState(0.9);
  const [filename, setFilename] = useState('edited-image');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await onExport(format.toLowerCase(), quality, filename);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 p-4 space-y-4">
      <h3 className="text-sm font-medium t