'use client';

interface TProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onToggleOriginal: () => void;
  showOriginal: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  disabled: boolean;
}

function Btn(p: { onClick: () => void; disabled: boolean; label: string; children: React.ReactNode }) {
  return <button type="button" onClick={p.onClick} disabled={p.disabled} aria-label={p.label} className="p-2 rounded-lg text-text-secondary hover:bg-surface-2 hover:text-text-primary disabled:opacity-30 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none">{p.children}</button>;
}

function Sep() {
  return <div className="w-px h-6 bg-surface-3" />;
}

export default function Toolbar(p: TProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 rounded-xl border border-surface-3 bg-surface-1">
      <Btn onClick={p.onZoomOut} disabled={p.disabled} label="Zoom out">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"/></svg>
      </Btn>
      <span className="text-xs text-text-secondary tabular-nums min-w-[3rem] text-center">{Math.round(p.zoom * 100)}%</span>
      <Btn onClick={p.onZoomIn} disabled={p.disabled} label="Zoom in">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"/></svg>
      </Btn>
      <Btn onClick={p.onZoomReset} disabled={p.disabled} label="Reset zoom">
        <span className="text-xs font-medium">1:1</span>
      </Btn>
      <Sep />
      <Btn onClick={p.onToggleOriginal} disabled={p.disabled} label={p.showOriginal ? "Show edited" : "Show original"}>
        <span className="text-xs font-medium">{p.showOriginal ? "Edited" : "Orig"}</span>
      </Btn>
      <Sep />
      <Btn onClick={p.onUndo} disabled={p.disabled || !p.canUndo} label="Undo">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"/></svg>
      </Btn>
      <Btn onClick={p.onRedo} disabled={p.disabled || !p.canRedo} label="Redo">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"/></svg>
      </Btn>
    </div>
  );
}