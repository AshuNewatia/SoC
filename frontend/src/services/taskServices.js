import api from "./api";

// All paths now start with a slash and exclude the redundant "/api"
export const getTasks = (workspaceId) =>
  api.get(`/api/workspaces/${workspaceId}/tasks`);

export const createTask = (workspaceId, taskData) =>
  api.post(
    `/api/workspaces/${workspaceId}/tasks`,
    taskData
  );

export const updateTask = (taskId, taskData) =>
  api.put(
    `/api/tasks/${taskId}`,
    taskData
  );

export const deleteTask = (taskId) =>
  api.delete(`/api/tasks/${taskId}`);

export const updateTaskStatus = (
  taskId,
  data
) =>
  api.patch(
    `/api/tasks/${taskId}/status`,
    data
  );