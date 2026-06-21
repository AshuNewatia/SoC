import axios from "axios";

const API_URL = "http://localhost:5000/api/myboard";

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getMyTasks = async () => {
  const response = await axios.get(
    `${API_URL}/tasks`,
    getAuthHeaders()
  );

  return response.data;
};

export const createTask = async (taskData) => {
  const response = await axios.post(
    `${API_URL}/tasks`,
    taskData,
    getAuthHeaders()
  );

  return response.data;
};

export const updateTask = async (taskId, updates) => {
  const response = await axios.put(
    `${API_URL}/tasks/${taskId}`,
    updates,
    getAuthHeaders()
  );

  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await axios.delete(
    `${API_URL}/tasks/${taskId}`,
    getAuthHeaders()
  );

  return response.data;
};