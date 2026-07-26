import mongoose from "mongoose";

const workspaceInvitationSchema = new mongoose.Schema({
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
    },

    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    invitedEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },

    invitedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    role: {
        type: String,
        default: "member",
    },

    status: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "DECLINED"],
        default: "PENDING",
    },

    respondedAt: Date,
}, { timestamps: true });

export default mongoose.model("Invitation", workspaceInvitationSchema);