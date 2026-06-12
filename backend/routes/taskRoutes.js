import express from 'express';
import { createTask, getTasks , updateTaskStatus } from '../controllers/taskController.js';

const router = express.Router();

router.post(
  "/workspaces/:workspaceId/tasks",
  createTask
);

router.get(
  "/workspaces/:workspaceId/tasks",
  getTasks
);

router.patch(
  "/tasks/:taskId/status",
  updateTaskStatus
)

export default router;