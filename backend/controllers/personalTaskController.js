import PersonalTask from "../models/PersonalTask.js";


export const createTask = async (req, res) => {
  try {
    const task = await PersonalTask.create({
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      tag: req.body.tag,
      dueDate: req.body.dueDate,
      status: req.body.status || "todo",

      user: req.user._id,

activityHistory: [
  { action: "Task created", },
],

    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const tasks = await PersonalTask.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await PersonalTask.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (req.body.status && req.body.status !== task.status) {
      const statusMap = {
        todo: "To Do",
        progress: "In Progress",
        completed: "Completed",
      };

      task.activityHistory.push({
        action: `Moved to ${statusMap[req.body.status]}`,
      });
    }

    if (req.body.priority && req.body.priority !== task.priority) {
      task.activityHistory.push({
        action: `Priority changed to ${req.body.priority}`,
      });
    }

    if (req.body.title && req.body.title !== task.title) {
      task.activityHistory.push({
        action: "Title updated",
      });
    }

    if (
      req.body.description !== undefined &&
      req.body.description !== task.description
    ) {
      task.activityHistory.push({
        action: "Description updated",
      });
    }

    if (req.body.dueDate && String(req.body.dueDate) !== String(task.dueDate)) {
      task.activityHistory.push({
        action: "Due date updated",
      });
    }

    if (req.body.tag && req.body.tag !== task.tag) {
      task.activityHistory.push({
        action: `Tag changed to ${req.body.tag}`,
      });
    }

    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    task.priority = req.body.priority ?? task.priority;
    task.tag = req.body.tag ?? task.tag;
    task.dueDate = req.body.dueDate ?? task.dueDate;
    task.status = req.body.status ?? task.status;

    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await PersonalTask.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};