import axios, { AxiosError } from 'axios';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'creating' | 'updating' | 'deleting' | 'completing';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  status?: 'pending' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}

export interface ApiResponse<T> {
  message?: string;
  todo_id?: string;
  error?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

// Use the correct API URL based on the environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Log the API URL for debugging
console.log('API URL:', API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Custom error class for API errors
export class ApiException extends Error {
  constructor(public status: number, message: string, public details?: string) {
    super(message);
    this.name = 'ApiException';
  }
}

// Helper function to handle API errors
const handleApiError = (error: AxiosError<ApiError>): never => {
  console.error('API Error:', error);

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Error Response:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });

    throw new ApiException(
      error.response.status,
      error.response.data?.error || 'An error occurred',
      error.response.data?.details
    );
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No Response Received:', error.request);
    throw new ApiException(500, 'No response from server');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request Setup Error:', error.message);
    throw new ApiException(500, 'Network error occurred');
  }
};

export const todoService = {
  getAll: async (): Promise<Todo[]> => {
    try {
      console.log('Fetching all todos...');
      const response = await api.get<Todo[]>('/todos');
      console.log('Get all response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError<ApiError>);
    }
  },

  get: async (id: string): Promise<Todo> => {
    try {
      console.log('Fetching todo:', id);
      const response = await api.get<Todo>(`/todos/${id}`);
      console.log('Get response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError<ApiError>);
    }
  },

  create: async (todo: CreateTodoInput): Promise<{ message: string; todo_id: string }> => {
    try {
      console.log('Creating todo:', todo);
      const response = await api.post<{ message: string; todo_id: string }>('/todos', todo);
      console.log('Create response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError<ApiError>);
    }
  },

  update: async (id: string, todo: UpdateTodoInput): Promise<{ message: string; todo_id: string }> => {
    try {
      console.log('Updating todo:', id, todo);
      const response = await api.put<{ message: string; todo_id: string }>(`/todos/${id}`, todo);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError<ApiError>);
    }
  },

  delete: async (id: string): Promise<{ message: string; todo_id: string }> => {
    try {
      console.log('Deleting todo:', id);
      const response = await api.delete<{ message: string; todo_id: string }>(`/todos/${id}`);
      console.log('Delete response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError<ApiError>);
    }
  }
};

export default todoService;
