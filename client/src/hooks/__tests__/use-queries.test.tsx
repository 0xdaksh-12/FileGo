import { renderHook, waitFor } from '@testing-library/react';
import { useFiles } from '../use-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import api from '../../lib/api';
import { vi, describe, it, expect } from 'vitest';
import React from 'react';

vi.mock('../../lib/api');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useFiles', () => {
  it('should fetch files successfully', async () => {
    const mockFiles = {
      files: [
        { id: '1', name: 'test.txt', size: 100, mimeType: 'text/plain', downloadCount: 0, uploadedAt: new Date().toISOString(), hasPassword: false, isActive: true }
      ],
      nextCursor: null
    };

    (api.get as any).mockResolvedValueOnce({ data: mockFiles });

    const { result } = renderHook(() => useFiles(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.pages[0].files).toEqual(mockFiles.files);
  });
});
