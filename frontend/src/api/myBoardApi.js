import api from "../services/api";

export const getMyBoardTasks = (filter = "personal") =>
  api.get(`/api/my-board/tasks?filter=${filter}`);