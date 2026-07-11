import Task from "../models/Task.js";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import { getTaskFilter } from "../utils/analyticsFilter.js";
import Workspace from "../models/Workspace.js";

import PDFDocument from "pdfkit";


export const getOverview = async (req, res) => {
  try {
    const filter = await getTaskFilter(req.user);

    console.log("User:", req.user.name);
    console.log("Role:", req.user.role);
    console.log("User ID:", req.user._id);

    const totalTasks = await Task.countDocuments(filter);
    const priorityStats = await Task.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      }
    ]);

    const taskStatus = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "completed",
    });

    const pendingTasks = await Task.countDocuments({
      ...filter,
      status: { $ne: "completed" },
    });

    // Count overdue tasks
    const overdueTasks = await Task.countDocuments({
      ...filter,
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" },
    });

    const productivity =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    let totalUsers = 0;

    if (req.user.role === "professor") {
      totalUsers = await User.countDocuments();
    }

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      productivity,
      totalUsers,
    });
  } catch (error) {
    console.error("Overview Error:", error);
    res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};

export const getTaskStatus = async (req, res) => {
  try {
    const filter = await getTaskFilter(req.user);

    const data = await Task.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPriorityStats = async (req, res) => {
  try {
    const filter = await getTaskFilter(req.user);

    const data = await Task.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMemberPerformance = async (req, res) => {
  try {
    // Students should not access team analytics
    if (req.user.role === "student") {
      return res.status(403).json({
        message: "Students are not allowed to view member performance.",
      });
    }

    // Find workspaces where the professor is owner/admin/member
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user._id },
        { admins: req.user._id },
        { members: req.user._id },
      ],
    }).populate("members", "name email");

    // Collect unique members
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
              ? Math.round(
                (completed / assigned) * 100
              )
              : 0,
        };
      })
    );

    result.sort((a, b) => b.completion - a.completion);

    res.json(result);
  } catch (error) {
    console.error("Member Performance Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProductivity = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const filter = await getTaskFilter(req.user);

    const data = await Task.aggregate([
      {
        $match: {
          ...filter,
          status: "completed",
          updatedAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$updatedAt",
            },
          },
          completed: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getGithubAnalytics = async (req, res) => {
  try {
    res.json({
      commits: 148,
      pullRequests: 32,
      mergedPRs: 26,
      branches: 12,
      contributionScore: 82,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getInsights = async (req, res) => {
  try {
    const filter = await getTaskFilter(req.user);

    let completionRate = 0;

    if (req.user.role === "student") {
      const assignedTasks = await Task.countDocuments(filter);

      const completedTasks = await Task.countDocuments({
        ...filter,
        status: "completed",
      });

      completionRate =
        assignedTasks > 0
          ? Math.round((completedTasks / assignedTasks) * 100)
          : 0;
    }

    let topPerformer = null;

    // Professors can see top performer
    if (req.user.role === "professor") {
      const users = await User.find().select("name");

      for (const user of users) {
        const completed = await Task.countDocuments({
          ...filter,
          assignedTo: user._id,
          status: "completed",
        });

        if (
          !topPerformer ||
          completed > topPerformer.completed
        ) {
          topPerformer = {
            name: user.name,
            completed,
          };
        }
      }
    }

    // Dominant Priority
    const priorities = await Task.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 1,
      },
    ]);

    const dominantPriority =
      priorities.length > 0
        ? priorities[0]._id
        : "N/A";

    // Most Active Day
    const trend = await Task.aggregate([
      {
        $match: {
          ...filter,
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            $dayOfWeek: "$updatedAt",
          },
          completed: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          completed: -1,
        },
      },
      {
        $limit: 1,
      },
    ]);

    const days = [
      "",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    res.json({
      topPerformer,
      completionRate,
      dominantPriority,
      mostActiveDay:
        trend.length > 0
          ? days[trend[0]._id]
          : "N/A",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProductivityPercentage = async (req, res) => {
  try {
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const filter = await getTaskFilter(req.user);

      const assigned = await Task.countDocuments({
        ...filter,
        createdAt: {
          $gte: start,
          $lte: end,
        },
      });

      const completed = await Task.countDocuments({
        ...filter,
        status: "completed",
        updatedAt: {
          $gte: start,
          $lte: end,
        },
      });

      const productivity =
        assigned > 0
          ? Math.round((completed / assigned) * 100)
          : 0;

      last7Days.push({
        day: start.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        productivity,
      });
    }

    res.json(last7Days);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

function drawCard(doc, x, y, width, height, title, value, color) {
  // Card Background
  doc
    .roundedRect(x, y, width, height, 10)
    .fillAndStroke("#F8FAFC", "#E5E7EB");

  // Colored top border
  doc
    .lineWidth(4)
    .strokeColor(color)
    .moveTo(x, y)
    .lineTo(x + width, y)
    .stroke();

  // Title
  doc
    .fillColor("#6B7280")
    .fontSize(11)
    .text(title, x + 15, y + 15);

  // Value
  doc
    .fillColor("#111827")
    .font("Helvetica-Bold")
    .fontSize(24)
    .text(value, x + 15, y + 38);

  doc.font("Helvetica");
}

export const exportAnalyticsReport = async (req, res) => {
  try {
    const filter = await getTaskFilter(req.user);

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name")
      .populate("workspace", "name");

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.status === "completed"
    ).length;

    const pendingTasks = totalTasks - completedTasks;

    const productivity =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${req.user.role}-analytics-report.pdf`
    );

    doc.pipe(res);

    // HEADER
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("CampusFlow Analytics Report", {
        align: "center",
      });

    doc.moveDown();

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Generated For : ${req.user.name}`);

    doc.text(`Role : ${req.user.role}`);

    doc.text(
      `Generated On : ${new Date().toLocaleString()}`
    );

    doc.moveDown();

    // SUMMARY
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Summary");

    doc.moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Total Tasks : ${totalTasks}`);

    doc.text(`Completed Tasks : ${completedTasks}`);

    doc.text(`Pending Tasks : ${pendingTasks}`);

    doc.text(`Productivity : ${productivity}%`);

    doc.moveDown();

    // TASK LIST
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Task Details");

    doc.moveDown(0.5);

    tasks.forEach((task, index) => {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`${index + 1}. ${task.title}`);

      doc
        .font("Helvetica")
        .fontSize(10)
        .text(
          `Assigned To : ${task.assignedTo?.length
            ? task.assignedTo
              .map((u) => u.name)
              .join(", ")
            : "Unassigned"
          }`
        );

      doc.text(
        `Workspace : ${task.workspace?.name || "N/A"
        }`
      );

      doc.text(`Priority : ${task.priority}`);

      doc.text(`Status : ${task.status}`);

      doc.text(
        `Due Date : ${task.dueDate
          ? new Date(task.dueDate).toLocaleDateString()
          : "N/A"
        }`
      );

      doc.moveDown();
    });

    // FOOTER
    doc.moveDown();

    doc
      .fontSize(10)
      .fillColor("gray")
      .text(
        "Generated automatically by CampusFlow",
        {
          align: "center",
        }
      );

    doc.end();
  } catch (error) {
    console.error("Export PDF Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const escapeCSV = (value) => {
  const stringValue = String(value ?? "");
  const escapedValue = stringValue.replaceAll('"', '""');

  return `"${escapedValue}"`;
};

export const getCSVReport = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name")
      .populate("createdBy", "name")
      .populate("workspace", "name");

    tasks.sort((a, b) => {
      const workspaceA = a.workspace?.name || "";
      const workspaceB = b.workspace?.name || "";

      const workspaceComparison =
        workspaceA.localeCompare(workspaceB);

      if (workspaceComparison !== 0) {
        return workspaceComparison;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const headers = [
      "Workspace",
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

    const header = headers
      .map(escapeCSV)
      .join(",");

    const rows = tasks.map((task) => {
      const workspace =
        task.workspace?.name || "Unknown Workspace";

      const title =
        task.title || "";

      const description =
        task.description || "";

      const status =
        task.status || "";

      const priority =
        task.priority || "";

      const assignedTo =
        task.assignedTo
          ?.filter(Boolean)
          .map((user) => user.name)
          .join(", ") || "Unassigned";

      const createdBy =
        task.createdBy?.name || "Unknown User";

      const createdAt = task.createdAt
        ? new Date(task.createdAt)
            .toLocaleDateString("en-IN")
        : "";

      const dueDate = task.dueDate
        ? new Date(task.dueDate)
            .toLocaleDateString("en-IN")
        : "No due date";

      const overdue =
        task.dueDate &&
        task.status !== "completed" &&
        new Date(task.dueDate) < new Date()
          ? "Yes"
          : "No";

      const githubIssueNumber =
        task.githubIssueNumber
          ? `#${task.githubIssueNumber}`
          : "Not linked";

      return [
        workspace,
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

    const csvContent =
      [header, ...rows].join("\n");

    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="tasks.csv"'
    );

    return res.send("\uFEFF" + csvContent);

  } catch (error) {
    console.error("CSV export error:", error);

    return res.status(500).json({
      message: "Failed to generate CSV report",
    });
  }
};
