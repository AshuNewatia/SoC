import api from "./api";

export const getWorkspaces = () =>
  api.get("/api/workspaces");

export const getWorkspace = (id) =>
  api.get(`/api/workspaces/${id}`);

export const createWorkspace = (data) =>
  api.post("/api/workspaces", data);

export const updateWorkspace = (id, data) =>
  api.put(`/api/workspaces/${id}`, data);

export const deleteWorkspace = (id) =>
  api.delete(`/api/workspaces/${id}`);

export const transferOwnership = async (workspaceId, newOwnerId) => {
  return api.patch(
    `/api/workspaces/${workspaceId}/transfer-owner`,
    {
      newOwnerId,
    }
  );
};