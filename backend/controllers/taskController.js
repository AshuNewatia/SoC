import Task from "../models/Task.js";
import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import { createGithubIssue as sendGithubIssue, updateGithubIssueState } from "../services/githubService.js";
import { logActivity } from "./activityController.js";
import Comment from "../models/Comment.js";
import { createAndSendNotification } from "../utils/notificationHelper.js";

export const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, assignedTo, status, createGithubIssue } = req.body;
        const createdBy = req.body.createdBy || req.user._id;
        const { workspaceId } = req.params;

        const existingWorkspace = await Workspace.findById(workspaceId);

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
                message: "Member can not create task",
            });
        }

        let issueNumber = null;
        if (createGithubIssue && existingWorkspace.githubToken && existingWorkspace.githubRepo) {
            try {
                issueNumber = await sendGithubIssue(
                    existingWorkspace.githubToken,
                    existingWorkspace.githubRepo,
                    title,
                    description
                );
            } catch (githubError) {
                console.error("⚠️ GitHub Sync Failed:", githubError.message);
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
            githubIssueNumber: issueNumber
        });

        await task.save();

        if (assignedTo && assignedTo.length > 0) {
            for (const memberId of assignedTo) {
                await createAndSendNotification(req, {
                    recipient: memberId,
                    sender: req.user._id,
                    type: "TASK_ASSIGNED",
                    message: `You have been assigned to a new task: "${title}" in "${existingWorkspace.name}"`,
                    workspace: workspaceId,
                    relatedId: task._id
                });
            }
        }

        await logActivity(
            existingWorkspace._id,
            req.user._id,
            "TASK_CREATED",
            `created task "${title}"`,
            req.app.get("io")
        );

        if (assignedTo && assignedTo.length > 0) {
            const assignedUsers = await User.find({
                _id: { $in: assignedTo }
            });

            if (assignedUsers.length > 0) {
                await logActivity(
                    existingWorkspace._id,
                    req.user._id,
                    "TASK_ASSIGNED",
                    `assigned "${title}" to ${assignedUsers
                        .map(user => user.name)
                        .join(", ")}`,
                    req.app.get("io")
                );
            }
        }

        const io = req.app.get("io");
        if (io) {
            io.to(existingWorkspace._id.toString()).emit("activity_updated");
        }

        res.status(201).json(task);

    } catch (error) {
        console.error("CREATE TASK ERROR:", error);
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

        const isOwner =
            existingWorkspace.owner.toString() ===
            req.user._id.toString();

        const isAdmin =
            existingWorkspace.admins?.some(
                admin =>
                    admin.toString() ===
                    req.user._id.toString()
            ) || false;

        const isMember =
            existingWorkspace.members?.some(
                member =>
                    member.toString() ===
                    req.user._id.toString()
            ) || false;

        if (!isOwner && !isAdmin && !isMember) {
            return res.status(403).json({
                message: "Not authorized",
            });
        }

        const tasks = await Task.find({
            workspace: workspaceId
        })
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email")
            .populate("workspace", "name");

        const tasksWithCommentCount = await Promise.all(
            tasks.map(async (task) => {
                const commentCount = await Comment.countDocuments({
                    task: task._id,
                });

                const unreadComments = await Comment.countDocuments({
                    task: task._id,
                    readBy: {
                        $nin: [req.user._id],
                    },
                });

                return {
                    ...task.toObject(),
                    commentCount,
                    unreadCommentCount: unreadComments,
                    hasUnreadComments: unreadComments > 0,
                };
            })
        );

        return res.status(200).json(tasksWithCommentCount);

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

export const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const workspace = await Workspace.findById(
            task.workspace
        );

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        const isOwner =
            workspace.owner.toString() ===
            req.user._id.toString();

        const isAdmin =
            workspace.admins?.some(
                admin =>
                    admin.toString() ===
                    req.user._id.toString()
            ) || false;

        const isMember =
            workspace.members?.some(
                member =>
                    member.toString() ===
                    req.user._id.toString()
            ) || false;

        const isUnassigned = task.assignedTo.length === 0;

        if (!isOwner && !isAdmin && !isUnassigned) {
            const isAssigned =
                task.assignedTo?.some(
                    user =>
                        user.toString() ===
                        req.user._id.toString()
                ) || false;

            if (!isAssigned) {
                return res.status(403).json({
                    message:
                        "You can only move tasks assigned to you"
                });
            }
        }

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { status },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (updatedTask.githubIssueNumber) {
            if (workspace && workspace.githubToken && workspace.githubRepo) {
                await updateGithubIssueState(
                    workspace.githubToken,
                    workspace.githubRepo,
                    updatedTask.githubIssueNumber,
                    status
                );
            }
        }

        if (updatedTask.status === "completed") {
            await logActivity(
                workspace._id,
                req.user._id,
                "TASK_COMPLETED",
                `completed task "${updatedTask.title}"`,
                req.app.get("io")
            );
            const io = req.app.get("io");
            if (io) {
                io.to(workspace._id.toString()).emit("activity_updated");
            }
        }

        res.status(200).json({
            message: "Task status updated",
            task: updatedTask,
        });

    } catch (error) {
        console.error("UPDATE TASK STATUS ERROR:", error);
        res.status(500).json({
            message: "Server Error",
        });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
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
            return res.status(403).json({ message: "Member can not delete task" });
        }

        await Comment.deleteMany({ task: taskId });
        await Task.findByIdAndDelete(taskId);

        await logActivity(
            workspace._id,
            req.user._id,
            "TASK_DELETED",
            `deleted task "${taskToDelete.title}"`,
            req.app.get("io")
        );

        const io = req.app.get("io");
        if (io) {
            io.to(workspace._id.toString()).emit("activity_updated");
        }

        res.status(200).json({ message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const taskToUpdate = await Task.findById(taskId);
        if (!taskToUpdate) {
            return res.status(404).json({ message: "Task not found" });
        }

        const oldAssignedUsers = taskToUpdate.assignedTo.map(
            id => id.toString()
        );
        const oldDueDate = taskToUpdate.dueDate;

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
            return res.status(403).json({ message: "Member can not update task" });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            req.body,
            { new: true }
        );

        if (updatedTask.assignedTo && updatedTask.assignedTo.length > 0) {
            for (const memberId of updatedTask.assignedTo) {
                await createAndSendNotification(req, {
                    recipient: memberId,
                    sender: req.user._id,
                    type: "TASK_EDITED",
                    message: `The task "${updatedTask.title}" in "${workspace?.name || 'Workspace'}" has been updated.`,
                    workspace: updatedTask.workspace,
                    relatedId: updatedTask._id
                });
            }
        }

        if (updatedTask.githubIssueNumber && workspace.githubToken && workspace.githubRepo) {
            const status = req.body.status || updatedTask.status;
            try {
                await updateGithubIssueState(
                    workspace.githubToken,
                    workspace.githubRepo,
                    updatedTask.githubIssueNumber,
                    status
                );
            } catch (githubError) {
                console.error("⚠️ GitHub Update Failed:", githubError.message);
            }
        }

        if (req.app.get('io')) {
            req.app.get('io').emit('taskUpdated', updatedTask);
        }

        const newAssignedUsers = updatedTask.assignedTo.map(
            id => id.toString()
        );

        if (
            JSON.stringify(oldAssignedUsers) !==
            JSON.stringify(newAssignedUsers)
        ) {
            const assignedUsers = await User.find({
                _id: { $in: updatedTask.assignedTo }
            });

            await logActivity(
                workspace._id,
                req.user._id,
                "TASK_ASSIGNED",
                `assigned "${updatedTask.title}" to ${assignedUsers
                    .map(user => user.name)
                    .join(", ")}`,
                req.app.get("io")
            );
        }

        if (
            oldDueDate?.toString() !==
            updatedTask.dueDate?.toString()
        ) {
            const newDate = new Date(
                updatedTask.dueDate
            ).toLocaleDateString();

            await logActivity(
                workspace._id,
                req.user._id,
                "TASK_DUE_DATE_CHANGED",
                `changed due date of "${updatedTask.title}" to ${newDate}`,
                req.app.get("io")
            );
        }

        const io = req.app.get("io");
        if (io) {
            io.to(workspace._id.toString()).emit("activity_updated");
        }

        res.status(200).json(updatedTask);

    } catch (error) {
        console.error("Error inside updateTask controller:", error);
        res.status(500).json({ message: "Server Error", details: error.message });
    }
};

export const uploadAttachment = async (req, res) => {
    try {
        const { taskId } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded or invalid file type." });
        }

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const newAttachment = {
            fileName: req.file.originalname,
            fileUrl: req.file.path,
        };

        task.attachments.push(newAttachment);
        await task.save();

        await logActivity(
            task.workspace,
            req.user._id,
            "FILE_UPLOADED",
            `uploaded file "${newAttachment.fileName}" to task "${task.title}"`,
            req.app.get("io")
        );

        const io = req.app.get("io");
        if (io) {
            io.to(task.workspace).emit("taskUpdated", task);
            io.to(task.workspace).emit("activity_updated");
        }
        res.status(200).json({ message: "File uploaded successfully", task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};