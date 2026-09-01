'use client';

import type { EditorStatus } from '@/lib/types';

interface StatusBarProps {
  status: EditorStatus;
  message: string;
  fileName: string | null;
  dimensions: string | null;
}

export default function StatusBar({ status, message, fileName, dimensions }: StatusBarProps) {
  const statusLabel: Record<EditorStatus, string> = {
    empty: 'No image',
    loading: 'Loading...',
    ready: 'Ready',
    exporting: 'Exporting...',
    error: 'Error',
  };

  const statusDotColor: Record<EditorStatus, string> = {
    empty: 'bg-text-muted',
    loading: 'bg-warning animate-pulse',
    ready: 'bg-success',
    exporting: 'bg-warning animate-pulse',
    error: 'bg-danger',
  };

  return (
    <footer
      role="status"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between h-8 px-4 text-xs bg-surface-1 border-t border-surface-3 text-text-secondary"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${statusDotColor[status]}`}
          aria-hidden="true"
        />
        <span className="truncate">
          {statusLabel[status]}
        </span>
        {fileName && (
          <span className="truncate text-text-muted hidden sm:inline">
            {fileName}
          </span>
        )}
        {dimensions && (
          <span className="text-text-muted hidden sm:inline flex-shrink-0">
            {dimensions}
          </span>
        )}
      </div>
      <div className="flex-shrink-0">
        <span className="sr-only">{message}</span>
        <span aria-hidden="true" className="truncate max-w-[200px] hidden md:inline">
          {message}
        </span>
      </div>
    </footer>
  );
}
