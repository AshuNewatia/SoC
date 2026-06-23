import mongoose from "mongoose";

const personalTaskSchema = new mongoose.Schema(
{
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
  tag: { type: String },
  dueDate: { type: Date },
  status: { type: String, enum: ["todo","progress","completed"] , deafult: "todo"},
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
},
{
  timestamps: true,
});

export default mongoose.model(
  "PersonalTask",
  personalTaskSchema
);