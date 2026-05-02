import { describe, it, expect, beforeEach } from 'vitest';
import { useFileStore } from '../useFileStore';

describe('useFileStore', () => {
  beforeEach(() => {
    // Reset state before each test
    const { setUploading, setDragging } = useFileStore.getState();
    setUploading(false);
    setDragging(false);
  });

  it('should have initial state', () => {
    const state = useFileStore.getState();
    expect(state.uploading).toBe(false);
    expect(state.isDragging).toBe(false);
  });

  it('should update uploading state', () => {
    const { setUploading } = useFileStore.getState();
    setUploading(true);
    expect(useFileStore.getState().uploading).toBe(true);
  });

  it('should update dragging state', () => {
    const { setDragging } = useFileStore.getState();
    setDragging(true);
    expect(useFileStore.getState().isDragging).toBe(true);
  });
});
