// import http from '../http';
import axios from 'axios';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

describe('http service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should create axios instance with correct config', () => {
    expect(axios.create).toHaveBeenCalledWith({
      headers: {
        'Content-Type': 'application/json'
      }
    });
  });

  it('should add request interceptor', () => {
    const mockAxiosInstance = (axios.create as jest.Mock)();
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
  });

  it('should add response interceptor', () => {
    const mockAxiosInstance = (axios.create as jest.Mock)();
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
  });

  describe('request interceptor', () => {
    it('should add auth token to headers if token exists', () => {
      const token = 'test-token';
      localStorage.setItem('token', token);

      const mockAxiosInstance = (axios.create as jest.Mock)();
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];

      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('should not add auth token if token does not exist', () => {
      const mockAxiosInstance = (axios.create as jest.Mock)();
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];

      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor', () => {
    it('should handle 401 error by removing token and redirecting to login', () => {
      const mockAxiosInstance = (axios.create as jest.Mock)();
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      localStorage.setItem('token', 'test-token');
      const error = { response: { status: 401 } };

      responseInterceptor(error);

      expect(localStorage.getItem('token')).toBeNull();
      expect(window.location.href).toBe('/login');
    });

    it('should not handle non-401 errors', () => {
      const mockAxiosInstance = (axios.create as jest.Mock)();
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      localStorage.setItem('token', 'test-token');
      const error = { response: { status: 404 } };

      responseInterceptor(error);

      expect(localStorage.getItem('token')).toBe('test-token');
    });
  });
});
