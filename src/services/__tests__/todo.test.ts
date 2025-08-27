import axios from 'axios';
import { todoService, ApiException } from '../todo';
import { Todo, CreateTodoInput, UpdateTodoInput } from '../todo';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Todo Service', () => {
  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    due_date: '2024-03-20T00:00:00Z',
    created_at: '2024-03-19T00:00:00Z',
    updated_at: '2024-03-19T00:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all todos successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { data: [mockTodo] } });
      const result = await todoService.getAll();
      expect(result).toEqual([mockTodo]);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3001/todos');
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      });
      await expect(todoService.getAll()).rejects.toThrow(ApiException);
    });
  });

  describe('get', () => {
    it('should fetch a single todo successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { data: mockTodo } });
      const result = await todoService.get('1');
      expect(result).toEqual(mockTodo);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3001/todos/1');
    });

    it('should handle not found errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { error: 'Todo not found' }
        }
      });
      await expect(todoService.get('999')).rejects.toThrow(ApiException);
    });
  });

  describe('create', () => {
    const createInput: CreateTodoInput = {
      title: 'New Todo',
      description: 'New Description',
      completed: false,
      due_date: '2024-03-20T00:00:00Z'
    };

    it('should create a todo successfully', async () => {
      const response = {
        message: 'Todo creation has been queued',
        todo_id: '123'
      };
      mockedAxios.post.mockResolvedValueOnce({ data: { data: response } });
      const result = await todoService.create(createInput);
      expect(result).toEqual(response);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3001/todos',
        createInput
      );
    });

    it('should handle validation errors', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { error: 'Title is required' }
        }
      });
      await expect(todoService.create({} as CreateTodoInput)).rejects.toThrow(ApiException);
    });
  });

  describe('update', () => {
    const updateInput: UpdateTodoInput = {
      title: 'Updated Todo',
      completed: true
    };

    it('should update a todo successfully', async () => {
      const response = {
        message: 'Todo update has been queued',
        todo_id: '1'
      };
      mockedAxios.put.mockResolvedValueOnce({ data: { data: response } });
      const result = await todoService.update('1', updateInput);
      expect(result).toEqual(response);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        'http://localhost:3001/todos/1',
        updateInput
      );
    });

    it('should handle update errors', async () => {
      mockedAxios.put.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { error: 'Update failed' }
        }
      });
      await expect(todoService.update('1', updateInput)).rejects.toThrow(ApiException);
    });
  });

  describe('delete', () => {
    it('should delete a todo successfully', async () => {
      const response = {
        message: 'Todo deletion has been queued',
        todo_id: '1'
      };
      mockedAxios.delete.mockResolvedValueOnce({ data: { data: response } });
      const result = await todoService.delete('1');
      expect(result).toEqual(response);
      expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:3001/todos/1');
    });

    it('should handle deletion errors', async () => {
      mockedAxios.delete.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { error: 'Deletion failed' }
        }
      });
      await expect(todoService.delete('1')).rejects.toThrow(ApiException);
    });
  });

  describe('ApiException', () => {
    it('should create an ApiException with correct properties', () => {
      const error = new ApiException(404, 'Not Found', 'Todo not found');
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not Found');
      expect(error.details).toBe('Todo not found');
      expect(error.name).toBe('ApiException');
    });
  });
});
