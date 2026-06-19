import express from "express";

import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  deleteWorkspace,
  updateWorkspace
} from "../controllers/workspaceController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/workspaces",protect,
  createWorkspace
);

router.get(
  "/workspaces",protect,
  getWorkspaces
);

router.get(
  "/workspaces/:workspaceId",protect,
  getWorkspaceById
);

router.put(
  "/workspaces/:workspaceId",protect,
  updateWorkspace
);

router.delete(
  "/workspaces/:workspaceId",protect,
  deleteWorkspace
);

export default router;