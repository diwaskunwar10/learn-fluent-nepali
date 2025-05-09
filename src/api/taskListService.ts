import { BaseService } from "./baseService";
import { ApiCallbacks, RequestOptions, httpClient } from "./httpBase";
import { cacheManager } from "./cacheManager";

/**
 * Interface for task set filter parameters
 */
export interface TaskSetFilter {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: number;
  status?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Interface for a task set
 */
export interface TaskSet {
  _id: string;
  user_id: string;
  input_type: string;
  input_content: string;
  tasks: string[];
  status: string;
  created_at: string;
  completed_at?: string | null;
  max_score?: number;
  scored?: number;
  remark?: string | null;
  input_metadata?: {
    object_name: string;
    folder: string;
    bucket: string;
    content_type: string;
    size_bytes: number;
  };
}

/**
 * Interface for task set response
 */
export interface TaskSetResponse {
  items: TaskSet[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Interface for the actual API response format
 */
export interface ApiTaskSetResponse {
  data: TaskSet[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages?: number;
    has_more?: boolean;
    count?: number;
  };
}

/**
 * Task list service for handling task set operations
 */
class TaskListService extends BaseService {
  /**
   * Fetch task sets with filtering and pagination
   * @param filter The filter parameters
   * @param callbacks Optional callbacks for success, error, and finally
   * @param options Optional request options for caching and cancellation
   * @returns Promise with the task set response
   */
  async fetchTaskSets(
    filter: TaskSetFilter,
    callbacks?: ApiCallbacks<ApiTaskSetResponse>,
    options?: RequestOptions
  ): Promise<TaskSetResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Ensure sort_order is passed as a number (1 or -1)
          if (key === 'sort_order') {
            queryParams.append(key, value.toString());
            console.log(`Setting sort_order to ${value} (${typeof value})`);
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const url = `/tasks/task-sets/filtered?${queryParams.toString()}`;
      console.log('Fetching task sets from:', url, 'with filter:', filter);

      // Make API request with caching and cancellation options
      const apiResponse = await this.get<ApiTaskSetResponse>(url, options, callbacks);
      console.log('API response data:', apiResponse);

      // Ensure the response has the expected structure
      if (!apiResponse || !Array.isArray(apiResponse.data)) {
        console.error('Invalid API response format:', apiResponse);
        return {
          items: [],
          total: 0,
          page: filter.page,
          limit: filter.limit,
          pages: 0
        };
      }

      // Transform the API response to match the expected TaskSetResponse format
      const transformedResponse: TaskSetResponse = {
        items: apiResponse.data,
        total: apiResponse.meta.total,
        page: apiResponse.meta.page || filter.page,
        limit: apiResponse.meta.limit || filter.limit,
        pages: apiResponse.meta.total_pages || Math.ceil(apiResponse.meta.total / filter.limit)
      };

      return transformedResponse;
    } catch (error) {
      console.error('Error in fetchTaskSets:', error);
      throw error;
    }
  }
}

/**
 * Clear cache for a specific key
 * @param cacheKey The cache key to clear
 */
class TaskListServiceWithCache extends TaskListService {
  clearCache(cacheKey?: string): void {
    if (cacheKey) {
      cacheManager.delete(cacheKey);
    } else {
      // Clear all task list related cache entries
      const allKeys = cacheManager.keys();
      allKeys.forEach(key => {
        if (key.startsWith('taskList:')) {
          cacheManager.delete(key);
        }
      });
    }
  }
}

// Export a singleton instance
export const taskListService = new TaskListServiceWithCache();

/**
 * Hook for using the task list service
 * @returns The task list service methods
 */
export const useTaskListService = () => {
  return {
    fetchTaskSets: (
      filter: TaskSetFilter,
      callbacks?: ApiCallbacks<ApiTaskSetResponse>,
      options?: RequestOptions
    ) => taskListService.fetchTaskSets(filter, callbacks, options),
    clearCache: (cacheKey?: string) => taskListService.clearCache(cacheKey)
  };
};
