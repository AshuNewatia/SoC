import express from "express";

import {
  createTask,
  getMyTasks,
  updateTask,
  deleteTask,
} from "../controllers/personalTaskController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/tasks", protect, getMyTasks);

router.post("/tasks", protect, createTask);

router.put("/tasks/:id", protect, updateTask);

router.delete("/tasks/:id", protect, deleteTask);

export default router;