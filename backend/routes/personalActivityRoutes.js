import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  getPersonalActivities,
  createPersonalActivity,
} from "../controllers/personalActivityController.js";

const router = express.Router();

router.get("/", protect, getPersonalActivities);
router.post("/", protect, createPersonalActivity);

export default router;