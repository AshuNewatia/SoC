import mongoose from "mongoose";

const personalActivitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "PersonalActivity",
  personalActivitySchema
);