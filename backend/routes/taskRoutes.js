import express from 'express';
import { createTask, getTasks, updateTaskStatus, updateTask,deleteTask } from '../controllers/taskController.js';

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
);

router.put(
 "/tasks/:taskId",
 updateTask
);

router.delete(
 "/tasks/:taskId",
 deleteTask
);

export default router;