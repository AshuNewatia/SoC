import Workspace from "../models/Workspace.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import axios from "axios";

// ✅ FIXED: Now fetches workspace inside the function
const getWorkspaceAccess = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    return { workspace: null, role: null };
  }

  const isOwner = workspace.owner.toString() === userId.toString();
  const isAdmin = workspace.admins.some((adminId) => adminId.toString() === userId.toString());
  const isMember = workspace.members.some((memberId) => memberId.toString() === userId.toString());

  let role = null;
  if (isOwner) role = "owner";
  else if (isAdmin) role = "admin";
  else if (isMember) role = "member";

  return { workspace, role };
};

const getTaskFilter = (workspaceId, userId, role) => {
  const filter = { workspace: workspaceId };
  if (role === "member") filter.assignedTo = userId;
  return filter;
};

const getAggregateFilter = (workspaceId, userId, role) => {
  const filter = { workspace: new mongoose.Types.ObjectId(workspaceId) };
  if (role === "member") filter.assignedTo = new mongoose.Types.ObjectId(userId);
  return filter;
};

// MAIN
export const getWorkspaceReportData = async (workspaceId, userId) => {
  const now = new Date();
  const { workspace, role } = await getWorkspaceAccess(workspaceId, userId);

  if (!workspace) {
    throw new Error("Workspace not found"); 
  }

  if (!role) {
    throw new Error("Access denied");
  }

  // ✅ FIXED: Single populated workspace query (reuse everywhere)
  const populatedWorkspace = await Workspace.findById(workspaceId)
    .populate("owner", "name email")
    .populate("admins", "name email")
    .populate("members", "name email");

  if (!populatedWorkspace) {
    throw new Error("Workspace not found");
  }

  // KPI Overview
  const taskFilter = getTaskFilter(workspaceId, userId, role);

  const [totalTasks, completedTasks, pendingTasks, overdueTasks] = await Promise.all([
    Task.countDocuments(taskFilter),
    Task.countDocuments({ ...taskFilter, status: "completed" }),
    Task.countDocuments({ ...taskFilter, status: { $ne: "completed" } }),
    Task.countDocuments({
      ...taskFilter,
      status: { $ne: "completed" },
      dueDate: { $lt: now },
    }),
  ]);

  const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const kpis = {
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    productivity,
  };

  // Task Status Distribution
  const matchFilter = getAggregateFilter(workspaceId, userId, role);

  const taskStatus = await Task.aggregate([
    { $match: matchFilter },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Priority Distribution
  const priorityDistribution = await Task.aggregate([
    { $match: matchFilter },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
  ]);

  // Completion Trend (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const rawData = await Task.aggregate([
    {
      $match: {
        ...matchFilter,
        status: "completed",
        updatedAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
        completed: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const completionTrend = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    const existingDay = rawData.find((item) => item._id === dateKey);
    completionTrend.push({
      date: dateKey,
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      completed: existingDay?.completed || 0,
    });
  }

  //  DEADLINES
  const baseFilter = {
    workspace: workspaceId,
    status: { $ne: "completed" },
    dueDate: { $ne: null },
  };

  if (role === "member") {
    baseFilter.assignedTo = userId;
  }

  const overdue = await Task.find({
    ...baseFilter,
    dueDate: { $lt: now },
  })
    .select("title priority status dueDate assignedTo")
    .populate("assignedTo", "name avatar")
    .sort({ dueDate: 1 })
    .limit(5);

  const upcoming = await Task.find({
    ...baseFilter,
    dueDate: { $gte: now },
  })
    .select("title priority status dueDate assignedTo")
    .populate("assignedTo", "name avatar")
    .sort({ dueDate: 1 })
    .limit(5);

  const deadlines = {
    overdue,
    upcoming,
  };

  //  WORKLOAD 
  let workload = null;

  if (role === "owner" || role === "admin") {
    const workspaceUserIds = [
      populatedWorkspace.owner._id,
      ...populatedWorkspace.admins.map((a) => a._id),
      ...populatedWorkspace.members.map((m) => m._id),
    ];

    const uniqueUserIds = [...new Set(workspaceUserIds.map((id) => id.toString()))];

    const users = await User.find({ _id: { $in: uniqueUserIds } }).select("name avatar");
    const activeTasks = await Task.find({
      workspace: workspaceId,
      status: { $ne: "completed" },
    }).select("assignedTo");

    workload = users.map((user) => {
      const activeTaskCount = activeTasks.filter((task) =>
        task.assignedTo.some((memberId) => memberId.toString() === user._id.toString())
      ).length;
      return {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        activeTasks: activeTaskCount,
      };
    });

    workload.sort((a, b) => b.activeTasks - a.activeTasks);
  }

  // MEMBER PERFORMANCE
  let memberPerformance = null;

  if (role === "owner" || role === "admin") {
    const workspaceUserIds = [
      populatedWorkspace.owner._id,
      ...populatedWorkspace.admins.map((a) => a._id),
      ...populatedWorkspace.members.map((m) => m._id),
    ];

    const uniqueUserIds = [...new Set(workspaceUserIds.map((id) => id.toString()))];

    const users = await User.find({ _id: { $in: uniqueUserIds } }).select("name avatar");

    memberPerformance = await Promise.all(
      users.map(async (user) => {
        const assigned = await Task.countDocuments({
          workspace: workspaceId,
          assignedTo: user._id,
        });

        const completed = await Task.countDocuments({
          workspace: workspaceId,
          assignedTo: user._id,
          status: "completed",
        });

        const overdueCount = await Task.countDocuments({
          workspace: workspaceId,
          assignedTo: user._id,
          status: { $ne: "completed" },
          dueDate: { $lt: new Date() },
        });

        const completion = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

        return {
          id: user._id,
          name: user.name,
          avatar: user.avatar,
          assigned,
          completed,
          overdue: overdueCount,
          completion,
        };
      })
    );

    memberPerformance.sort((a, b) => b.completion - a.completion);
  }

  //  GITHUB ANALYTICS 
  let githubAnalytics = null;

  // 🔥 IMPORTANT: Replace 'githubRepo' with your actual field name from the Workspace model
  const repoPath = populatedWorkspace.githubRepo;

  if (repoPath && repoPath !== "undefined") {
    const token = process.env.GITHUB_GLOBAL_TOKEN;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    let totalCommits = 0;
    let openPRs = 0;
    let closedPRs = 0;


    try {
      const commitRes = await axios.get(
        `https://api.github.com/repos/${repoPath}/commits?per_page=1`,
        { headers }
      );

      const linkHeader = commitRes.headers.link;
      if (linkHeader) {
        const match = linkHeader.match(/&page=(\d+)[^>]*>;\s*rel="last"/);
        totalCommits = match ? parseInt(match[1], 10) : commitRes.data.length;
      } else {
        totalCommits = commitRes.data.length;
      }
    } catch (err) {
      console.error("Commit analytics error:", err.message);
    }

    // Fetch open PRs
    try {
      const openPrRes = await axios.get(
        `https://api.github.com/repos/${repoPath}/pulls?state=open&per_page=1`,
        { headers }
      );

      const linkHeader = openPrRes.headers.link;
      if (linkHeader) {
        const match = linkHeader.match(/&page=(\d+)[^>]*>;\s*rel="last"/);
        openPRs = match ? parseInt(match[1], 10) : openPrRes.data.length;
      } else {
        openPRs = openPrRes.data.length;
      }
    } catch (err) {
      console.error("Open PR analytics error:", err.message);
    }

    // Fetch closed PRs
    try {
      const closedPrRes = await axios.get(
        `https://api.github.com/repos/${repoPath}/pulls?state=closed&per_page=1`,
        { headers }
      );

      const linkHeader = closedPrRes.headers.link;
      if (linkHeader) {
        const match = linkHeader.match(/&page=(\d+)[^>]*>;\s*rel="last"/);
        closedPRs = match ? parseInt(match[1], 10) : closedPrRes.data.length;
      } else {
        closedPRs = closedPrRes.data.length;
      }
    } catch (err) {
      console.error("Closed PR analytics error:", err.message);
    }

    githubAnalytics = {
      repository: repoPath,
      totalCommits,
      openPRs,
      closedPRs,
      totalPRs: openPRs + closedPRs,
    };
  }

  return {
    workspace: populatedWorkspace,
    kpis,
    taskStatus,
    priorityDistribution,
    completionTrend,
    deadlines,
    workload,
    memberPerformance,
    githubAnalytics,
  };
};