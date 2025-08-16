import { Todo } from '../types/Todo';

export class TodoService {
  private static readonly API_BASE_URL = 'https://jsonplaceholder.typicode.com';
  
  // Sync todos to external API (simulated)
  static async syncTodos(todos: Todo[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Todo Sync',
          body: JSON.stringify(todos),
          userId: 1
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error syncing todos:', error);
      throw error;
    }
  }

  // Import todos from external API
  static async importTodosFromAPI(): Promise<Todo[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/posts?_limit=5`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const posts = await response.json();
      
      // Transform API data to Todo format
      return posts.map((post: { id: number; title: string; body: string }): Todo => ({
        id: `api-${post.id}`,
        title: post.title,
        description: post.body.substring(0, 100) + '...',
        completed: false,
        createdAt: new Date(),
      }));
    } catch (error) {
      console.error('Error importing todos:', error);
      throw error;
    }
  }

  // Validate API connectivity
  static async testAPIConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/posts/1`);
      return response.ok;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}
