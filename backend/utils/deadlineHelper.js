import Task from "../models/Task.js";
import Notification from "../models/Notification.js";

export const checkAndLogDeadlineNotifications = async (workspaceId, io) => {
  try {
    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(now.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(now);
    tomorrowEnd.setDate(now.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);
    const upcomingTasks = await Task.find({
      workspace: workspaceId,
      dueDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
      status: { $ne: "completed" },
    }).populate("workspace", "name");

    for (const task of upcomingTasks) {
      if (!task.assignedTo || task.assignedTo.length === 0) continue;

      for (const recipientId of task.assignedTo) {
        const existingNotif = await Notification.findOne({
          recipient: recipientId,
          type: "DEADLINE_REMINDER",
          link: `/workspaces/${task.workspace._id}/tasks/${task._id}`,
          createdAt: { $gte: tomorrowStart },
        });

        if (!existingNotif) {
          const notification = new Notification({
            recipient: recipientId,
            sender: task.createdBy || recipientId,
            type: "DEADLINE_REMINDER",
            message: `Deadline alert: Task "${task.title}" is due tomorrow!`,
            link: `/workspaces/${task.workspace._id}/tasks/${task._id}`,
            isRead: false,
          });

          await notification.save();
          if (io) {
            io.to(recipientId.toString()).emit("newNotification", notification);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error logging deadline notifications:", error);
  }
};