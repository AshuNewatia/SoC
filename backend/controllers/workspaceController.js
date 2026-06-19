import Workspace from "../models/Workspace.js"
import User from "../models/User.js";
import mongoose from "mongoose";

export const createWorkspace = async (req, res) => {
    try {
        const { name, description } = req.body;
        const owner = req.user._id;
        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Workspace name is required"
            });
        }
        const workspace = new Workspace({
            name: name.trim(),
            description,
            owner,
            members: [owner]
        });
        await workspace.save();
        res.status(201).json({
            message: "Workspace created successfully",
            workspace
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message
        });
    }
};

export const getWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({
            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ]
        });
        res.status(200).json(workspaces);
    } catch (error) {
        res.status(500).json({
            message: "Server Error"
        });
    }
};

export const getWorkspaceById = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
            return res.status(400).json({
                message: "Invalid workspace id",
            });
        }
        const workspace = await Workspace.findById(workspaceId)
            .populate("owner", "name email")
            .populate("members", "name email");

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }
        const isOwner =
            workspace.owner._id.toString() === req.user._id.toString();

        const isMember =
            workspace.members.some(
                member =>
                    member._id.toString() === req.user._id.toString()
            );

        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "Access denied",
            });
        }
        res.status(200).json(workspace);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error",
        });
    }
};

export const updateWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { name, description } = req.body;

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }
        if (
            workspace.owner.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Only owner can update workspace"
            });
        }
        workspace.name = name || workspace.name;
        workspace.description = description || workspace.description;

        await workspace.save();

        res.status(200).json(workspace);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error",
        });
    }
};

export const deleteWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }
        if (
            workspace.owner.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Only owner can delete workspace"
            });
        }
        await Workspace.findByIdAndDelete(workspaceId);

        res.status(200).json({
            message: "Workspace deleted successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error",
        });
    }
};