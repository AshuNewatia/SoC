import api from "./api";

export const getOverview = () =>
  api.get("/api/analytics/overview");

export const getTaskStatus = () =>
  api.get("/api/analytics/task-status");

export const getPriorityStats = () =>
  api.get("/api/analytics/priority");

export const getMemberPerformance = () =>
  api.get("/api/analytics/member-performance");

export const getProductivity = () =>
  api.get("/api/analytics/productivity");

export const getGithubAnalytics = () =>
  api.get("/api/analytics/github");

export const getInsights = () =>
  api.get("/api/analytics/insights");

export const getProductivityPercentage = () =>
  api.get("/api/analytics/productivity-percentage");

export const exportReport = () =>
  api.get("/api/analytics/export", { responseType: "blob" });

export const getCSVReport = () =>
  api.get(`/api/analytics/CSV`, { responseType: "blob" });