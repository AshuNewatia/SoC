import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: String,

    description: String,

    assignee: String,

    priority: String,

    dueDate: String,

    comments: {
      type: Number,
      default: 0,
    },

    attachments: {
      type: Number,
      default: 0,
    },

    githubIssue: String,

    status: {
      type: String,
      default: "todo",
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Task",
  taskSchema
);