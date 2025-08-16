import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageService } from '../services/StorageService';
import { Todo } from '../types/Todo';

// Mock Capacitor Preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    set: vi.fn(),
    get: vi.fn(),
    clear: vi.fn(),
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('StorageService', () => {
  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'Test Todo 1',
      description: 'Test Description 1',
      completed: false,
      createdAt: new Date('2025-01-01'),
    },
    {
      id: '2',
      title: 'Test Todo 2', 
      description: 'Test Description 2',
      completed: true,
      createdAt: new Date('2025-01-02'),
      image: 'base64-image-data',
      location: {
        latitude: -33.4489,
        longitude: -70.6693,
        address: 'Santiago, Chile',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveTodos', () => {
    it('should save todos successfully', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.set).mockResolvedValue();

      await StorageService.saveTodos(mockTodos);

      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'todos',
        value: JSON.stringify(mockTodos),
      });
    });

    it('should handle save errors', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.set).mockRejectedValue(new Error('Storage error'));

      await expect(StorageService.saveTodos(mockTodos)).rejects.toThrow('Storage error');
    });
  });

  describe('loadTodos', () => {
    it('should load todos successfully', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.get).mockResolvedValue({
        value: JSON.stringify(mockTodos),
      });

      const result = await StorageService.loadTodos();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Test Todo 1');
      expect(result[1].location?.address).toBe('Santiago, Chile');
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it('should return empty array when no data', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.get).mockResolvedValue({ value: null });

      const result = await StorageService.loadTodos();

      expect(result).toEqual([]);
    });

    it('should fallback to localStorage on error', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.get).mockRejectedValue(new Error('Preferences error'));
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTodos));

      const result = await StorageService.loadTodos();

      expect(result).toHaveLength(2);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('todos');
    });

    it('should handle corrupted data gracefully', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.get).mockResolvedValue({
        value: 'invalid-json',
      });
      localStorageMock.getItem.mockReturnValue(null);

      const result = await StorageService.loadTodos();

      expect(result).toEqual([]);
    });
  });

  describe('sync status', () => {
    it('should save sync status', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      const testDate = new Date('2025-01-15T10:30:00Z');
      vi.mocked(Preferences.set).mockResolvedValue();

      await StorageService.saveSyncStatus(testDate);

      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'sync_status',
        value: testDate.toISOString(),
      });
    });

    it('should get last sync time', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      const testDate = new Date('2025-01-15T10:30:00Z');
      vi.mocked(Preferences.get).mockResolvedValue({
        value: testDate.toISOString(),
      });

      const result = await StorageService.getLastSyncTime();

      expect(result).toEqual(testDate);
    });

    it('should return null when no sync time', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.get).mockResolvedValue({ value: null });

      const result = await StorageService.getLastSyncTime();

      expect(result).toBeNull();
    });
  });

  describe('clearAllData', () => {
    it('should clear all data', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      vi.mocked(Preferences.clear).mockResolvedValue();

      await StorageService.clearAllData();

      expect(Preferences.clear).toHaveBeenCalled();
      expect(localStorageMock.clear).toHaveBeenCalled();
    });
  });

  describe('migration', () => {
    it('should migrate from localStorage', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTodos));
      vi.mocked(Preferences.set).mockResolvedValue();

      await StorageService.migrateFromLocalStorage();

      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'todos',
        value: JSON.stringify(mockTodos),
      });
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('todos');
    });

    it('should not migrate when no localStorage data', async () => {
      const { Preferences } = await import('@capacitor/preferences');
      localStorageMock.getItem.mockReturnValue(null);

      await StorageService.migrateFromLocalStorage();

      expect(Preferences.set).not.toHaveBeenCalled();
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });
  });
});