import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../services/AuthService';

// Mock Capacitor Preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    set: vi.fn(),
    get: vi.fn(),
    remove: vi.fn(),
  }
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.set).mockResolvedValue();

      const user = await AuthService.login('demo', 'demo123');

      expect(user).toEqual({
        id: 'user1',
        username: 'demo',
        email: 'demo@example.com',
        createdAt: expect.any(Date),
      });
      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'current_user',
        value: JSON.stringify(user),
      });
    });

    it('should fail with invalid credentials', async () => {
      await expect(AuthService.login('invalid', 'invalid')).rejects.toThrow('Credenciales inválidas');
    });

    it('should login with email instead of username', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.set).mockResolvedValue();

      const user = await AuthService.login('demo@example.com', 'demo123');

      expect(user.username).toBe('demo');
      expect(user.email).toBe('demo@example.com');
    });
  });

  describe('register', () => {
    it('should register successfully with valid data', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.set).mockResolvedValue();

      const user = await AuthService.register('newuser', 'new@example.com', 'password123');

      expect(user.username).toBe('newuser');
      expect(user.email).toBe('new@example.com');
      expect(user.id).toMatch(/^user\d+$/);
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should fail with existing username', async () => {
      await expect(AuthService.register('demo', 'another@example.com', 'password123'))
        .rejects.toThrow('El usuario ya existe');
    });

    it('should fail with existing email', async () => {
      await expect(AuthService.register('newuser', 'demo@example.com', 'password123'))
        .rejects.toThrow('El usuario ya existe');
    });

    it('should fail with short password', async () => {
      await expect(AuthService.register('newuser', 'new@example.com', '123'))
        .rejects.toThrow('La contraseña debe tener al menos 6 caracteres');
    });

    it('should fail with invalid email format', async () => {
      await expect(AuthService.register('newuser', 'invalidemail', 'password123'))
        .rejects.toThrow('Formato de email inválido');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.remove).mockResolvedValue();

      await AuthService.logout();

      expect(Preferences.remove).toHaveBeenCalledWith({ key: 'current_user' });
      expect(Preferences.remove).toHaveBeenCalledWith({ key: 'auth_token' });
    });
  });

  describe('getCurrentUser', () => {
    it('should return user when stored', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      const mockUser = {
        id: 'user1',
        username: 'demo',
        email: 'demo@example.com',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      vi.mocked(Preferences.get).mockResolvedValue({
        value: JSON.stringify(mockUser),
      });

      const user = await AuthService.getCurrentUser();

      expect(user).toEqual({
        ...mockUser,
        createdAt: new Date(mockUser.createdAt),
      });
    });

    it('should return null when no user stored', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.get).mockResolvedValue({ value: null });

      const user = await AuthService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user and token exist', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.get)
        .mockResolvedValueOnce({ value: 'token123' })
        .mockResolvedValueOnce({ value: '{"id":"user1"}' });

      const isAuth = await AuthService.isAuthenticated();

      expect(isAuth).toBe(true);
    });

    it('should return false when no token', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.get)
        .mockResolvedValueOnce({ value: null })
        .mockResolvedValueOnce({ value: '{"id":"user1"}' });

      const isAuth = await AuthService.isAuthenticated();

      expect(isAuth).toBe(false);
    });

    it('should return false when no user', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.get)
        .mockResolvedValueOnce({ value: 'token123' })
        .mockResolvedValueOnce({ value: null });

      const isAuth = await AuthService.isAuthenticated();

      expect(isAuth).toBe(false);
    });
  });

  describe('token management', () => {
    it('should return token when exists', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.get).mockResolvedValue({ value: 'token123' });

      const token = await AuthService.getToken();

      expect(token).toBe('token123');
    });

    it('should return null when no token', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.get).mockResolvedValue({ value: null });

      const token = await AuthService.getToken();

      expect(token).toBeNull();
    });
  });
});
