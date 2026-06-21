import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import { logActivity } from "./activityController.js";

// @desc    Get all members of a workspace (including the owner)
// @route   GET /api/workspaces/:id/members
export const getWorkspaceMembers = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Fetch the workspace and fully populate both the owner and members arrays
    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "name email avatar")
      .populate("members", "name email avatar");

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Format the owner
    const ownerData = {
      _id: workspace.owner._id,
      name: workspace.owner.name,
      email: workspace.owner.email,
      avatar: workspace.owner.avatar,
      role: "Owner",
      tasksCompleted: 0 // You can calculate this later when you build the Task system
    };

    // Format the standard members
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
    // Combine into one array for the React frontend
    const allMembers = [ownerData, ...membersData];

    res.status(200).json(allMembers);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ message: "Failed to load members" });
  }
};

// @desc    Add a new user to a workspace by email
// @route   POST /api/workspaces/:id/members
export const addMemberToWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email } = req.body;

    // 1. Find the user they are trying to invite
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: "User not found. Ask them to register first." });
    }

    // 2. Find the workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // 3. Ensure the owner isn't being added to the members array
    if (workspace.owner.toString() === userToAdd._id.toString()) {
      return res.status(400).json({ message: "This user is already the owner." });
    }

    // 4. Ensure the user isn't already in the members array
    if (workspace.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: "User is already a member." });
    }

    // 5. Add user and save
    workspace.members.push(userToAdd._id);
    await workspace.save();

    // 6. Log the activity 
    // (Assuming req.user.id is the person who sent the invite, provided by auth middleware)
    const actionUserId = req.user?.id || workspace.owner;

    await logActivity(
      workspace._id,
      actionUserId,
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
        tasksCompleted: 0
      }
    });
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ message: "Failed to add member" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found"
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
        message: "Not authorized"
      });
    }

    workspace.members =
      workspace.members.filter(
        member =>
          member.toString() !== userId
      );

    workspace.admins =
      workspace.admins.filter(
        admin =>
          admin.toString() !== userId
      );

    await workspace.save();

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

    if (!workspace.members.includes(userId)) {
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
