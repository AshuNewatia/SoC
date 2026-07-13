import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMyBoardTasks } from "../controllers/myBoardController.js";

const router = express.Router();

router.get("/tasks", protect, getMyBoardTasks);

export default router;