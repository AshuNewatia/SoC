import Workspace from "../models/Workspace.js";

// @desc    Get all workspaces for the logged-in user (owner or member)
// @route   GET /api/workspaces
export const getUserWorkspaces = async (req, res) => {
  try {
    // 👇 Fallback: Try auth middleware first, then check URL query
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required to fetch workspaces" });
    }

    // Find workspaces where the user is either the owner OR in the members array
    const workspaces = await Workspace.find({
      $or: [{ owner: userId }, { members: userId }],
    })
      // .populate("owner", "name email avatar") // Uncomment if you need owner details later
      .sort({ createdAt: -1 });

    res.status(200).json(workspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({ message: "Failed to retrieve workspaces" });
  }
};

// @desc    Get a single workspace by ID
// @route   GET /api/workspaces/:id
export const getWorkspaceById = async (req, res) => {
  try {
    const { id } = req.params;

    const workspace = await Workspace.findById(id)
      .populate("owner", "name email avatar")
      .populate("members", "name email avatar");

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    res.status(200).json(workspace);
  } catch (error) {
    console.error("Error fetching workspace:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Invalid workspace ID format" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new workspace
// @route   POST /api/workspaces
export const createWorkspace = async (req, res) => {
  try {
    // 1. Destructure 'owner' out of the request body (the frontend is sending this!)
    const { name, description, owner } = req.body;
    
    // 2. Safely get the user ID. 
    // It will try to use the auth middleware first (req.user.id). 
    // If that fails, it falls back to the 'owner' provided by your React frontend.
    const userId = req.user?.id || owner;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required to create a workspace." });
    }

    if (!name) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    const newWorkspace = await Workspace.create({
      name,
      description,
      owner: userId,
      members: [], 
    });

    res.status(201).json({ workspace: newWorkspace });
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({ message: "Failed to create workspace" });
  }
};

// @desc    Update workspace details (name, description)
// @route   PUT /api/workspaces/:id
export const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Only the owner should be able to update core settings
    if (workspace.owner.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to update this workspace" });
    }

    workspace.name = name || workspace.name;
    workspace.description = description !== undefined ? description : workspace.description;

    const updatedWorkspace = await workspace.save();

    res.status(200).json(updatedWorkspace);
  } catch (error) {
    console.error("Error updating workspace:", error);
    res.status(500).json({ message: "Failed to update workspace" });
  }
};

// @desc    Delete a workspace
// @route   DELETE /api/workspaces/:id
export const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Only the owner can delete the workspace
    if (workspace.owner.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this workspace" });
    }

    await workspace.deleteOne();

    // Note: In a full app, you might also want to delete all Tasks and ActivityLogs 
    // associated with this workspace ID here.

    res.status(200).json({ message: "Workspace deleted successfully", id });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    res.status(500).json({ message: "Failed to delete workspace" });
  }
};