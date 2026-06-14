import Task from "../models/Task.js"
import Workspace from "../models/Workspace.js"
import User from "../models/User.js";


export const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, assignedTo, status } = req.body;
        const createdBy = req.body.createdBy;
        const { workspaceId } = req.params;

        const existingWorkspace = await Workspace.findById(workspaceId);

        if (!existingWorkspace) {
            return res.status(404).json({ message: "Workspace not found!" });
        }

        const task = new Task({ title, description, priority, dueDate, assignedTo, createdBy, workspace: workspaceId });
        await task.save();

        res.status(201).json({ message: "Task Created Sucessfully", task });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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

        const existingTask = await Task.findById(taskId);
        if (!existingTask) {
            return res.status(404).json({ message: "Task not found" })
        }
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { status },
            { new: true }
        );
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

        const deletedTask = await Task.findByIdAndDelete(taskId);

        if (!deletedTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json({
            message: "Task deleted"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server Error"
        });
    }
}

export const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;

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
