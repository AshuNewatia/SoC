import express from "express";

import {
  getWorkspaceOverview,
  getWorkspaceTaskStatus,
  getWorkspacePriorityStats,
  getWorkspaceCompletionTrend,
  getWorkspaceMemberPerformance,
  getWorkspaceWorkload,
  getWorkspaceInsights,
  getWorkspaceDeadlines,
} from "../controllers/workspaceAnalyticsController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get(
  "/:workspaceId/overview",
  protect,
  getWorkspaceOverview
);


router.get(
  "/:workspaceId/task-status",
  protect,
  getWorkspaceTaskStatus
);


router.get(
  "/:workspaceId/priority",
  protect,
  getWorkspacePriorityStats
);


router.get(
  "/:workspaceId/completion-trend",
  protect,
  getWorkspaceCompletionTrend
);


router.get(
  "/:workspaceId/member-performance",
  protect,
  getWorkspaceMemberPerformance
);


router.get(
  "/:workspaceId/workload",
  protect,
  getWorkspaceWorkload
);


router.get(
  "/:workspaceId/insights",
  protect,
  getWorkspaceInsights
);


router.get(
  "/:workspaceId/deadlines",
  protect,
  getWorkspaceDeadlines
);


export default router;