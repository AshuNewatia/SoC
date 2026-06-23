import express from "express";
import { getWorkspaceActivities } from "../controllers/activityController.js";
// import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// Fetch activity log for a specific workspace
router.get("/:id/activity", getWorkspaceActivities); // Add 'protect' middleware in production

export default router;