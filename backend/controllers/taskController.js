import Task from "../models/Task.js"
import Workspace from "../models/Workspace.js"
// import User from "../models/User.js";


export const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            status,
        } = req.body;

        const createdBy = req.user._id;

        const { workspaceId } = req.params;

        const existingWorkspace =
            await Workspace.findById(workspaceId);

        if (!existingWorkspace) {
            return res.status(404).json({
                message: "Workspace not found!",
            });
        }

        const isOwner =
            existingWorkspace.owner.toString() ===
            req.user._id.toString();

        const isAdmin =
            existingWorkspace.admins?.some(
                admin =>
                    admin.toString() ===
                    req.user._id.toString()
            ) || false;

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: "Not authorized",
            });
        }

        const task = new Task({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createdBy,
            workspace: workspaceId,
            status: status || "todo",
        });

        await task.save();

        res.status(201).json(task);

    } catch (error) {
        console.error("CREATE TASK ERROR");
        console.error(error);

        res.status(500).json({
            message: error.message,
        });
    }
};

export const getTasks = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const existingWorkspace = await Workspace.findById(workspaceId);

        if (!existingWorkspace) {
            return res.status(404).json({ message: "Workspace not found!" });
        }
        const tasks = await Task.find({
            workspace: workspaceId
        });
        res.status(200).json(tasks);

    } catch (error) {
        res.status(500).json({
            message: "Server Error"
        });
    }

};


export const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { status },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }
        res.status(200).json({
            message: "Task status updated",
            task: updatedTask
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
}

export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const workspace = await Workspace.findById(task.workspace);

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
                message: "Not authorized",
            });
        }

        await Task.findByIdAndDelete(taskId);

        res.status(200).json({
            message: "Task deleted successfully",
        });

    } catch (error) {
        console.error("DELETE TASK ERROR:");
        console.error(error);

        res.status(500).json({
            message: "Server Error",
        });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const workspace = await Workspace.findById(task.workspace);

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
                admin =>
                    admin.toString() ===
                    req.user._id.toString()
            );

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: "Not authorized"
            });
        }

        const updatedTask =
            await Task.findByIdAndUpdate(
                taskId,
                req.body,
                { new: true }
            );

        res.status(200).json(updatedTask);

    } catch (error) {
        res.status(500).json({
            message: "Server Error"
        });
    }
}