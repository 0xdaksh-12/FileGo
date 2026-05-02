import { renderHook, waitFor } from '@testing-library/react';
import { useDeleteFile } from '../use-mutations';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../../lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import toast from 'react-hot-toast';

vi.mock('../../lib/api');
vi.mock('react-hot-toast');

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useDeleteFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should call delete API and show success toast', async () => {
    const mockId = 'test-id';
    (api.delete as any).mockResolvedValue({ data: {} });
    
    const { result } = renderHook(() => useDeleteFile(), { wrapper });
    
    result.current.mutate(mockId);
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    expect(api.delete).toHaveBeenCalledWith(`/api/files/${mockId}`);
    expect(toast.success).toHaveBeenCalledWith('File deleted successfully');
  });

  it('should show error toast on failure', async () => {
    const mockId = 'fail-id';
    (api.delete as any).mockRejectedValue(new Error('API Error'));
    
    const { result } = renderHook(() => useDeleteFile(), { wrapper });
    
    result.current.mutate(mockId);
    
    await waitFor(() => expect(result.current.isError).toBe(true));
    
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Delete failed'));
  });
});
