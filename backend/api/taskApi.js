import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getTasks = (workspaceId) => 
  axios.get(`${API_URL}/api/workspaces/${workspaceId}/tasks`);

export const createTask = (workspaceId, task) => 
  axios.post(`${API_URL}/api/workspaces/${workspaceId}/tasks`, task);

export const updateTask = (taskId, task) => 
  axios.put(`${API_URL}/api/tasks/${taskId}`, task);

export const deleteTask = (taskId) => 
  axios.delete(`${API_URL}/api/tasks/${taskId}`);

export const updateTaskStatus = (taskId, data) => 
  axios.put(`${API_URL}/api/tasks/${taskId}/status`, data);


console.log("taskApi.js loaded with direct axios exports");