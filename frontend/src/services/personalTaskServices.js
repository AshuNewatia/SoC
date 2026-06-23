import api from "./api";

export const getMyTasks = () => api.get("/api/myboard/tasks");

export const createPersonalTask = (taskData) =>
  api.post("/api/myboard/tasks", taskData);

export const updatePersonalTask = (taskId, updates) =>
  api.put(`/api/myboard/tasks/${taskId}`, updates);

export const deletePersonalTask = (taskId) =>
  api.delete(`/api/myboard/tasks/${taskId}`);