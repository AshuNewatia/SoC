import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import { logActivity } from "./activityController.js";

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
      workspace.owner.toString() ===
      req.user._id.toString();

    const isAdmin =
      workspace.admins.some(
        (admin) =>
          admin.toString() ===
          req.user._id.toString()
      );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You can not invite member",
      });
    }

    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      workspace.owner.toString() ===
      userToAdd._id.toString()
    ) {
      return res.status(400).json({
        message: "User is already the owner",
      });
    }

    // Already member
    const alreadyMember =
      workspace.members.some(
        (member) =>
          member.toString() ===
          userToAdd._id.toString()
      );

    if (alreadyMember) {
      return res.status(400).json({
        message: "User is already a member",
      });
    }

    workspace.members.push(userToAdd._id);

    await workspace.save();

    await logActivity(
      workspace._id,
      req.user._id,
      "MEMBER_ADDED",
      `Added ${userToAdd.name} to the workspace`
    );

    res.status(200).json({
      message: "Member added successfully",
      member: {
        _id: userToAdd._id,
        name: userToAdd.name,
        email: userToAdd.email,
        avatar: userToAdd.avatar,
        role: "Member",
      },
    });

  } catch (error) {
    console.error("ADD MEMBER ERROR:");
    console.error(error);

    res.status(500).json({
      message: "Server Error",
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

    workspace.members =
      workspace.members.filter(
        member =>
          member.toString() !== userId
      );

    const targetIsAdmin =
      workspace.admins.some(
        admin =>
          admin.toString() === userId
      );

    if (targetIsAdmin && !isOwner) {
      return res.status(401).json({ message: "Only owner can remove admin" })
    }

    workspace.admins =
      workspace.admins.filter(
        admin =>
          admin.toString() !== userId
      );

    await workspace.save();

    await logActivity(
      workspace._id,
      req.user._id,
      "MEMBER_REMOVED",
      `removed ${userToRemove.name} from the workspace`
    );

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

    // Only owner
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

    if (!workspace.admins.includes(userId)) {
      workspace.admins.push(userId);
    }

    await workspace.save();

    res.status(200).json({
      message: "Admin added successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error"
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
