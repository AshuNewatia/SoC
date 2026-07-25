import Task from "../models/Task.js";
import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import axios from 'axios'

import { generateWorkspaceReportPDF } from "../services/pdf/workspaceReportPdf.js";
import { getWorkspaceReportData } from "../services/workspaceReportservice.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ======================================================
// HELPER 1: FIND WORKSPACE AND USER ROLE
// ======================================================
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

// ======================================================
// HELPER 2: CREATE TASK FILTER BASED ON ROLE
// ======================================================
const getTaskFilter = (workspaceId, userId, role) => {
  const filter = { workspace: workspaceId };
  if (role === "member") filter.assignedTo = userId;
  return filter;
};

// ======================================================
// HELPER 3: CREATE AGGREGATION FILTER
// ======================================================
const getAggregateFilter = (workspaceId, userId, role) => {
  const filter = { workspace: new mongoose.Types.ObjectId(workspaceId) };
  if (role === "member") filter.assignedTo = new mongoose.Types.ObjectId(userId);
  return filter;
};

// ======================================================
// 1. OVERVIEW
// GET /api/workspace-analytics/:workspaceId/overview
// ======================================================
export const getWorkspaceOverview = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id || req.user.id;
    const { workspace, role } = await getWorkspaceAccess(workspaceId, userId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    if (!role) {
      return res.status(403).json({ message: "You are not a member of this workspace" });
    }

    const taskFilter = getTaskFilter(workspaceId, userId, role);
    const now = new Date();

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

    return res.status(200).json({
      role,
      workspace: { id: workspace._id, name: workspace.name },
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      productivity,
    });
  } catch (error) {
    console.error("Workspace overview error:", error);
    return res.status(500).json({ message: "Failed to fetch workspace overview" });
  }
};

// ======================================================
// 2. TASK STATUS
// GET /api/workspace-analytics/:workspaceId/task-status
// ======================================================
export const getWorkspaceTaskStatus = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id || req.user.id;
    const { workspace, role } = await getWorkspaceAccess(workspaceId, userId);

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });
    if (!role) return res.status(403).json({ message: "Access denied" });

    const matchFilter = getAggregateFilter(workspaceId, userId, role);
    const data = await Task.aggregate([
      { $match: matchFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return res.status(200).json(data);
  } catch (error) {
    console.error("Task status analytics error:", error);
    return res.status(500).json({ message: "Failed to fetch task status analytics" });
  }
};

// ======================================================
// 3. PRIORITY DISTRIBUTION
// GET /api/workspace-analytics/:workspaceId/priority
// ======================================================
export const getWorkspacePriorityStats = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id || req.user.id;
    const { workspace, role } = await getWorkspaceAccess(workspaceId, userId);

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });
    if (!role) return res.status(403).json({ message: "Access denied" });

    const matchFilter = getAggregateFilter(workspaceId, userId, role);
    const data = await Task.aggregate([
      { $match: matchFilter },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    return res.status(200).json(data);
  } catch (error) {
    console.error("Priority analytics error:", error);
    return res.status(500).json({ message: "Failed to fetch priority analytics" });
  }
};

// ======================================================
// 4. COMPLETION TREND
// GET /api/workspace-analytics/:workspaceId/completion-trend
// ======================================================
export const getWorkspaceCompletionTrend = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id || req.user.id;
    const { workspace, role } = await getWorkspaceAccess(workspaceId, userId);

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });
    if (!role) return res.status(403).json({ message: "Access denied" });

    const matchFilter = getAggregateFilter(workspaceId, userId, role);
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

    return res.status(200).json(completionTrend);
  } catch (error) {
    console.error("Completion trend error:", error);
    return res.status(500).json({ message: "Failed to fetch completion trend" });
  }
};

// ======================================================
// 5. MEMBER PERFORMANCE
// OWNER + ADMIN ONLY
// GET /api/workspace-analytics/:workspaceId/member-performance
// ======================================================
export const getWorkspaceMemberPerformance = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "name email avatar")
      .populate("admins", "name email avatar")
      .populate("members", "name email avatar");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Combine owner + admins + members
    const workspaceUsers = [
      workspace.owner,
      ...workspace.admins,
      ...workspace.members,
    ];

    // Remove duplicates
    const uniqueUsers = Array.from(
      new Map(
        workspaceUsers.map((user) => [
          user._id.toString(),
          user,
        ])
      ).values()
    );

    const result = await Promise.all(
      uniqueUsers.map(async (user) => {
        const assigned = await Task.countDocuments({
          workspace: workspaceId,
          assignedTo: user._id,
        });

        const completed = await Task.countDocuments({
          workspace: workspaceId,
          assignedTo: user._id,
          status: "completed",
        });

        const overdue = await Task.countDocuments({
          workspace: workspaceId,
          assignedTo: user._id,
          status: {
            $ne: "completed",
          },
          dueDate: {
            $lt: new Date(),
          },
        });

        const completion =
          assigned > 0
            ? Math.round(
              (completed / assigned) * 100
            )
            : 0;

        return {
          id: user._id,
          name: user.name,
          avatar: user.avatar,
          assigned,
          completed,
          overdue,
          completion,
        };
      })
    );

    result.sort(
      (a, b) => b.completion - a.completion
    );

    return res.status(200).json(result);

  } catch (error) {
    console.error(
      "Workspace member performance error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch member performance",
    });
  }
};

// ======================================================
// 6. WORKLOAD DISTRIBUTION
// OWNER + ADMIN ONLY
// GET /api/workspace-analytics/:workspaceId/workload
// ======================================================
export const getWorkspaceWorkload = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id || req.user.id;
    const { workspace, role } = await getWorkspaceAccess(workspaceId, userId);

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });
    if (role !== "owner" && role !== "admin") {
      return res.status(403).json({ message: "Only owner and admins can view workload analytics" });
    }

    const workspaceUserIds = [workspace.owner, ...workspace.admins, ...workspace.members];
    const uniqueUserIds = [...new Set(workspaceUserIds.map((id) => id.toString()))];

    const users = await User.find({ _id: { $in: uniqueUserIds } }).select("name avatar");
    const activeTasks = await Task.find({
      workspace: workspaceId,
      status: { $ne: "completed" },
    }).select("assignedTo");

    const workload = users.map((user) => {
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
    return res.status(200).json(workload);
  } catch (error) {
    console.error("Workload analytics error:", error);
    return res.status(500).json({ message: "Failed to fetch workload analytics" });
  }
};

// ======================================================
// 7. INSIGHTS
// GET /api/workspace-analytics/:workspaceId/insights
// ======================================================
export const getWorkspaceInsights = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id || req.user.id;
    const { workspace, role } = await getWorkspaceAccess(workspaceId, userId);

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });
    if (!role) return res.status(403).json({ message: "Access denied" });

    const matchFilter = getAggregateFilter(workspaceId, userId, role);

    // Dominant Priority
    const priorityResult = await Task.aggregate([
      { $match: matchFilter },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const dominantPriority = priorityResult[0]?._id || "None";

    // Most Active Day
    const activeDayResult = await Task.aggregate([
      { $match: { ...matchFilter, status: "completed" } },
      { $group: { _id: { $dayOfWeek: "$updatedAt" }, completed: { $sum: 1 } } },
      { $sort: { completed: -1 } },
      { $limit: 1 },
    ]);
    const days = ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const mostActiveDay = days[activeDayResult[0]?._id] || "N/A";

    // Member Personal Insights
    if (role === "member") {
      const taskFilter = getTaskFilter(workspaceId, userId, role);
      const [totalTasks, completedTasks] = await Promise.all([
        Task.countDocuments(taskFilter),
        Task.countDocuments({ ...taskFilter, status: "completed" }),
      ]);
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return res.status(200).json({
        type: "personal",
        completionRate,
        mostActiveDay,
        dominantPriority,
      });
    }

    // Owner / Admin Team Insights
    const workspaceTasks = await Task.find({
      workspace: workspaceId,
      status: "completed",
    }).select("assignedTo");

    const completionCounts = {};
    for (const task of workspaceTasks) {
      for (const memberId of task.assignedTo) {
        const key = memberId.toString();
        completionCounts[key] = (completionCounts[key] || 0) + 1;
      }
    }

    let topUserId = null;
    let topCompleted = 0;
    for (const [id, count] of Object.entries(completionCounts)) {
      if (count > topCompleted) {
        topUserId = id;
        topCompleted = count;
      }
    }

    let topContributor = { name: "N/A", completed: 0 };
    if (topUserId) {
      const user = await User.findById(topUserId).select("name");
      if (user) topContributor = { name: user.name, completed: topCompleted };
    }

    return res.status(200).json({
      type: "team",
      topContributor,
      mostActiveDay,
      dominantPriority,
    });
  } catch (error) {
    console.error("Workspace insights error:", error);
    return res.status(500).json({ message: "Failed to fetch workspace insights" });
  }
};

// ======================================================
// 8. UPCOMING DEADLINES / RISK TASKS
// GET /api/workspace-analytics/:workspaceId/deadlines
// ======================================================
export const getWorkspaceDeadlines = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id || req.user.id;

    const { workspace, role } =
      await getWorkspaceAccess(workspaceId, userId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    if (!role) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const now = new Date();

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
      dueDate: {
        $ne: null,
        $lt: now,
      },
    })
      .select(
        "title priority status dueDate assignedTo"
      )
      .populate(
        "assignedTo",
        "name avatar"
      )
      .sort({ dueDate: 1 })
      .limit(5);


    const upcoming = await Task.find({
      ...baseFilter,
      dueDate: {
        $ne: null,
        $gte: now,
      },
    })
      .select(
        "title priority status dueDate assignedTo"
      )
      .populate(
        "assignedTo",
        "name avatar"
      )
      .sort({ dueDate: 1 })
      .limit(5);


    return res.status(200).json({
      type:
        role === "member"
          ? "personal"
          : "workspace",

      overdue,
      upcoming,
    });

  } catch (error) {
    console.error(
      "Deadline analytics error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch deadline analytics",
    });
  }
};

const escapeCSV = (value) => {
  const stringValue = String(value ?? "");
  const escapedValue = stringValue.replaceAll('"', '""');
  return `"${escapedValue}"`;
};


export const getWorkspaceGithubAnalytics = async (req, res) => {
  try {
    const repoPath = req.query.repo;
    if (!repoPath || repoPath === "undefined") {
      return res.status(400).json({ 
        success: false, 
        message: "No GitHub repository path was provided to the analytics engine." 
      });
    }

    const token = process.env.GITHUB_GLOBAL_TOKEN; 
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
 
    let totalCommits = 0;
    try {
      const commitRes = await axios.get(`https://api.github.com/repos/${repoPath}/commits?per_page=1`, { headers });
      const linkHeader = commitRes.headers.link;
      if (linkHeader) {
        const match = linkHeader.match(/&page=(\d+)[^>]*>;\s*rel="last"/);
        totalCommits = match ? parseInt(match[1], 10) : 1;
      } else {
        totalCommits = commitRes.data.length;
      }
    } catch (err) {
      console.error("Error fetching commits count:", err.message);
    }

    let openPRs = 0;
    try {
      const openPrRes = await axios.get(`https://api.github.com/repos/${repoPath}/pulls?state=open&per_page=1`, { headers });
      const linkHeader = openPrRes.headers.link;
      if (linkHeader) {
        const match = linkHeader.match(/&page=(\d+)[^>]*>;\s*rel="last"/);
        openPRs = match ? parseInt(match[1], 10) : 1;
      } else {
        openPRs = openPrRes.data.length;
      }
    } catch (err) {}

    let closedPRs = 0;
    try {
      const closedPrRes = await axios.get(`https://api.github.com/repos/${repoPath}/pulls?state=closed&per_page=1`, { headers });
      const linkHeader = closedPrRes.headers.link;
      if (linkHeader) {
        const match = linkHeader.match(/&page=(\d+)[^>]*>;\s*rel="last"/);
        closedPRs = match ? parseInt(match[1], 10) : 1;
      } else {
        closedPRs = closedPrRes.data.length;
      }
    } catch (err) {}
    return res.status(200).json({
      success: true,
      repository: repoPath,
      stats: {
        totalCommits,
        openPRs,
        closedPRs,
        totalPRs: openPRs + closedPRs
      }
    });

  } catch (error) {
    console.error("GitHub Analytics error:", error);
    return res.status(500).json({ message: "Failed to load repo statistics." });
  }
};

export const getCSVReport = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id || req.user.id;
    const workspaceName = Workspace.find({ _id: workspaceId}).name;

    const tasks = await Task.find({ workspace: workspaceId })
      .populate("assignedTo", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    const headers = [
      "Task title",
      "Description",
      "Status",
      "Priority",
      "Assignee names",
      "Created by",
      "Created date",
      "Due date",
      "Overdue",
      "GitHub issue number",
    ];

    const header = headers.map(escapeCSV).join(",");

    const rows = tasks.map((task) => {
      const title = task.title;
      const description = task.description || "";
      const status = task.status;
      const priority = task.priority;
      const assignedTo = task.assignedTo.map((user) => user.name).join(", ") || "Unassigned";
      const createdBy = task.createdBy?.name || "User";
      const createdAt = task.createdAt.toLocaleDateString("en-IN");
      const dueDate = task.dueDate ? task.dueDate.toLocaleDateString("en-IN") : "No due date";
      const overdue =
        task.dueDate && task.status !== "completed" && task.dueDate < new Date() ? "Yes" : "No";
      const githubIssueNumber = task.githubIssueNumber ? `#${task.githubIssueNumber}` : "Not linked";

      return [
        title,
        description,
        status,
        priority,
        assignedTo,
        createdBy,
        createdAt,
        dueDate,
        overdue,
        githubIssueNumber,
      ]
        .map(escapeCSV)
        .join(",");
    });

    const csvContent = [header, ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${workspaceName}-tasks.csv`);
    return res.send("\uFEFF" + csvContent);
  } catch (error) {
    console.error("CSV export error:", error);
    return res.status(500).json({ message: "Failed to generate CSV report" });
  }
};

export const getWorkspaceAnalyticsReport = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user._id || req.user.id;

        console.log('📊 Generating analytics report for workspace:', workspaceId);
        console.log('👤 User:', userId);

        // Get report data
        const report = await getWorkspaceReportData(workspaceId, userId);
        console.log('✅ Report data fetched');

        // Create PDF document
        const doc = new PDFDocument({
            size: "A4",
            margin: 40,
            bufferPages: true,
        });

        // Set response headers
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${report.workspace.name || 'workspace'}-report.pdf"`
        );

        // Pipe PDF to response
        doc.pipe(res);

        // Generate the PDF
        console.log('🔄 Generating PDF...');
        await generateWorkspaceReportPDF(doc, report);
        console.log('✅ PDF generation complete');

        // End the document
        doc.end();

        // Optional: Save PDF to disk for debugging
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(chunks);
            console.log('📄 PDF size:', pdfBuffer.length, 'bytes');
            
            // Save a copy for debugging (optional)
            const debugPath = path.join(__dirname, '../../debug-report.pdf');
            fs.writeFileSync(debugPath, pdfBuffer);
            console.log('💾 Debug PDF saved to:', debugPath);
        });

    } catch (error) {
        console.error('❌ Error generating report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate report',
            error: error.message
        });
    }
};