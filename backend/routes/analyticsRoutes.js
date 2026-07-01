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
} from "../controllers/analyticsController.js";


const router = express.Router();

router.get("/overview", getOverview);

router.get("/task-status", getTaskStatus);

router.get("/priority", getPriorityStats);

router.get("/member-performance", getMemberPerformance);

router.get("/productivity", getProductivity);

router.get("/github", getGithubAnalytics);

router.get("/insights", getInsights);

router.get("/productivity-percentage", getProductivityPercentage);

router.get("/", (req, res) => {
  res.json({ message: "Analytics route working" });
});

export default router;