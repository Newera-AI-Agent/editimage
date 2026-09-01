export type ImageFormat = 'png' | 'jpeg' | 'webp';
export type RotationAngle = 0 | 90 | 180 | 270;

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EditAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
}

export interface GeometricEdits {
  rotation: RotationAngle;
  flipH: boolean;
  flipV: boolean;
  crop: CropRect | null;
}

export interface EditState {
  adjustments: EditAdjustments;
  geometric: GeometricEdits;
}

export const DEFAULT_ADJUSTMENTS: EditAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
};

export const DEFAULT_GEOMETRIC: GeometricEdits = {
  rotation: 0,
  flipH: false,
  flipV: false,
  crop: null,
};

export const DEFAULT_EDIT_STATE: EditState = {
  adjustments: { ...DEFAULT_ADJUSTMENTS },
  geometric: { ...DEFAULT_GEOMETRIC },
};

export type EditorStatus = 'empty' | 'loading' | 'ready' | 'exporting' | 'error';

export interface ImageData {
  source: HTMLImageElement;
  objectUrl: string;
  fileName: string;
  width: number;
  height: number;
}

export const SUPPORTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

export interface EditorError { code: string; message: string; }

export interface FilterPreset {
  id: string;
  label: string;
  description: string;
  adjustments: EditAdjustments;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'vintage',
    label: 'Vintage',
    description: 'Warm faded film look',
    adjustments: { brightness: 5, contrast: -10, saturation: -20, blur: 0, grayscale: 0, sepia: 40 },
  },
  {
    id: 'cool',
    label: 'Cool',
    description: 'Blue-tinted crisp feel',
    adjustments: { brightness: 0, contrast: 10, saturation: 10, blur: 0, grayscale: 0, sepia: 0 },
  },
  {
    id: 'warm',
    label: 'Warm',
    description: 'Golden-hour glow',
    adjustments: { brightness: 10, contrast: 0, saturation: 20, blur: 0, grayscale: 0, sepia: 15 },
  },
  {
    id: 'dramatic',
    label: 'Dramatic',
    description: 'High contrast punch',
    adjustments: { brightness: -5, contrast: 40, saturation: 20, blur: 0, grayscale: 0, sepia: 0 },
  },
  {
    id: 'bw',
    label: 'B&W',
    description: 'Classic black and white',
    adjustments: { brightness: 0, contrast: 20, saturation: -100, blur: 0, grayscale: 100, sepia: 0 },
  },
  {
    id: 'soft',
    label: 'Soft',
    description: 'Dreamy low-contrast',
    adjustments: { brightness: 10, contrast: -15, saturation: -10, blur: 1, grayscale: 0, sepia: 0 },
  },
];
