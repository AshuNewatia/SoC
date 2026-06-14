import express from "express";

import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById
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

export default router;