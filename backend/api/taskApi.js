import axios from "axios";

<<<<<<< HEAD
const API_URL = import.meta.env.VITE_API_URL;

const API =`${API_URL}/api/tasks`;
=======
const API =
  "https://soc-1-z27z.onrender.com/api/tasks";
>>>>>>> origin/main

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
