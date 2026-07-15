import Workspace from "../models/Workspace.js";
import Task from "../models/Task.js";

export const getMemberPerformanceData = async (user) => {
  const workspaces = await Workspace.find({
    $or: [
      { owner: user._id },
      { admins: user._id },
      { members: user._id },
    ],
  }).populate("members", "name email");

  const memberMap = new Map();

  workspaces.forEach((workspace) => {
    workspace.members.forEach((member) => {
      memberMap.set(member._id.toString(), member);
    });
  });

  const members = Array.from(memberMap.values());

  const result = await Promise.all(
    members.map(async (member) => {
      const assigned = await Task.countDocuments({
        workspace: { $in: workspaces.map((w) => w._id) },
        assignedTo: member._id,
      });

      const completed = await Task.countDocuments({
        workspace: { $in: workspaces.map((w) => w._id) },
        assignedTo: member._id,
        status: "completed",
      });

      const overdue = await Task.countDocuments({
        workspace: { $in: workspaces.map((w) => w._id) },
        assignedTo: member._id,
        status: { $ne: "completed" },
        dueDate: { $lt: new Date() },
      });

      return {
        id: member._id,
        name: member.name,
        email: member.email,
        assigned,
        completed,
        overdue,
        completion:
          assigned > 0
            ? Math.round((completed / assigned) * 100)
            : 0,
      };
    })
  );

  return result.sort((a, b) => b.completion - a.completion);
};