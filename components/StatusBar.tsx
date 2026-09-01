'use client';

import { EditorStatus } from '@/lib/types';

interface Props {
  status: EditorStatus;
  message: string;
  fileName: string | null;
  dimensions: string | null;
}

const STATUS_DOTS: Record<EditorStatus, string> = {
  empty: 'bg-surface-4',
  loading: 'bg-warning animate-pulse',
  ready: 'bg-success',
  exporting: 'bg-info animate-pulse',
  error: 'bg-danger animate-pulse',
};

export default function StatusBar({ status, message, fileName, dimensions }: Props) {
  return (
    <div className="h-9 px-4 flex items-center justify-between border-t border-surface-3 bg-surface-1 text-xs">
      <div className="flex items-center gap-2" aria-live="polite">
        <span className={"w-2 h-2 rounded-full " + (STATUS_DOTS[status] || 'bg-surface-4')} />
        <span className="text-text-secondary">{message}</span>
      </div>
      <div className="flex items-center gap-3 text-text-muted">
        {fileName && <span>{fileName}</span>}
        {dimensions && <span>{dimensions}</span>}
      </div>
    </div>
  );
}
