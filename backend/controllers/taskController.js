import Task from "../models/Task.js";
import Workspace from "../models/Workspace.js";
import { createGithubIssue, updateGithubIssueState } from "../services/githubService.js";

export const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, assignedTo, status } = req.body;
        const createdBy = req.body.createdBy || req.user._id; 
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

        let issueNumber = null;
        if (existingWorkspace.githubToken && existingWorkspace.githubRepo) {
            try {
                // We wrap this in its own try/catch so if GitHub fails, the app survives!
                issueNumber = await createGithubIssue(
                    existingWorkspace.githubToken,
                    existingWorkspace.githubRepo,
                    title,
                    description
                );
            } catch (githubError) {
                console.error("⚠️ GitHub Sync Failed:", githubError.message);
                // Notice we DO NOT 'return' here. We let the code continue down to task.save()!
            }
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
            githubIssueNumber: issueNumber // 👇 Save the GitHub issue ID!
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
        res.status(500).json({ message: "Server Error" });
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
            return res.status(404).json({ message: "Task not found" });
        }

        // ==========================================
        // GITHUB INTEGRATION: Close/Reopen Issue
        // ==========================================
        if (updatedTask.githubIssueNumber) {
            const workspace = await Workspace.findById(updatedTask.workspace);
            if (workspace && workspace.githubToken && workspace.githubRepo) {
                await updateGithubIssueState(
                    workspace.githubToken,
                    workspace.githubRepo,
                    updatedTask.githubIssueNumber,
                    status
                );
            }
        }

        res.status(200).json({
            message: "Task status updated",
            task: updatedTask
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
}

export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        // 👇 BUG FIX: Fetch the task and workspace first before checking roles!
        const taskToDelete = await Task.findById(taskId);
        if (!taskToDelete) {
            return res.status(404).json({ message: "Task not found" });
        }

        const workspace = await Workspace.findById(taskToDelete.workspace);

        const isOwner =
            workspace.owner.toString() ===
            req.user._id.toString();

        const isAdmin =
            workspace.admins?.some(
                admin =>
                    admin.toString() ===
                    req.user._id.toString()
            );

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Task.findByIdAndDelete(taskId);

        res.status(200).json({ message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        // 👇 BUG FIX: Fetch the task and workspace first before checking roles!
        const taskToUpdate = await Task.findById(taskId);
        if (!taskToUpdate) {
            return res.status(404).json({ message: "Task not found" });
        }

        const workspace = await Workspace.findById(taskToUpdate.workspace);

        const isOwner =
            workspace.owner.toString() ===
            req.user._id.toString();

        const isAdmin =
            workspace.admins?.some(
                admin =>
                    admin.toString() ===
                    req.user._id.toString()
            );

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedTask);

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}