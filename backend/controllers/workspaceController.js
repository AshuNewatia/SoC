import Workspace from "../models/Workspace.js";
import mongoose from "mongoose";

// ─── CREATE ──────────────────────────────────────────────
export const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const owner = req.user._id; // ✅ from JWT — secure

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    const workspace = new Workspace({
      name: name.trim(),
      description: description || "",
      owner,
      admins: [],
      members: [owner], // owner is automatically a member
    });

    await workspace.save();

    res.status(201).json({
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ─── GET ALL (user’s workspaces) ─────────────────────────
export const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate("owner", "name email")   // optional, if you want owner details
      .sort({ createdAt: -1 });          // latest first (friend’s improvement)

    res.status(200).json(workspaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ─── GET BY ID (with permission check) ──────────────────
export const getWorkspaceById = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // ✅ friend’s better ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspace id" });
    }

     console.log("========== GET WORKSPACE ==========");
    console.log("workspaceId =", workspaceId);
    console.log("userId =", req.user._id);

    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "name email")
      .populate("members", "name email");

    console.log("workspace =", workspace);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // ✅ your permission check (secure)
    const isOwner = workspace.owner._id.toString() === req.user._id.toString();
    const isMember = workspace.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ─── UPDATE (only owner) ────────────────────────────────
export const updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspace id" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // ✅ owner-only check
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can update this workspace" });
    }

    workspace.name = name?.trim() || workspace.name;
    workspace.description = description !== undefined ? description : workspace.description;

    await workspace.save();
    res.status(200).json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ─── DELETE (only owner) ────────────────────────────────
export const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspace id" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can delete this workspace" });
    }

    await Workspace.findByIdAndDelete(workspaceId);
    res.status(200).json({ message: "Workspace deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
