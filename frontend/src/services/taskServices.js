import api from "./api";

// All paths now start with a slash and exclude the redundant "/api"
export const getTasks = (workspaceId) =>
  api.get(`/workspaces/${workspaceId}/tasks`);

export const createTask = (workspaceId, taskData) =>
  api.post(
    `/workspaces/${workspaceId}/tasks`,
    taskData
  );

export const updateTask = (taskId, taskData) =>
  api.put(
    `/tasks/${taskId}`,
    taskData
  );

export const deleteTask = (taskId) =>
  api.delete(`/tasks/${taskId}`);

export const updateTaskStatus = (
  taskId,
  data
) =>
  api.patch(
    `/tasks/${taskId}/status`,
    data
  );