import express from "express";

import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  deleteWorkspace,
  updateWorkspace
} from "../controllers/workspaceController.js";

const router = express.Router();

router.post(
  "/workspaces",
  createWorkspace
);

router.get(
  "/workspaces",
  getWorkspaces
);

router.get(
  "/workspaces/:workspaceId",
  getWorkspaceById
);

router.put(
  "/workspaces/:workspaceId",
  updateWorkspace
);

router.delete(
  "/workspaces/:workspaceId",
  deleteWorkspace
);

export default router;