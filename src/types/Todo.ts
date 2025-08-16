export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  image?: string; // Base64 image data
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
} 