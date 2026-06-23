import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    description: { 
      type: String,
      trim: true 
    },
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    members: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
  },
  { timestamps: true }
);

export default mongoose.model("Workspace", workspaceSchema);