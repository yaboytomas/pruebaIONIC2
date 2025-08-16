import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoService } from '../services/TodoService';
import { Todo } from '../types/Todo';

// Mock fetch
global.fetch = vi.fn();

describe('TodoService', () => {
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
    },
  ];

  const mockAPIResponse = [
    {
      id: 1,
      title: 'API Todo 1',
      body: 'This is a long description from the API that should be truncated when imported...',
      userId: 1,
    },
    {
      id: 2,
      title: 'API Todo 2',
      body: 'Another API description',
      userId: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('syncTodos', () => {
    it('should sync todos successfully', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 1 }),
      } as Response);

      const result = await TodoService.syncTodos(mockTodos);

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/posts',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Todo Sync',
            body: JSON.stringify(mockTodos),
            userId: 1,
          }),
        })
      );
    });

    it('should handle sync failure', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      await expect(TodoService.syncTodos(mockTodos)).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle network error', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      await expect(TodoService.syncTodos(mockTodos)).rejects.toThrow('Network error');
    });
  });

  describe('importTodosFromAPI', () => {
    it('should import todos successfully', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAPIResponse),
      } as Response);

      const result = await TodoService.importTodosFromAPI();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'api-1',
        title: 'API Todo 1',
        description: expect.stringContaining('This is a long description from the API that should be truncated when imported'),
        completed: false,
        createdAt: expect.any(Date),
      });
      expect(result[1]).toEqual({
        id: 'api-2',
        title: 'API Todo 2',
        description: expect.stringContaining('Another API description'),
        completed: false,
        createdAt: expect.any(Date),
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/posts?_limit=5'
      );
    });

    it('should handle import failure', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      await expect(TodoService.importTodosFromAPI()).rejects.toThrow('HTTP error! status: 404');
    });

    it('should handle empty API response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

      const result = await TodoService.importTodosFromAPI();

      expect(result).toEqual([]);
    });

    it('should truncate long descriptions', async () => {
      const longBodyResponse = [{
        id: 1,
        title: 'Test',
        body: 'A'.repeat(150) + ' this should be truncated',
        userId: 1,
      }];

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(longBodyResponse),
      } as Response);

      const result = await TodoService.importTodosFromAPI();

      expect(result[0].description).toHaveLength(103); // 100 + '...'
      expect(result[0].description.endsWith('...')).toBe(true);
    });
  });

  describe('testAPIConnection', () => {
    it('should return true for successful connection', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
      } as Response);

      const result = await TodoService.testAPIConnection();

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/posts/1'
      );
    });

    it('should return false for failed connection', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const result = await TodoService.testAPIConnection();

      expect(result).toBe(false);
    });

    it('should return false for network error', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const result = await TodoService.testAPIConnection();

      expect(result).toBe(false);
    });
  });

  describe('API endpoint validation', () => {
    it('should use correct base URL', () => {
      expect(TodoService['API_BASE_URL']).toBe('https://jsonplaceholder.typicode.com');
    });
  });
});