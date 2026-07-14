import Task from "../models/Task.js";
import PersonalTask from "../models/PersonalTask.js";

export const getMyBoardTasks = async (req, res) => {
    try {
        const filter = req.query.filter || "personal";

        let tasks = [];

        // Personal Tasks
        if (filter === "personal") {
            const personalTasks = await PersonalTask.find({
                user: req.user._id,
            });

            tasks = personalTasks.map((task) => ({
                ...task.toObject(),
                taskType: "personal",
                workspaceName: null,
            }));
        }

        // Assigned Workspace Tasks
        else if (filter === "assigned") {
            const assignedTasks = await Task.find({
                assignedTo: req.user._id,
            })
                .populate("workspace", "name")
                .populate("createdBy", "name");

            tasks = assignedTasks.map((task) => ({
                ...task.toObject(),
                taskType: "workspace",
                workspaceName: task.workspace?.name,
            }));
        }

        // All Tasks
        else if (filter === "all") {

            const personalTasks = await PersonalTask.find({
                user: req.user._id,
            });

            const assignedTasks = await Task.find({
                assignedTo: req.user._id,
            })
                .populate("workspace", "name")
                .populate("createdBy", "name");

            const personal = personalTasks.map(task => ({
                ...task.toObject(),
                taskType: "personal",
                workspaceName: null,
            }));

            const workspace = assignedTasks.map(task => ({
                ...task.toObject(),
                taskType: "workspace",
                workspaceName: task.workspace?.name,
            }));

            tasks = [...personal, ...workspace].sort((a, b) => {
                // Tasks with due dates come first
                if (a.dueDate && b.dueDate) {
                    return new Date(a.dueDate) - new Date(b.dueDate);
                }

                // Tasks without due dates go to the bottom
                if (a.dueDate) return -1;
                if (b.dueDate) return 1;

                // Otherwise newest first
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        }

        const personalCount = await PersonalTask.countDocuments({
            user: req.user._id,
        });

        const assignedCount = await Task.countDocuments({
            assignedTo: req.user._id,
        });

        res.status(200).json({
            tasks,
            counts: {
                personal: personalCount,
                assigned: assignedCount,
                all: personalCount + assignedCount,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message,
        });
    }
};