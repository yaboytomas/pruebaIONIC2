import { Preferences } from '@capacitor/preferences';
import { User } from '../types/User';

export class AuthService {
  private static readonly USER_KEY = 'current_user';
  private static readonly TOKEN_KEY = 'auth_token';

  // Simple user storage for demo purposes
  private static users: Array<User & { password: string }> = [
    {
      id: 'user1',
      username: 'demo',
      email: 'demo@example.com',
      password: 'demo123',
      createdAt: new Date(),
    },
    {
      id: 'user2',
      username: 'test',
      email: 'test@example.com', 
      password: 'test123',
      createdAt: new Date(),
    }
  ];

  // Login user with username/email and password
  static async login(usernameOrEmail: string, password: string): Promise<User> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const user = this.users.find(u => 
        (u.username === usernameOrEmail || u.email === usernameOrEmail) && 
        u.password === password
      );

      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      const authUser: User = {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      };

      // Save user session
      await this.saveUserSession(authUser);
      
      // Generate simple token
      const token = this.generateToken(authUser.id);
      await Preferences.set({
        key: this.TOKEN_KEY,
        value: token,
      });

      return authUser;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  // Register new user
  static async register(username: string, email: string, password: string): Promise<User> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Validate input first
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (!email.includes('@')) {
        throw new Error('Formato de email inválido');
      }

      // Check if user already exists
      const existingUser = this.users.find(u => 
        u.username === username || u.email === email
      );

      if (existingUser) {
        throw new Error('El usuario ya existe');
      }

      // Create new user
      const newUser = {
        id: `user${Date.now()}`,
        username,
        email,
        password,
        createdAt: new Date(),
      };

      this.users.push(newUser);

      const authUser: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
      };

      // Save user session
      await this.saveUserSession(authUser);
      
      // Generate simple token
      const token = this.generateToken(authUser.id);
      await Preferences.set({
        key: this.TOKEN_KEY,
        value: token,
      });

      return authUser;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await Preferences.remove({ key: this.USER_KEY });
      await Preferences.remove({ key: this.TOKEN_KEY });
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  // Get current user from storage
  static async getCurrentUser(): Promise<User | null> {
    try {
      const result = await Preferences.get({ key: this.USER_KEY });
      
      if (result.value) {
        const user = JSON.parse(result.value);
        return {
          ...user,
          createdAt: new Date(user.createdAt),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Check if user has valid token
  static async isAuthenticated(): Promise<boolean> {
    try {
      const tokenResult = await Preferences.get({ key: this.TOKEN_KEY });
      const userResult = await Preferences.get({ key: this.USER_KEY });
      
      return !!(tokenResult.value && userResult.value);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Save user session to storage
  private static async saveUserSession(user: User): Promise<void> {
    await Preferences.set({
      key: this.USER_KEY,
      value: JSON.stringify(user),
    });
  }

  // Generate simple token for demo
  private static generateToken(userId: string): string {
    return `token_${userId}_${Date.now()}`;
  }

  // Get auth token
  static async getToken(): Promise<string | null> {
    try {
      const result = await Preferences.get({ key: this.TOKEN_KEY });
      return result.value || null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }
}
