import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  getMyNotes,
  createNote,
  deleteNote,
  updateNote,
} from "../controllers/quickNoteController.js";

const router = express.Router();

router.get("/", protect, getMyNotes);
router.post("/", protect, createNote);
router.delete("/:id", protect, deleteNote);
router.put("/:id", protect, updateNote);

export default router;