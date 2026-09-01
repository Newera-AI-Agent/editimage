'use client';

import { useRef, useEffect } from 'react';
import { EditState } from '@/lib/types';

interface Props {
  image: HTMLImageElement | null;
  editState: EditState;
  zoom: number;
  showOriginal: boolean;
}

function buildFilter(adj: EditState['adjustments']): string {
  const parts: string[] = [];
  if (adj.brightness !== 0) parts.push('brightness(' + (100 + adj.brightness) + '%)');
  if (adj.contrast !== 0) parts.push('contrast(' + (100 + adj.contrast) + '%)');
  if (adj.saturation !== 0) parts.push('saturate(' + (100 + adj.saturation) + '%)');
  if (adj.blur > 0) parts.push('blur(' + adj.blur + 'px)');
  if (adj.grayscale > 0) parts.push('grayscale(' + adj.grayscale + '%)');
  if (adj.sepia > 0) parts.push('sepia(' + adj.sepia + '%)');
  return parts.join(' ');
}