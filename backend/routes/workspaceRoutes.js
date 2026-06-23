import express from "express";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addMember,
} from "../controllers/workspaceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { handleGithubWebhook } from "../controllers/githubWebhookController.js";

const router = express.Router();

router.post("/", protect, createWorkspace);
router.get("/", protect, getWorkspaces);

router.get("/:workspaceId", protect, getWorkspaceById);
router.put("/:workspaceId", protect, updateWorkspace);
router.delete("/:workspaceId", protect, deleteWorkspace);
router.post("/webhooks/github", handleGithubWebhook);
router.post("/:workspaceId/members", protect, addMember);

export default router;
