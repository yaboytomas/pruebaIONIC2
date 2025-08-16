import { Preferences } from '@capacitor/preferences';
import { Todo } from '../types/Todo';

export class StorageService {
  private static readonly TODOS_KEY = 'todos';
  private static readonly SYNC_STATUS_KEY = 'sync_status';

  // Save todos using Capacitor Preferences
  static async saveTodos(todos: Todo[]): Promise<void> {
    try {
      const todosData = JSON.stringify(todos);
      await Preferences.set({
        key: this.TODOS_KEY,
        value: todosData,
      });
    } catch (error) {
      console.error('Error saving todos:', error);
      throw error;
    }
  }

  // Load todos from Capacitor Preferences
  static async loadTodos(): Promise<Todo[]> {
    try {
      const result = await Preferences.get({ key: this.TODOS_KEY });
      
      if (result.value) {
        const todos = JSON.parse(result.value);
        // Ensure dates are properly parsed
        return todos.map((todo: Todo) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error loading todos:', error);
      // Fallback to localStorage if Preferences fails
      return this.loadTodosFromLocalStorage();
    }
  }

  // Fallback to localStorage
  private static loadTodosFromLocalStorage(): Todo[] {
    try {
      const savedTodos = localStorage.getItem(this.TODOS_KEY);
      if (savedTodos) {
        const parsedTodos = JSON.parse(savedTodos);
        return parsedTodos.map((todo: Todo) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  }

  // Save sync status
  static async saveSyncStatus(lastSync: Date): Promise<void> {
    try {
      await Preferences.set({
        key: this.SYNC_STATUS_KEY,
        value: lastSync.toISOString(),
      });
    } catch (error) {
      console.error('Error saving sync status:', error);
    }
  }

  // Get last sync time
  static async getLastSyncTime(): Promise<Date | null> {
    try {
      const result = await Preferences.get({ key: this.SYNC_STATUS_KEY });
      return result.value ? new Date(result.value) : null;
    } catch (error) {
      console.error('Error getting sync status:', error);
      return null;
    }
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    try {
      await Preferences.clear();
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  // Migration from localStorage to Preferences
  static async migrateFromLocalStorage(): Promise<void> {
    try {
      const localTodos = this.loadTodosFromLocalStorage();
      if (localTodos.length > 0) {
        await this.saveTodos(localTodos);
        localStorage.removeItem(this.TODOS_KEY);
        console.log('Migration from localStorage completed');
      }
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }
}
