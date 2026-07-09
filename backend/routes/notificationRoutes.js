import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "name")
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ message: "All marked read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;