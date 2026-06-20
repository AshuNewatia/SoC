import express from "express";
import {
  getUserWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from "../controllers/workspaceController.js";

// Import your auth middleware (adjust the path based on your project structure)
// import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// --------------------------------------------------------
// Important: Apply your `protect` middleware to these routes 
// so `req.user.id` is available in the controller!
// Example: router.route("/").get(protect, getUserWorkspaces)
// --------------------------------------------------------

router
  .route("/")
  .get(getUserWorkspaces)    // GET /api/workspaces
  .post(createWorkspace);    // POST /api/workspaces

router
  .route("/:id")
  .get(getWorkspaceById)     // GET /api/workspaces/:id
  .put(updateWorkspace)      // PUT /api/workspaces/:id
  .delete(deleteWorkspace);  // DELETE /api/workspaces/:id

export default router;