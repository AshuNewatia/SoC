import Workspace from "../models/Workspace.js"
import User from "../models/User.js";

export const createWorkspace = async (req, res) => {
    try {
        const { name, description } = req.body;
        const owner = req.body.owner;
        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Workspace name is required"
            });
        }
        const userExists = await User.findById(owner);
        if (!userExists) {
            return res.status(404).json({
                message: "Owner not found"
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
        const workspaces = await Workspace.find();
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
        const workspace =
            await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({message:"Workspace not found"})
        }
        res.status(200).json(workspace);
    } catch (error) {

    }
}