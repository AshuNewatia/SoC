import express from "express";
import {
  createComment,
  getTaskComments,
  editComment,
  deleteComment,
  markCommentsAsRead,
} from "../controllers/commentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/task/:taskId", protect, createComment);

router.get("/task/:taskId", protect, getTaskComments);

router.patch("/:commentId", protect, editComment);

router.delete("/:commentId", protect, deleteComment);

router.put("/task/:taskId/read", protect, markCommentsAsRead);

export default router;