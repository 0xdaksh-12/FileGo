import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../useAuthStore';
import api from '../../lib/api';

vi.mock('../../lib/api');

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuth: false,
      loading: false,
      initialized: false,
    });
    vi.clearAllMocks();
  });

  it('should sign in successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test' };
    const mockToken = 'mock-token';

    (api.post as any).mockResolvedValueOnce({
      data: { user: mockUser, token: mockToken },
    });

    const result = await useAuthStore.getState().signin({
      email: 'test@example.com',
      password: 'password',
    });

    expect(result.success).toBe(true);
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().token).toBe(mockToken);
    expect(useAuthStore.getState().isAuth).toBe(true);
  });

  it('should logout successfully', async () => {
    useAuthStore.setState({
      user: { id: '1', email: 'a@b.com' } as any,
      token: 'token',
      isAuth: true,
    });

    (api.post as any).mockResolvedValueOnce({});

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuth).toBe(false);
  });

  describe('bootstrap', () => {
    it('should hydrate store if refresh succeeds', async () => {
      const mockUser = { name: 'Test User', email: 'test@example.com' };
      const mockToken = 'new-access-token';

      (api.post as any).mockResolvedValueOnce({
        data: { user: mockUser, token: mockToken }
      });

      await useAuthStore.getState().bootstrap();

      expect(useAuthStore.getState().isAuth).toBe(true);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().token).toBe(mockToken);
      expect(useAuthStore.getState().initialized).toBe(true);
    });

    it('should set initialized to true even if refresh fails', async () => {
      (api.post as any).mockRejectedValueOnce(new Error('Unauthorized'));

      await useAuthStore.getState().bootstrap();

      expect(useAuthStore.getState().isAuth).toBe(false);
      expect(useAuthStore.getState().initialized).toBe(true);
    });
  });
});

