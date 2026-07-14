import express from 'express';
import { createTask, getTasks, updateTaskStatus, updateTask,deleteTask } from '../controllers/taskController.js';
import { protect } from "../middleware/authMiddleware.js";
import { upload } from '../config/cloudinary.js';
import { uploadAttachment } from '../controllers/taskController.js';

const router = express.Router();

router.post(
 "/workspaces/:workspaceId/tasks",protect,
 createTask
);

router.get(
 "/workspaces/:workspaceId/tasks",protect,
 getTasks
);

router.patch(
 "/tasks/:taskId/status",protect,
 updateTaskStatus
);

router.put(
 "/tasks/:taskId",protect,
 updateTask
);

router.delete(
 "/tasks/:taskId",protect,
 deleteTask
);

router.post('/:taskId/attachments',protect,  upload.single('file'), uploadAttachment);

export default router;
