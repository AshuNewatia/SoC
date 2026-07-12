import Workspace from "../models/Workspace.js";
import mongoose from "mongoose";
import { logActivity } from "./activityController.js";
import { fetchGithubIssues } from '../services/githubService.js';
import Task from '../models/Task.js';
import { createAndSendNotification } from "../utils/notificationHelper.js";
import crypto from "crypto"

export const createWorkspace = async (req, res) => {
  try {
    const { name, description, githubRepo, githubToken } = req.body;
    const owner = req.user._id; 

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    const workspace = new Workspace({
      name: name.trim(),
      description: description || "",
      owner,
      admins: [],
      members: [owner], 
      githubRepo: githubRepo ? githubRepo.trim() : "",
      githubToken: githubToken ? githubToken.trim() : "",
    });

    await workspace.save();

    await logActivity(
      workspace._id,
      req.user._id,
      "WORKSPACE_CREATED",
      `created workspace "${name}"`
    );

    res.status(201).json({
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate("owner", "name email")   
      .sort({ createdAt: -1 });          

    res.status(200).json(workspaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getWorkspaceById = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspace id" });
    }

    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

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

export const updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;    
    const { name, description, githubRepo, githubToken } = req.body;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspace id" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isOwner =
            workspace.owner.toString() ===
            req.user._id.toString();
    
    if(!isOwner){
      return res.status(403).json({
                message: "Only owner can update the workspace",
            });
    }

    workspace.name = name?.trim() || workspace.name;
    workspace.description = description !== undefined ? description : workspace.description;
    workspace.githubRepo = githubRepo !== undefined ? githubRepo : workspace.githubRepo;
    workspace.githubToken = githubToken !== undefined ? githubToken : workspace.githubToken;

    if (githubRepo !== undefined) workspace.githubRepo = githubRepo;
    if (githubToken !== undefined) workspace.githubToken = githubToken;

    await workspace.save();

    if (githubRepo && githubToken && workspace.isModified('githubRepo')) {
  try {
    const githubIssues = await fetchGithubIssues(githubToken, githubRepo);


    if (githubIssues.length > 0) {

      const tasksToImport = githubIssues.map(issue => ({
        ...issue,
        workspace: workspace._id,
        owner: req.user._id
      }));

  
      await Task.insertMany(tasksToImport);
      console.log(`Successfully imported ${tasksToImport.length} issues.`);
    }
  } catch (err) {
    console.error("Auto-sync failed:", err.message);
  }
}

    await logActivity(
      workspace._id,
      req.user._id,
      "WORKSPACE_UPDATED",
      `updated workspace settings`
    );

    res.status(200).json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


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

    const isOwner =
            workspace.owner.toString() ===
            req.user._id.toString();
    
    if(!isOwner){
      return res.status(403).json({
                message: "Only owner can delete the workspace",
            });
    }

    await Workspace.findByIdAndDelete(workspaceId);
    res.status(200).json({ message: "Workspace deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const leaveWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id; 

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    if (workspace.owner.toString() === userId.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: "As the creator, you cannot leave. Delete the workspace or transfer ownership first." 
      });
    }

    const isMember = workspace.members.some(memberId => memberId.toString() === userId.toString());
    if (!isMember) {
      return res.status(400).json({ success: false, message: "You are not a member of this workspace" });
    }

    workspace.members = workspace.members.filter(
      (memberId) => memberId.toString() !== userId.toString()
    );

    await workspace.save();

    return res.status(200).json({ 
      success: true, 
      message: "Successfully left the workspace." 
    });

  } catch (error) {
    console.error("Error leaving workspace:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const transferOwnership = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { newOwnerId } = req.body;

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace)
            return res.status(404).json({
                success:false,
                message:"Workspace not found"
            });
        if (String(workspace.owner) !== String(req.user._id)) {
            return res.status(403).json({
                success:false,
                message:"Only the owner can transfer ownership."
            });
        }

        const isMember = workspace.members.some(
            m => String(m) === String(newOwnerId)
        );

        if (!isMember) {
            return res.status(400).json({
                success:false,
                message:"New owner must already be a workspace member."
            });
        }

        workspace.owner = newOwnerId;

        if (!workspace.admins.some(a => String(a) === String(newOwnerId))) {
            workspace.admins.push(newOwnerId);
        }

        await workspace.save();

        return res.json({
            success:true,
            message:"Ownership transferred successfully."
        });

    } catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
};

export const getInviteToken = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });
 
    // if (workspace.createdBy.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ message: "Only owners can generate invite links" });
    // }

    if (!workspace.inviteToken) {
      workspace.inviteToken = new mongoose.Types.ObjectId().toString();
      await workspace.save();
    }

    return res.status(200).json({ success: true, inviteToken: workspace.inviteToken });
  } catch (error) {
    return res.status(500).json({ message: "Server error generating link." });
  }
};

export const joinWorkspaceWithToken = async (req, res) => {
  try {
    const { inviteToken } = req.body;
    const userId = req.user._id; 

    const workspace = await Workspace.findOne({ inviteToken });
    if (!workspace) {
      return res.status(400).json({ success: false, message: "Invalid or expired invite link." });
    }

    const isAlreadyMember = workspace.members.some(id => id.toString() === userId.toString()) || 
                             workspace.createdBy.toString() === userId.toString();
                             
    if (isAlreadyMember) {
      return res.status(200).json({ success: true, workspaceId: workspace._id, message: "Already a member." });
    }

    workspace.members.push(userId);
    await workspace.save();

    return res.status(200).json({ success: true, workspaceId: workspace._id, message: "Successfully joined workspace!" });
  } catch (error) {
    return res.status(500).json({ message: "Server error during join procedure." });
  }
};