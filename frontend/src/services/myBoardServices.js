import axios from "axios";

const API_URL = "http://localhost:5000/api/my-board";

export const getMyBoardTasks = async (filter) => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/tasks?filter=${filter}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};