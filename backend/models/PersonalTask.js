import mongoose from "mongoose";

const personalTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    tag: { type: String },
    dueDate: { type: Date },
    status: { type: String, enum: ["todo", "progress", "completed"], default: "todo" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sharedTask: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    isAssignedTask: { type: Boolean, default: false },
    activityHistory: [{
      action: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
    ],
  },
  {
    timestamps: true,
  });

export default mongoose.model(
  "PersonalTask",
  personalTaskSchema
);