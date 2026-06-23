import express from "express";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
} from "../controllers/workspaceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createWorkspace);
router.get("/", protect, getWorkspaces);

router.get("/:workspaceId", protect, getWorkspaceById);
router.put("/:workspaceId", protect, updateWorkspace);
router.delete("/:workspaceId", protect, deleteWorkspace);

export default router;
