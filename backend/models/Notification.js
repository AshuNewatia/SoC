import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["MEMBER_ADDED", "TASK_ASSIGNED", "TASK_EDITED", "ROLE_CHANGED","WORKSPACE_INVITATION","WORKSPACE_INVITE_ACCEPTED","WORKSPACE_INVITE_DECLINED"], required: true },
    message: { type: String, required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);