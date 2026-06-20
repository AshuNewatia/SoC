import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actionType: {
      type: String,
      required: true,
      // Examples: 'WORKSPACE_CREATED', 'MEMBER_ADDED', 'TASK_CREATED', 'TASK_COMPLETED'
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", activityLogSchema);