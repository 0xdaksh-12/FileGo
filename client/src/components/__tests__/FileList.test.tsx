import { render, screen } from '@testing-library/react';
import FileList from '../file-list';
import { useFiles } from '@/hooks/use-queries';
import { useDeleteFile } from '@/hooks/use-mutations';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/hooks/use-queries');
vi.mock('@/hooks/use-mutations');

describe('FileList', () => {
  it('should render empty state when no files', () => {
    (useFiles as any).mockReturnValue({
      data: { pages: [{ files: [], nextCursor: null }] },
      isLoading: false,
    });
    (useDeleteFile as any).mockReturnValue({ mutate: vi.fn(), isPending: false });

    render(<FileList />);
    expect(screen.getByText(/No files uploaded yet/i)).toBeInTheDocument();
  });

  it('should render file list', () => {
    const mockFiles = [
      { id: '1', name: 'my-file.pdf', size: 1024, mimeType: 'application/pdf', downloadCount: 5, uploadedAt: new Date().toISOString(), hasPassword: false, isActive: true }
    ];
    (useFiles as any).mockReturnValue({
      data: { pages: [{ files: mockFiles, nextCursor: null }] },
      isLoading: false,
      hasNextPage: false,
    });
    (useDeleteFile as any).mockReturnValue({ mutate: vi.fn(), isPending: false });

    render(<FileList />);
    expect(screen.getByText('my-file.pdf')).toBeInTheDocument();
    expect(screen.getByText('1 KB')).toBeInTheDocument();
  });
});
