import axios from "axios";

const API =
  "https://soc-1-z27z.onrender.com/api/tasks";

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
