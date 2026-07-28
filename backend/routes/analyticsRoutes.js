import express from "express";
import {
    getOverview,
    getTaskStatus,
  getPriorityStats,
  getMemberPerformance,
  getProductivity,
  getGithubAnalytics,
  getInsights,
  getProductivityPercentage,
  getDeadlinesRisk,
  exportAnalyticsReport,
  getCSVReport
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/overview", protect, getOverview);

router.get("/task-status", protect, getTaskStatus);

router.get("/priority", protect, getPriorityStats);

router.get("/member-performance", protect, getMemberPerformance);

router.get("/productivity", protect, getProductivity);

router.get("/github", protect, getGithubAnalytics);

router.get("/insights", protect, getInsights);

router.get("/productivity-percentage", protect, getProductivityPercentage);

router.get("/deadlines-risk", protect, getDeadlinesRisk);

router.get("/export", protect, exportAnalyticsReport);

router.get("/CSV",protect,getCSVReport);

router.get("/", (req, res) => {
  res.json({ message: "Analytics route working" });
});

export default router;