import { create } from 'zustand';

interface FileState {
  uploading: boolean;
  isDragging: boolean;
}

interface FileActions {
  setUploading: (uploading: boolean) => void;
  setDragging: (isDragging: boolean) => void;
}

export const useFileStore = create<FileState & FileActions>((set) => ({
  uploading: false,
  isDragging: false,

  setUploading: (uploading) => set({ uploading }),
  setDragging: (isDragging) => set({ isDragging }),
}));
