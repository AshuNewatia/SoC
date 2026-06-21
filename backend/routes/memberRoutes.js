import express from "express";
import { getWorkspaceMembers, addMemberToWorkspace,promoteToAdmin,removeAdmin,removeMember} from "../controllers/memberController.js";
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// Member management routes
router.get(
  "/:workspaceId/members",
  protect,
  getWorkspaceMembers
);

router.post(
  "/:workspaceId/members",
  protect,
  addMemberToWorkspace
);

router.delete(
  "/:workspaceId/members/:userId",
  protect,
  removeMember
);

router.post(
  "/:workspaceId/admins/:userId",
  protect,
  promoteToAdmin
);

router.delete(
  "/:workspaceId/admins/:userId",
  protect,
  removeAdmin
);

export default router;