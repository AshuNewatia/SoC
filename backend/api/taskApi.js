import api from "../services/api";

// ─── GET ALL TASKS FOR A WORKSPACE ─────────────────────────────
export const getTasks = (workspaceId) => 
  api.get(`/api/workspaces/${workspaceId}/tasks`);

// ─── CREATE A NEW TASK IN A WORKSPACE ──────────────────────────
export const createTask = (workspaceId, task) => 
  api.post(`/api/workspaces/${workspaceId}/tasks`, task);

// ─── UPDATE A TASK'S DETAILS ───────────────────────────────────
export const updateTask = (taskId, task) => 
  api.put(`/api/tasks/${taskId}`, task);

// ─── DELETE A TASK ─────────────────────────────────────────────
export const deleteTask = (taskId) => 
  api.delete(`/api/tasks/${taskId}`);

// ─── UPDATE ONLY TASK STATUS (For Drag & Drop) ─────────────────
export const updateTaskStatus = (taskId, data) => 
  api.put(`/api/tasks/${taskId}/status`, data);