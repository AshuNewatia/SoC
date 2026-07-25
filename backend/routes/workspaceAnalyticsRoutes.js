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
  getCSVReport,
  getWorkspaceGithubAnalytics,
  getWorkspaceAnalyticsReport
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

router.get("/:workspaceId/CSV",protect,getCSVReport);
router.get("/github-stats",protect, getWorkspaceGithubAnalytics);
router.get("/:workspaceId/report",protect,getWorkspaceAnalyticsReport);


export default router;