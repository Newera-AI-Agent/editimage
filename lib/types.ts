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