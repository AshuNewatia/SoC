import Notification from "../models/Notification.js";

export const createAndSendNotification = async (req, { recipient, sender, type, message, workspace, relatedId }) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      message,
      workspace,
      relatedId,
    });

    const populatedNotification = await notification.populate("sender", "name email");

    const io = req.app.get("io");
    if (io) {
      io.to(recipient.toString()).emit("newNotification", populatedNotification);
    }
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};