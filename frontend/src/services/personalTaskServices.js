import api from "./api";

export const getMyTasks = async () => {
  const res = await api.get("/myboard/tasks");
  return res.data;
};

export const createPersonalTask = async (taskData) => {
  const res = await api.post("/myboard/tasks", taskData);
  return res.data;
};

export const updatePersonalTask = async (taskId, updates) => {
  const res = await api.put(`/myboard/tasks/${taskId}`, updates);
  return res.data;
};

export const deletePersonalTask = async (taskId) => {
  const res = await api.delete(`/myboard/tasks/${taskId}`);
  return res.data;
};
