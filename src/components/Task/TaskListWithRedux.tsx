import React, { useEffect, useState } from 'react';
import { useReduxApi } from '@/hooks/useReduxApi';
import { taskListService, TaskSetFilter, TaskSetResponse } from '@/api/taskListService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import TaskFilter from './TaskFilter';

/**
 * Task list component using Redux for API state management
 */
const TaskListWithRedux: React.FC = () => {
  // Default filter state
  const [filter, setFilter] = useState<TaskSetFilter>({
    page: 1,
    limit: 10,
    sort_by: 'created_at',
    sort_order: -1
  });

  // Redux API hooks
  const { createApiCallbacks, startLoading, isLoading, getError, getData } = useReduxApi();
  
  // API key for this component
  const API_KEY = 'taskList';
  
  // Get data from Redux store
  const taskListData = getData<TaskSetResponse>(API_KEY);
  const loading = isLoading(API_KEY);
  const error = getError(API_KEY);

  // Fetch task sets on mount and when filter changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Start loading
        startLoading(API_KEY);
        
        // Create callbacks for Redux integration
        const callbacks = createApiCallbacks<TaskSetResponse>(API_KEY);
        
        // Fetch task sets
        await taskListService.fetchTaskSets(filter, callbacks);
      } catch (err) {
        console.error('Error fetching task sets:', err);
      }
    };

    fetchData();
  }, [filter]);

  // Handle filter changes
  const handleFilterChange = (newFilter: TaskSetFilter) => {
    setFilter(newFilter);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilter(prev => ({ ...prev, page }));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Task List</h1>
      
      {/* Filter component */}
      <TaskFilter filter={filter} onFilterChange={handleFilterChange} />
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          <p>Error: {error}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => {
              startLoading(API_KEY);
              const callbacks = createApiCallbacks<TaskSetResponse>(API_KEY);
              taskListService.fetchTaskSets(filter, callbacks);
            }}
          >
            Retry
          </Button>
        </div>
      )}
      
      {/* Task list */}
      {!loading && !error && taskListData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {taskListData.items.map(task => (
              <Card key={task._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{task.input_content || 'Task Set'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500">
                    <p>Status: <span className="font-medium">{task.status}</span></p>
                    <p>Created: <span className="font-medium">{new Date(task.created_at).toLocaleDateString()}</span></p>
                    <p>Tasks: <span className="font-medium">{task.tasks.length}</span></p>
                  </div>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = `/tasks/${task._id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {taskListData.total > 0 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={taskListData.page <= 1}
                  onClick={() => handlePageChange(taskListData.page - 1)}
                >
                  Previous
                </Button>
                
                <div className="flex items-center px-4 text-sm">
                  Page {taskListData.page} of {taskListData.pages}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={taskListData.page >= taskListData.pages}
                  onClick={() => handlePageChange(taskListData.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          
          {/* Empty state */}
          {taskListData.items.length === 0 && (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No tasks found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskListWithRedux;
