import api from "./api";


export const getTaskComments = (taskId) =>
  api.get(`/api/comments/task/${taskId}`);


export const createComment = (taskId, data) =>
  api.post(`/api/comments/task/${taskId}`, data);


export const updateComment = (commentId, data) =>
  api.patch(`/api/comments/${commentId}`, data);


export const deleteComment = (commentId) =>
  api.delete(`/api/comments/${commentId}`);