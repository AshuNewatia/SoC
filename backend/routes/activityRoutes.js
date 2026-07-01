import express from "express";
import { getWorkspaceActivities } from "../controllers/activityController.js";
// import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.get("/:id/activity", getWorkspaceActivities); 

export default router;