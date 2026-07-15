import api from "../services/api";
import axios from "axios";

// ─── GET ALL TASKS FOR A WORKSPACE ─────────────────────────────
export const getTasks = (workspaceId) => 
  api.get(`/workspaces/${workspaceId}/tasks`);

// ─── CREATE A NEW TASK IN A WORKSPACE ──────────────────────────
export const createTask = (workspaceId, task) => 
  api.post(`/workspaces/${workspaceId}/tasks`, task);

// ─── UPDATE A TASK'S DETAILS ───────────────────────────────────
export const updateTask = (taskId, task) => 
  api.put(`/tasks/${taskId}`, task);

// ─── DELETE A TASK ─────────────────────────────────────────────
export const deleteTask = (taskId) => 
  api.delete(`/tasks/${taskId}`);

// ─── UPDATE ONLY TASK STATUS (For Drag & Drop) ─────────────────
export const updateTaskStatus = (taskId, data) => 
  api.put(`/tasks/${taskId}/status`, data);