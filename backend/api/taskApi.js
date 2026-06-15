import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const API =`${API_URL}/api/tasks`;

export const getTasks = () =>
  axios.get(API);

export const createTask = (task) =>
  axios.post(API, task);

export const updateTask = (
  id,
  task
) =>
  axios.put(
    `${API}/${id}`,
    task
  );