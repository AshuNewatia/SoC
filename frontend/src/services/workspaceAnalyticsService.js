import api from "./api";

export const getWorkspaceOverview = (workspaceId) =>
  api.get(`/api/workspace-analytics/${workspaceId}/overview`);

export const getWorkspaceTaskStatus = (workspaceId) =>
  api.get(`/api/workspace-analytics/${workspaceId}/task-status`);

export const getWorkspacePriorityStats = (workspaceId) =>
  api.get(`/api/workspace-analytics/${workspaceId}/priority`);

export const getWorkspaceCompletionTrend = (workspaceId) =>
  api.get(`/api/workspace-analytics/${workspaceId}/completion-trend`);

export const getWorkspaceMemberPerformance = (workspaceId) =>
  api.get(`/api/workspace-analytics/${workspaceId}/member-performance`);

export const getWorkspaceWorkload = (workspaceId) =>
  api.get(`/api/workspace-analytics/${workspaceId}/workload`);

export const getWorkspaceInsights = (workspaceId) =>
  api.get(`/api/workspace-analytics/${workspaceId}/insights`);

export const getWorkspaceDeadlines = (workspaceId) =>
  api.get(`/api/workspace-analytics/${workspaceId}/deadlines`);

export const getCSVReport = (workspaceId) =>
  api.get(`/api/workspace-analytics/${workspaceId}/CSV`, { responseType: "blob" });