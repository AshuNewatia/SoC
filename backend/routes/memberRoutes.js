import express from "express";
import { getWorkspaceMembers, addMemberToWorkspace } from "../controllers/memberController.js";
// import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// Member management routes
router.get("/:id/members", getWorkspaceMembers);
router.post("/:id/members", addMemberToWorkspace); // Add 'protect' middleware in production

export default router;