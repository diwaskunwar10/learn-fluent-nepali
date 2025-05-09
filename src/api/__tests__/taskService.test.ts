import { taskService } from '../taskService';
import { httpClient } from '../httpBase';

// Mock httpClient
jest.mock('../httpBase', () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('taskService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test fetchTaskSet method
  test('fetchTaskSet should call httpClient.post with correct parameters', async () => {
    // Mock httpClient.post to return a successful response
    const mockResponse = { id: '123', tasks: [] };
    (httpClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    // Call the fetchTaskSet method
    const result = await taskService.fetchTaskSet('123', { include_tasks: true });

    // Check if httpClient.post was called with the correct parameters
    expect(httpClient.post).toHaveBeenCalledWith(
      '/tasks/task-set',
      {
        set_id: '123',
        include_tasks: true,
        include_task_ids: true,
      },
      undefined,
      undefined
    );

    // Check if the result is correct
    expect(result).toEqual(mockResponse);
  });

  // Test fetchTask method
  test('fetchTask should call httpClient.post with correct parameters', async () => {
    // Mock httpClient.post to return a successful response
    const mockResponse = { id: '123', type: 'single_choice' };
    (httpClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    // Call the fetchTask method
    const result = await taskService.fetchTask('123', { fields: ['id', 'type'] });

    // Check if httpClient.post was called with the correct parameters
    expect(httpClient.post).toHaveBeenCalledWith(
      '/tasks/task',
      {
        task_id: '123',
        fields: ['id', 'type'],
      },
      undefined,
      undefined
    );

    // Check if the result is correct
    expect(result).toEqual(mockResponse);
  });

  // Test submitTaskAnswers method
  test('submitTaskAnswers should call httpClient.put with correct parameters', async () => {
    // Mock httpClient.put to return a successful response
    const mockResponse = { success: true, results: [] };
    (httpClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

    // Call the submitTaskAnswers method
    const answers = [{ task_id: '123', user_answer: 'test' }];
    const result = await taskService.submitTaskAnswers('123', answers);

    // Check if httpClient.put was called with the correct parameters
    expect(httpClient.put).toHaveBeenCalledWith(
      '/tasks/task-set/submit',
      {
        set_id: '123',
        answers: answers,
      },
      undefined,
      undefined
    );

    // Check if the result is correct
    expect(result).toEqual(mockResponse);
  });

  // Test submitTaskAnswer method
  test('submitTaskAnswer should call httpClient.post with correct parameters', async () => {
    // Mock httpClient.post to return a successful response
    const mockResponse = { is_correct: true };
    (httpClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    // Call the submitTaskAnswer method
    const result = await taskService.submitTaskAnswer('123', 'test', 'single_choice');

    // Check if httpClient.post was called with the correct parameters
    expect(httpClient.post).toHaveBeenCalledWith(
      '/tasks/task/submit',
      {
        task_id: '123',
        answer: 'test',
        task_type: 'single_choice',
      },
      undefined,
      undefined
    );

    // Check if the result is correct
    expect(result).toEqual(mockResponse);
  });

  // Test fetchTestScores method
  test('fetchTestScores should call httpClient.get with correct parameters', async () => {
    // Mock httpClient.get to return a successful response
    const mockResponse = { task_set_id: '123', scores: [] };
    (httpClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

    // Call the fetchTestScores method
    const result = await taskService.fetchTestScores('123');

    // Check if httpClient.get was called with the correct parameters
    expect(httpClient.get).toHaveBeenCalledWith(
      '/tasks/test_score?task_set_id=123',
      undefined,
      undefined
    );

    // Check if the result is correct
    expect(result).toEqual(mockResponse);
  });
});
