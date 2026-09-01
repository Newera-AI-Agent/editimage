'use client';
import { useState } from 'react';

interface Props {
  disabled: boolean;
  onExport: (f: string, q: number, n: string) => void;
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
      <h3 className="text-sm font-medium text-text-primary">Export</h3>
      <div className="space-y-1">
        <label htmlFor="export-format" className="text-xs text-text-secondary">Format</label>
        <select id="export-format" value={format} onChange={(e) => setFormat(e.target.value)} disabled={disabled || exporting} className="w-full px-3 py-2 text-sm rounded-lg border border-surface-3 bg-surface-2 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none disabled:opacity-40">
          <option value="PNG">PNG</option>
          <option value="JPEG">JPEG</option>
          <option value="WebP">WebP</option>
        </select>
      </div>
      {format !== 'PNG' && (
        <div className="space-y-1">
          <label htmlFor="export-quality" className="text-xs text-text-secondary">Quality: {Math.round(quality * 100)}%</label>
          <input id="export-quality" type="range" min="0.1" max="1" step="0.1" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} disabled={disabled || exporting} className="w-full h-1.5 bg-surface-3 rounded-lg appearance-none cursor-pointer accent-accent disabled:opacity-40"/>
        </div>
      )}
      <div className="space-y-1">
        <label htmlFor="export-filename" className="text-xs text-text-secondary">Filename</label>
        <input id="export-filename" type="text" value={filename} onChange={(e) => setFilename(e.target.value)} disabled={disabled || exporting} className="w-full px-3 py-2 text-sm rounded-lg border border-surface-3 bg-surface-2 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent focus:outline-none disabled:opacity-40" />
      </div>
      <button data-export-btn onClick={handleExport} disabled={disabled || exporting} className="w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent-strong disabled:opacity-40 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 focus-visible:outline-none" aria-label="Export image">
        {exporting ? 'Exporting...' : 'Export'}
      </button>
    </div>
  );
}
