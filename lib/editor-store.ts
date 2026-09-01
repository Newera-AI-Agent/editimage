import { useRef, useState, useCallback } from 'react';
import {
  EditState,
  DEFAULT_EDIT_STATE,
  ImageData,
  EditorStatus,
  EditorError,
  CropRect,
} from './types';

export interface EditorStore {
  image: ImageData | null;
  editState: EditState;
  status: EditorStatus;
  error: EditorError | null;
  zoom: number;
  showOriginal: boolean;
  statusMessage: string;
  canUndo: boolean;
  canRedo: boolean;
}

export function createInitialStore(): EditorStore {
  return {
    image: null,
    editState: { ...DEFAULT_EDIT_STATE, adjustments: { ...DEFAULT_EDIT_STATE.adjustments }, geometric: { ...DEFAULT_EDIT_STATE.geometric } },
    status: 'empty',
    error: null,
    zoom: 1,
    showOriginal: false,
    statusMessage: '',
  };
}

export interface UndoEntry {
  editState: EditState;
}

export interface EditorActions {
  setImage: (data: ImageData | null) => void;
  setStatus: (status: EditorStatus) => void;
  setError: (error: EditorError | null) => void;
  setZoom: (zoom: number) => void;
  toggleOriginal: () => void;
  updateAdjustment: <K extends keyof EditState['adjustments']>(key: K, value: EditState['adjustments'][K]) => void;
  setRotation: (angle: number) => void;
  toggleFlipH: () => void;
  toggleFlipV: () => void;
  setCrop: (crop: CropRect | null) => void;
  resetEdits: () => void;
  undo: () => void;
  redo: () => void;
  setStatusMessage: (msg: string) => void;
  getSnapshot: () => EditorStore;
}

export function useEditorStore(): { store: EditorStore; actions: EditorActions } {
  const [image, setImageState] = useState<ImageData | null>(null);
  const [editState, setEditState] = useState<EditState>(() => ({
    adjustments: { ...DEFAULT_EDIT_STATE.adjustments },
    geometric: { ...DEFAULT_EDIT_STATE.geometric },
  }));
  const [status, setStatus] = useState<EditorStatus>('empty');
  const [error, setError] = useState<EditorError | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showOriginal, setShowOriginal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const undoStack = useRef<UndoEntry[]>([]);
  const redoStack = useRef<UndoEntry[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateUndoRedoState = useCallback(() => {
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(redoStack.current.length > 0);
  }, []);

  const pushUndo = useCallback((state: EditState) => {
    undoStack.current.push({ editState: state });
    if (undoStack.current.length > 50) undoStack.current.shift();
    redoStack.current = [];
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  const setImage = useCallback((data: ImageData | null) => {
    setImageState(data);
    if (data) {
      setStatus('ready');
      setError(null);
      setStatusMessage(`Loaded ${data.fileName}`);
    } else {
      setStatus('empty');
    }
  }, []);

  const updateAdjustment = useCallback(<K extends keyof EditState['adjustments']>(key: K, value: EditState['adjustments'][K]) => {
    setEditState(prev => {
      pushUndo(prev);
      return {
        ...prev,
        adjustments: { ...prev.adjustments, [key]: value },
      };
    });
  }, [pushUndo]);

  const setRotation = useCallback((angle: number) => {
    setEditState(prev => {
      pushUndo(prev);
      const current = prev.geometric.rotation;
      return {
        ...prev,
        geometric: { ...prev.geometric, rotation: ((current + angle) % 360) as 0 | 90 | 180 | 270 },
      };
    });
  }, [pushUndo]);

  const toggleFlipH = useCallback(() => {
    setEditState(prev => {
      pushUndo(prev);
      return { ...prev, geometric: { ...prev.geometric, flipH: !prev.geometric.flipH } };
    });
  }, [pushUndo]);

  const toggleFlipV = useCallback(() => {
    setEditState(prev => {
      pushUndo(prev);
      return { ...prev, geometric: { ...prev.geometric, flipV: !prev.geometric.flipV } };
    });
  }, [pushUndo]);

  const setCrop = useCallback((crop: CropRect | null) => {
    setEditState(prev => {
      pushUndo(prev);
      return { ...prev, geometric: { ...prev.geometric, crop } };
    });
  }, [pushUndo]);

  const resetEdits = useCallback(() => {
    setEditState(prev => {
      pushUndo(prev);
      return { adjustments: { ...DEFAULT_EDIT_STATE.adjustments }, geometric: { ...DEFAULT_EDIT_STATE.geometric } };
    });
    setZoom(1);
    setShowOriginal(false);
    setStatusMessage('All edits reset');
  }, [pushUndo]);

  const undo = useCallback(() => {
    const entry = undoStack.current.pop();
    if (entry) {
      redoStack.current.push({ editState: editState });
      setEditState(entry.editState);
      setStatusMessage('Undo');
      updateUndoRedoState();
    }
  }, [editState, updateUndoRedoState]);

  const redo = useCallback(() => {
    const entry = redoStack.current.pop();
    if (entry) {
      undoStack.current.push({ editState: editState });
      setEditState(entry.editState);
      setStatusMessage('Redo');
      updateUndoRedoState();
    }
  }, [editState, updateUndoRedoState]);

  const toggleOriginal = useCallback(() => {
    setShowOriginal(prev => !prev);
  }, []);

  const getSnapshot = useCallback((): EditorStore => ({
    image,
    editState,
    status,
    error,
    zoom,
    showOriginal,
    statusMessage,
    canUndo,
    canRedo,
  }), [image, editState, status, error, zoom, showOriginal, statusMessage, canUndo, canRedo]);

  const store: EditorStore = { image, editState, status, error, zoom, showOriginal, statusMessage, canUndo, canRedo };
  const actions: EditorActions = {
    setImage, setStatus, setError, setZoom, toggleOriginal,
    updateAdjustment, setRotation, toggleFlipH, toggleFlipV, setCrop,
    resetEdits, undo, redo, setStatusMessage, getSnapshot,
  };

  return { store, actions };
}
