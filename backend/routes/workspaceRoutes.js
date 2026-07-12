import express from "express";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  leaveWorkspace,
  transferOwnership
} from "../controllers/workspaceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { handleGithubWebhook } from "../controllers/webhookController.js";

const router = express.Router();

router.post("/", protect, createWorkspace);
router.get("/", protect, getWorkspaces);

router.get("/:workspaceId", protect, getWorkspaceById);
router.put("/:workspaceId", protect, updateWorkspace);
router.delete("/:workspaceId", protect, deleteWorkspace);
router.post("/webhooks/github", handleGithubWebhook);
router.post('/:workspaceId/leave', protect, leaveWorkspace);
router.patch("/:workspaceId/transfer-owner", protect, transferOwnership);

export default router;
