import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import { logActivity } from "./activityController.js";
import { createAndSendNotification } from "../utils/notificationHelper.js";
import Invitation from "../models/Invitation.js";
import nodemailer from "nodemailer";

export const getWorkspaceMembers = async (req, res) => {
  try {
    const { workspaceId } = req.params;


    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "name email avatar")
      .populate("members", "name email avatar");

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const ownerData = {
      _id: workspace.owner._id,
      name: workspace.owner.name,
      email: workspace.owner.email,
      avatar: workspace.owner.avatar,
      role: "Owner",
      tasksCompleted: 0
    };

    const membersData = workspace.members
      .filter(
        member =>
          member._id.toString() !==
          workspace.owner._id.toString()
      )
      .map((member) => ({
        _id: member._id,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        role: workspace.admins.some(
          admin =>
            admin.toString() ===
            member._id.toString()
        )
          ? "Admin"
          : "Member"
      }));

    const allMembers = [ownerData, ...membersData];

    res.status(200).json(allMembers);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ message: "Failed to load members" });
  }
};

export const addMemberToWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email } = req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isOwner =
      workspace.owner.toString() === req.user._id.toString();

    const isAdmin = workspace.admins.some(
      (admin) => admin.toString() === req.user._id.toString()
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You cannot invite members.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (
      existingUser &&
      workspace.owner.toString() === existingUser._id.toString()
    ) {
      return res.status(400).json({
        message: "User is already the owner.",
      });
    }


    if (
      existingUser &&
      workspace.members.some(
        (member) => member.toString() === existingUser._id.toString()
      )
    ) {
      return res.status(400).json({
        message: "User is already a member.",
      });
    }

    const existingInvitation = await Invitation.findOne({
      workspace: workspace._id,
      invitedEmail: email,
      status: "PENDING",
    });

    if (existingInvitation) {
      return res.status(400).json({
        message: "User already has a pending invitation.",
      });
    }

    const invitation = await Invitation.create({
      workspace: workspace._id,
      invitedEmail: email,
      invitedUser: existingUser ? existingUser._id : null,
      invitedBy: req.user._id,
      status: "PENDING",
    });

    if (existingUser) {
      await createAndSendNotification(req, {
        recipient: existingUser._id,
        sender: req.user._id,
        type: "WORKSPACE_INVITATION",
        message: `${req.user.name} invited you to join "${workspace.name}".`,
        workspace: workspace._id,
        relatedId: invitation._id,
        relatedModel: "WorkspaceInvitation",
      });
    }

    try {

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, 
  },
});

      const invitationLink =
        `${process.env.CLIENT_URL}/invitations/${invitation._id}`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Invitation to join ${workspace.name} on CampusFlow`,
        html: `
          <h2>CampusFlow</h2>

          <p>Hello${existingUser ? ` ${existingUser.name}` : " there"},</p>

          <p>
            <strong>${req.user.name}</strong> invited you to join the workspace
            <strong>${workspace.name}</strong>.
          </p>

          <p>
            Click the button below to review and respond to the invitation.
          </p>

          <a
            href="${invitationLink}"
            style="
              display:inline-block;
              padding:12px 24px;
              background:#2563eb;
              color:#ffffff;
              text-decoration:none;
              border-radius:8px;
              font-weight:bold;
            "
          >
            View Invitation
          </a>

          <p style="margin-top:24px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>

          <p>${invitationLink}</p>
        `,
      });
    } catch (emailError) {
      console.error("Invitation email failed:", emailError);
    }

    return res.status(200).json({
      message: "Invitation sent successfully.",
    });

  } catch (error) {
    console.error("ADD MEMBER ERROR:", error);

    return res.status(500).json({
      message: "Server Error",
      details: error.message,
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    const userToRemove = await User.findById(userId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found"
      });
    }

    if (
      userId ===
      req.user._id.toString()
    ) {
      return res.status(400).json({
        message:
          "You cannot remove yourself"
      });
    }

    const isOwner =
      workspace.owner.toString() ===
      req.user._id.toString();

    const isAdmin =
      workspace.admins.some(
        admin =>
          admin.toString() ===
          req.user._id.toString()
      );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You can not remove member"
      });
    }

    const targetIsAdmin = workspace.admins.some(
      admin => admin.toString() === userId
    );

    if (targetIsAdmin && !isOwner) {
      return res.status(403).json({
        message: "Only owner can remove admin"
      });
    }

    workspace.members = workspace.members.filter(
      member => member.toString() !== userId
    );

    workspace.admins = workspace.admins.filter(
      admin => admin.toString() !== userId
    );
    await workspace.save();

    await logActivity(
      workspace._id,
      req.user._id,
      "MEMBER_REMOVED",
      `removed ${userToRemove.name} from the workspace`
    );
    const io = req.app.get("io");
    if (io) {
      io.to(workspaceId).emit('members_updated');
      io.to(workspaceId).emit('activity_updated');
    }

    res.status(200).json({
      message: "Member removed"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

export const promoteToAdmin = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found"
      });
    }

    if (
      workspace.owner.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Only owner can promote admins"
      });
    }

    const isMember =
      workspace.members.some(
        member =>
          member.toString() === userId
      );

    if (!isMember) {
      return res.status(400).json({
        message: "User is not a member"
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (workspace.admins.includes(userId)) {
      return res.status(400).json({
        message: "User is already an admin"
      });
    }

    workspace.admins.push(userId);
    await workspace.save();

    await createAndSendNotification(req, {
      recipient: userId,
      sender: req.user._id,
      type: "ROLE_CHANGED",
      message: `You have been promoted to Admin in workspace "${workspace.name}"`,
      workspace: workspaceId,
      relatedId: workspaceId
    });
    await logActivity(
      workspace._id,
      req.user._id,
      "ROLE_CHANGED",
      `promoted ${targetUser.name} to Admin`
    );

    const io = req.app.get("io");
    if (io) {
      io.to(workspaceId).emit('members_updated');
      io.to(workspaceId).emit('activity_updated');
    }


    res.status(200).json({
      message: "Admin added successfully",
      workspace
    });

  } catch (error) {
    console.error("Error in promoteToAdmin:", error);

    res.status(500).json({
      message: "Server Error",
      details: error.message
    });
  }
};
export const removeAdmin = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found"
      });
    }

    if (
      workspace.owner.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Only owner can remove admins"
      });
    }

    workspace.admins =
      workspace.admins.filter(
        admin =>
          admin.toString() !== userId
      );

    await workspace.save();

    const io = req.app.get("io");
    if (io) io.to(workspaceId).emit('members_updated');

    res.status(200).json({
      message: "Admin removed"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

export const acceptWorkspaceInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({
        message: "Invitation not found"
      });
    }

    if (invitation.status !== "PENDING") {
      return res.status(400).json({
        message: "This invitation has already been processed"
      });
    }

    if (!invitation.invitedUser.equals(req.user._id)) {
      return res.status(403).json({
        message: "This invitation is not for you"
      });
    }

    const workspace = await Workspace.findById(invitation.workspace);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found"
      });
    }

    const alreadyMember = workspace.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!alreadyMember) {
      workspace.members.push(req.user._id);
      await workspace.save();
    }

    invitation.status = "ACCEPTED";
    invitation.respondedAt = new Date();
    await invitation.save();


    await logActivity(
      workspace._id,
      req.user._id,
      "MEMBER_ADDED",
      `${req.user.name} joined the Workspace`
    );

    await createAndSendNotification(req, {
      recipient: invitation.invitedBy,
      sender: req.user._id,
      type: "WORKSPACE_INVITE_ACCEPTED",
      message: `${req.user.name} accepted your workspace invitation.`,
      workspace: workspace._id,
      relatedId: invitation._id,
      relatedModel: "WorkspaceInvitation",
    });

    const io = req.app.get("io");
    if (io) {
      io.to(workspace._id.toString()).emit("members_updated");
      io.to(workspace._id.toString()).emit("activity_updated");
    }

    return res.status(200).json({
      message: "Invitation accepted successfully.",
      workspace: {
        id: workspace._id,
        name: workspace.name,
      }
    });

  } catch (error) {
    console.error("Accept invitation error:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const declineWorkspaceInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({
        message: "Invitation not found"
      });
    }

    const workspace = await Workspace.findById(invitation.workspace);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found"
      });
    }

    if (invitation.status !== "PENDING") {
      return res.status(400).json({
        message: "This invitation has already been processed"
      });
    }

    if (!invitation.invitedUser.equals(req.user._id)) {
      return res.status(403).json({
        message: "This invitation is not for you"
      });
    }

    invitation.status = "DECLINED";
    invitation.respondedAt = new Date();
    await invitation.save();

    await createAndSendNotification(req, {
      recipient: invitation.invitedBy,
      sender: req.user._id,
      type: "WORKSPACE_INVITE_DECLINED",
      message: `${req.user.name} declined your workspace invitation.`,
      workspace: workspace._id,
      relatedId: invitation._id,
      relatedModel: "WorkspaceInvitation",
    });

    return res.status(200).json({
      message: "Invitation declined successfully.",
    });

  } catch (error) {
    console.error("Decline invitation error:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const getWorkspaceInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await Invitation.findById(invitationId)
      .populate("workspace", "name")
      .populate("invitedBy", "name email");

    if (!invitation) {
      return res.status(404).json({
        message: "Invitation not found.",
      });
    }

    // Only the invited user can view this invitation
    if (
      invitation.invitedUser.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to view this invitation.",
      });
    }

    return res.status(200).json({
      invitationId: invitation._id,
      workspaceId: invitation.workspace._id,
      workspaceName: invitation.workspace.name,
      inviter: {
        name: invitation.invitedBy.name,
        email: invitation.invitedBy.email,
      },
      status: invitation.status,
    });
  } catch (error) {
    console.error("GET WORKSPACE INVITATION ERROR:", error);

    return res.status(500).json({
      message: "Server Error",
      details: error.message,
    });
  }
};