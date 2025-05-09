import { BaseService } from "./baseService";
import { ApiCallbacks } from "./httpBase";

/**
 * Interface for file upload response
 */
export interface FileUploadResponse {
  object_name: string;
  folder: string;
  url?: string;
  content_type?: string;
  size_bytes?: number;
}

/**
 * Interface for a task item
 */
export interface Task {
  id?: string;
  _id?: string; // MongoDB ID format from backend
  type: string;
  question?: string;
  options?: string[];
  answer?: string;
  word?: string;
  audio_hint_url?: string;
  image_url?: string;
  status?: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Interface for a task set
 */
export interface TaskSet {
  id: string;
  tasks?: Task[];
  task_ids?: string[];
  created_at: string;
  user_id?: string;
  input_type?: string;
  input_content?: string;
  status?: string;
  total_score?: number;
  input_metadata?: {
    object_name: string;
    folder: string;
    bucket?: string;
    content_type?: string;
    size_bytes?: number;
  };
  [key: string]: any; // Allow for additional properties
}

/**
 * Interface for task answer submission
 */
export interface TaskAnswer {
  task_id: string;
  user_answer: string | number | boolean;
  is_correct?: boolean;
  status?: string;
  feedback?: string;
}

/**
 * Interface for task submission result
 */
export interface TaskSubmissionResult {
  success: boolean;
  results: {
    task_id: string;
    is_correct: boolean;
    score: number;
    correct_answer?: string;
    feedback?: string;
  }[];
  total_score: number;
  user_score?: {
    total_score: number;
    total_attempts: number;
    correct_answers: number;
    accuracy: number;
  };
}

/**
 * Interface for task set request options
 */
export interface TaskSetRequestOptions {
  include_tasks?: boolean;
  // fields has a default value in the backend, so we don't need to send it
  // fields?: string[];
}

/**
 * Interface for task request options
 */
export interface TaskRequestOptions {
  fields?: string[];
}

/**
 * Interface for pagination metadata
 */
export interface PaginationMeta {
  limit: number;
  skip: number;
  total: number;
  has_more: boolean;
  count: number;
}

/**
 * Interface for paginated task sets response
 */
export interface PaginatedTaskSets {
  data: TaskSet[];
  meta: PaginationMeta;
}

/**
 * Interface for test scores response
 */
export interface TestScoresResponse {
  task_set_id: string;
  scores: {
    task_id: string;
    score: number;
    max_score: number;
    is_correct: boolean;
  }[];
  total_score: number;
  max_score: number;
}

/**
 * Task service for handling task operations
 */
class TaskService extends BaseService {
  /**
   * Fetch a task set by ID with options for field filtering
   * @param taskSetId The ID of the task set to fetch
   * @param options Optional request options for filtering fields
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with the task set data
   */
  async fetchTaskSet(
    taskSetId: string,
    options?: TaskSetRequestOptions,
    callbacks?: ApiCallbacks<TaskSet>
  ): Promise<TaskSet> {
    return this.post<TaskSet>(
      '/tasks/task-set',
      {
        set_id: taskSetId,
        include_tasks: options?.include_tasks || false,
        include_task_ids: true  // Always include task IDs for better loading
      },
      undefined,
      callbacks
    );
  }

  /**
   * Fetch a single task by ID with options for field filtering
   * @param taskId The ID of the task to fetch
   * @param options Optional request options for filtering fields
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with the task data
   */
  async fetchTask(
    taskId: string,
    options?: TaskRequestOptions,
    callbacks?: ApiCallbacks<Task>
  ): Promise<Task> {
    return this.post<Task>(
      '/tasks/task',
      {
        task_id: taskId,
        fields: options?.fields
      },
      undefined,
      callbacks
    );
  }

  /**
   * Submit answers for a task set
   * @param taskSetId The ID of the task set
   * @param answers Array of task answers
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with the submission result
   */
  async submitTaskAnswers(
    taskSetId: string,
    answers: TaskAnswer[],
    callbacks?: ApiCallbacks<TaskSubmissionResult>
  ): Promise<TaskSubmissionResult> {
    return this.put<TaskSubmissionResult>(
      '/tasks/task-set/submit',
      {
        set_id: taskSetId,
        answers: answers
      },
      undefined,
      callbacks
    );
  }

  /**
   * Submit an answer for a single task
   * @param taskId The ID of the task
   * @param answer The user's answer
   * @param taskType Optional task type
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with the submission result for the single task
   */
  async submitTaskAnswer(
    taskId: string,
    answer: string | number | boolean,
    taskType?: string,
    callbacks?: ApiCallbacks<any>
  ): Promise<any> {
    return this.post<any>(
      '/tasks/task/submit',
      {
        task_id: taskId,
        answer: answer,
        task_type: taskType
      },
      undefined,
      callbacks
    );
  }

  /**
   * Fetch user's task sets with pagination
   * @param limit Maximum number of records to return (default: 10)
   * @param skip Number of records to skip (default: 0)
   * @param fields Optional fields to retrieve
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with paginated list of task sets
   */
  async fetchUserTaskSets(
    limit: number = 10,
    skip: number = 0,
    fields?: string[],
    callbacks?: ApiCallbacks<PaginatedTaskSets>
  ): Promise<PaginatedTaskSets> {
    // Build query parameters
    const params = new URLSearchParams({
      limit: limit.toString(),
      skip: skip.toString()
    });

    // Add fields if provided
    if (fields && fields.length > 0) {
      fields.forEach(field => params.append('fields', field));
    }

    return this.get<PaginatedTaskSets>(
      `/tasks/user/task-sets?${params.toString()}`,
      undefined,
      callbacks
    );
  }

  /**
   * Fetch test scores for a task set
   * @param taskSetId The ID of the task set
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with the test scores data
   */
  async fetchTestScores(
    taskSetId: string,
    callbacks?: ApiCallbacks<TestScoresResponse>
  ): Promise<TestScoresResponse> {
    return this.get<TestScoresResponse>(
      `/tasks/test_score?task_set_id=${taskSetId}`,
      undefined,
      callbacks
    );
  }
}

// Export a singleton instance
export const taskService = new TaskService();

// Export functions for backward compatibility
export const fetchTaskSet = (taskSetId: string, _user: any, options?: TaskSetRequestOptions) =>
  taskService.fetchTaskSet(taskSetId, options);

export const fetchTask = (taskId: string, _user: any, options?: TaskRequestOptions) =>
  taskService.fetchTask(taskId, options);

export const submitTaskAnswers = (taskSetId: string, answers: TaskAnswer[], _user: any) =>
  taskService.submitTaskAnswers(taskSetId, answers);

export const submitTaskAnswer = (taskId: string, answer: string | number | boolean, _user: any, taskType?: string) =>
  taskService.submitTaskAnswer(taskId, answer, taskType);

export const fetchUserTaskSets = (_user: any, limit: number = 10, skip: number = 0, fields?: string[]) =>
  taskService.fetchUserTaskSets(limit, skip, fields);

export const fetchTestScores = (taskSetId: string, _user: any) =>
  taskService.fetchTestScores(taskSetId);

// fetch all taks of a user