import { httpClient, ApiCallbacks } from '../httpBase';
import axios from 'axios';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
}));

describe('httpClient', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      clear: () => {
        store = {};
      },
    };
  })();
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  // Test GET method
  test('get method should call axios.get with correct parameters', async () => {
    // Mock axios.get to return a successful response
    const mockResponse = { data: { success: true } };
    (axios.create().get as jest.Mock).mockResolvedValueOnce(mockResponse);

    // Create mock callbacks
    const callbacks: ApiCallbacks = {
      onSuccess: jest.fn(),
      onError: jest.fn(),
      onFinally: jest.fn(),
    };

    // Call the get method
    await httpClient.get('/test', { params: { id: 1 } }, callbacks);

    // Check if axios.get was called with the correct parameters
    expect(axios.create().get).toHaveBeenCalledWith('/test', { params: { id: 1 } });

    // Check if callbacks were called
    expect(callbacks.onSuccess).toHaveBeenCalledWith(mockResponse.data);
    expect(callbacks.onError).not.toHaveBeenCalled();
    expect(callbacks.onFinally).toHaveBeenCalled();
  });

  // Test POST method
  test('post method should call axios.post with correct parameters', async () => {
    // Mock axios.post to return a successful response
    const mockResponse = { data: { success: true } };
    (axios.create().post as jest.Mock).mockResolvedValueOnce(mockResponse);

    // Create mock callbacks
    const callbacks: ApiCallbacks = {
      onSuccess: jest.fn(),
      onError: jest.fn(),
      onFinally: jest.fn(),
    };

    // Call the post method
    await httpClient.post('/test', { name: 'test' }, { headers: { 'Content-Type': 'application/json' } }, callbacks);

    // Check if axios.post was called with the correct parameters
    expect(axios.create().post).toHaveBeenCalledWith('/test', { name: 'test' }, { headers: { 'Content-Type': 'application/json' } });

    // Check if callbacks were called
    expect(callbacks.onSuccess).toHaveBeenCalledWith(mockResponse.data);
    expect(callbacks.onError).not.toHaveBeenCalled();
    expect(callbacks.onFinally).toHaveBeenCalled();
  });

  // Test error handling
  test('should handle errors correctly', async () => {
    // Mock axios.get to throw an error
    const mockError = {
      isAxiosError: true,
      response: {
        status: 404,
        data: {
          detail: 'Not found',
        },
      },
      message: 'Request failed with status code 404',
    };
    (axios.create().get as jest.Mock).mockRejectedValueOnce(mockError);

    // Create mock callbacks
    const callbacks: ApiCallbacks = {
      onSuccess: jest.fn(),
      onError: jest.fn(),
      onFinally: jest.fn(),
    };

    // Call the get method and expect it to throw
    await expect(httpClient.get('/test', undefined, callbacks)).rejects.toEqual({
      message: 'Not found',
      status: 404,
      data: {
        detail: 'Not found',
      },
    });

    // Check if callbacks were called
    expect(callbacks.onSuccess).not.toHaveBeenCalled();
    expect(callbacks.onError).toHaveBeenCalledWith({
      message: 'Not found',
      status: 404,
      data: {
        detail: 'Not found',
      },
    });
    expect(callbacks.onFinally).toHaveBeenCalled();
  });
});
