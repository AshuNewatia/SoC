import Task from "../models/Task.js";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import { getTaskFilter } from "../utils/analyticsFilter.js";
import Workspace from "../models/Workspace.js";

import PDFDocument from "pdfkit";
import {
  generateTaskStatusChart,
  generatePriorityChart,
} from "../utils/pdfCharts.js";
import { getMemberPerformanceData } from "../utils/memberPerformanceData.js";


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
    if (req.user.role === "student") {
      return res.status(403).json({
        message: "Students are not allowed to view member performance.",
      });
    }

    const result = await getMemberPerformanceData(req.user);

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// export const getMemberPerformance = async (req, res) => {
//   try {
//     // Students should not access team analytics
//     if (req.user.role === "student") {
//       return res.status(403).json({
//         message: "Students are not allowed to view member performance.",
//       });
//     }

//     // Find workspaces where the professor is owner/admin/member
//     const workspaces = await Workspace.find({
//       $or: [
//         { owner: req.user._id },
//         { admins: req.user._id },
//         { members: req.user._id },
//       ],
//     }).populate("members", "name email");

//     // Collect unique members
//     const memberMap = new Map();

//     workspaces.forEach((workspace) => {
//       workspace.members.forEach((member) => {
//         memberMap.set(member._id.toString(), member);
//       });
//     });

//     const members = Array.from(memberMap.values());

//     const result = await Promise.all(
//       members.map(async (member) => {
//         const assigned = await Task.countDocuments({
//           workspace: { $in: workspaces.map((w) => w._id) },
//           assignedTo: member._id,
//         });

//         const completed = await Task.countDocuments({
//           workspace: { $in: workspaces.map((w) => w._id) },
//           assignedTo: member._id,
//           status: "completed",
//         });

//         const overdue = await Task.countDocuments({
//           workspace: { $in: workspaces.map((w) => w._id) },
//           assignedTo: member._id,
//           status: { $ne: "completed" },
//           dueDate: { $lt: new Date() },
//         });

//         return {
//           id: member._id,
//           name: member.name,
//           email: member.email,
//           assigned,
//           completed,
//           overdue,
//           completion:
//             assigned > 0
//               ? Math.round(
//                 (completed / assigned) * 100
//               )
//               : 0,
//         };
//       })
//     );

//     result.sort((a, b) => b.completion - a.completion);

//     res.json(result);
//   } catch (error) {
//     console.error("Member Performance Error:", error);

//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

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

// Analytics Report Generator (PDFKit)

const PAGE = { marginX: 40, contentWidth: 515, rightEdge: 555 };

const COLORS = {
  primary: "#2563EB",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  textDark: "#111827",
  textMuted: "#6B7280",
  textBody: "#374151",
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",
  surface: "#F9FAFB",
  surfaceAlt: "#F8FAFC",
  white: "#FFFFFF",
  footer: "gray",
};

const TASK_COLUMNS = [
  { key: "#", x: 48, dataX: 48, width: 20 },
  { key: "Task", x: 70, dataX: 70, width: 140 },
  { key: "Workspace", x: 220, dataX: 220, width: 90 },
  { key: "Priority", x: 320, dataX: 320, width: 70 },
  { key: "Status", x: 405, dataX: 405, width: 70 },
  { key: "Due", x: 485, dataX: 485, width: 60 },
];

const MEMBER_COLUMNS = [
  { key: "Member", headerX: 55, dataX: 55 },
  { key: "Assigned", headerX: 230, dataX: 245 },
  { key: "Completed", headerX: 315, dataX: 335 },
  { key: "Completion", headerX: 415, dataX: 435 },
  { key: "Overdue", headerX: 505, dataX: 520 },
];

// Style helpers

function setStyle(doc, { font = "Helvetica", size = 10, color = COLORS.textDark } = {}) {
  doc.font(font).fontSize(size).fillColor(color);
  return doc;
}

function panel(doc, x, y, width, height, radius, fill, stroke) {
  const rect = doc.roundedRect(x, y, width, height, radius);
  if (stroke) rect.fillAndStroke(fill, stroke);
  else rect.fill(fill);
}

// Drawing helpers
function drawCard(doc, x, y, width, height, title, value, accentColor) {
  const { x: originX, y: originY } = doc;

  panel(doc, x, y, width, height, 10, COLORS.surfaceAlt, COLORS.border);

  doc
    .lineWidth(4)
    .strokeColor(accentColor)
    .moveTo(x, y)
    .lineTo(x + width, y)
    .stroke();

  setStyle(doc, { size: 11, color: COLORS.textMuted }).text(title, x + 15, y + 15, {
    width: width - 30,
    lineBreak: false,
  });

  setStyle(doc, { font: "Helvetica-Bold", size: 24, color: COLORS.textDark }).text(
    String(value),
    x + 15,
    y + 38,
    { width: width - 30, lineBreak: false }
  );

  doc.x = originX;
  doc.y = originY;
  setStyle(doc);
}

function drawTableHeader(doc, y) {
  panel(doc, PAGE.marginX, y, PAGE.contentWidth, 25, 4, COLORS.primary);

  setStyle(doc, { font: "Helvetica-Bold", size: 10, color: COLORS.white });
  TASK_COLUMNS.forEach((col) => doc.text(col.key, col.x, y + 8));
  setStyle(doc);
}

function drawTableRow(doc, y, task, index) {
  const bg = index % 2 === 0 ? COLORS.white : COLORS.surface;
  panel(doc, PAGE.marginX, y, PAGE.contentWidth, 24, 2, bg);

  setStyle(doc, { size: 9, color: COLORS.textDark });

  const cells = [
    String(index + 1),
    task.title,
    task.workspace?.name || "-",
    task.priority || "-",
    task.status || "-",
    task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-",
  ];

  cells.forEach((value, i) => {
    const col = TASK_COLUMNS[i];
    doc.text(value, col.dataX, y + 7, { width: col.width, ellipsis: true });
  });
}

function drawInsight(doc, x, y, title, value) {
  panel(doc, x, y, 240, 42, 6, COLORS.surface, COLORS.border);

  setStyle(doc, { size: 10, color: COLORS.textMuted }).text(title, x + 12, y + 8);
  setStyle(doc, { font: "Helvetica-Bold", size: 13, color: COLORS.textDark }).text(
    value,
    x + 12,
    y + 22
  );
  setStyle(doc);
}

function drawMemberTableHeader(doc, y) {
  panel(doc, PAGE.marginX, y, PAGE.contentWidth, 30, 4, COLORS.primary);

  setStyle(doc, { font: "Helvetica-Bold", size: 10, color: COLORS.white });
  MEMBER_COLUMNS.forEach((col) => doc.text(col.key, col.headerX, y + 9));
  setStyle(doc);
}

function drawMemberTableRow(doc, y, member, index) {
  const bg = index % 2 === 0 ? COLORS.white : COLORS.surface;
  panel(doc, PAGE.marginX, y, PAGE.contentWidth, 28, 2, bg);

  setStyle(doc, { size: 9, color: COLORS.textDark });

  const values = [
    member.name,
    member.assigned.toString(),
    member.completed.toString(),
    `${member.completion}%`,
    member.overdue.toString(),
  ];

  values.forEach((value, i) => doc.text(value, MEMBER_COLUMNS[i].dataX, y + 9));
}

// Data aggregation
function computeTaskMetrics(tasks) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = totalTasks - completedTasks;

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && t.status !== "completed" && new Date(t.dueDate) < new Date()
  ).length;

  const priorityCounts = {
    critical: tasks.filter((t) => t.priority === "critical").length,
    high: tasks.filter((t) => t.priority === "high").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    low: tasks.filter((t) => t.priority === "low").length,
  };

  const dominantPriority = Object.entries(priorityCounts)
    .sort(([, a], [, b]) => b - a)[0][0];

  const workspaceIds = new Set(
    tasks.filter((t) => t.workspace).map((t) => t.workspace._id.toString())
  );
  const workspaceCount = workspaceIds.size;

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    productivity: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    dominantPriority: dominantPriority.charAt(0).toUpperCase() + dominantPriority.slice(1),
    workspaceCount,
    averageTasksPerWorkspace:
      workspaceCount > 0 ? (totalTasks / workspaceCount).toFixed(1) : 0,
  };
}

function renderHeader(doc) {
  setStyle(doc, { font: "Helvetica-Bold", size: 28, color: COLORS.primary }).text(
    "CampusFlow",
    { align: "center" }
  );
  setStyle(doc, { size: 18, color: COLORS.textBody }).text("Analytics Report", {
    align: "center",
  });
  doc.moveDown(1.2);
}

function renderInfoBox(doc, user) {
  const boxY = doc.y;
  panel(doc, PAGE.marginX, boxY, PAGE.contentWidth, 70, 10, COLORS.surface, COLORS.border);

  const reportId = `CF-${Date.now().toString().slice(-6)}`;
  const fields = [
    ["Generated For", user.name, 60, 170],
    ["Role", user.role, 60, 170],
    ["Generated On", new Date().toLocaleString(), 320, 420],
    ["Report ID", reportId, 320, 420],
  ];

  fields.forEach(([label, value, labelX, valueX], i) => {
    const rowY = boxY + (i % 2 === 0 ? 15 : 38);
    setStyle(doc, { font: "Helvetica-Bold", size: 12, color: COLORS.textDark }).text(
      label,
      labelX,
      rowY
    );
    setStyle(doc, { color: COLORS.textDark }).text(value, valueX, rowY);
  });

  doc.y = boxY + 95;
}

function renderExecutiveSummary(doc, metrics) {
  const summaryY = doc.y;

  doc
    .strokeColor(COLORS.borderStrong)
    .lineWidth(1)
    .moveTo(PAGE.marginX, summaryY - 10)
    .lineTo(PAGE.rightEdge, summaryY - 10)
    .stroke();

  setStyle(doc, { font: "Helvetica-Bold", size: 18, color: COLORS.textDark }).text(
    "Executive Summary",
    PAGE.marginX,
    summaryY
  );

  const cardY = summaryY + 30;
  const cards = [
    ["Total Tasks", metrics.totalTasks, COLORS.primary],
    ["Completed", metrics.completedTasks, COLORS.success],
    ["Pending", metrics.pendingTasks, COLORS.warning],
    ["Overdue", metrics.overdueTasks, COLORS.danger],
  ];

  cards.forEach(([title, value, color], i) => {
    drawCard(doc, PAGE.marginX + i * 130, cardY, 118, 80, title, value, color);
  });

  doc.x = PAGE.marginX;
  doc.y = cardY + 100;

  doc
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .moveTo(PAGE.marginX, doc.y)
    .lineTo(PAGE.rightEdge, doc.y)
    .stroke();

  doc.moveDown(1.5);
}

function renderTaskTable(doc, tasks) {
  doc.moveDown();
  setStyle(doc, { font: "Helvetica-Bold", size: 18, color: COLORS.textDark }).text(
    "Task Details",
    PAGE.marginX
  );
  doc.moveDown();

  let rowY = doc.y;
  drawTableHeader(doc, rowY);
  rowY += 30;

  tasks.forEach((task, index) => {
    if (rowY > 720) {
      doc.addPage();
      rowY = 50;
      drawTableHeader(doc, rowY);
      rowY += 30;
    }
    drawTableRow(doc, rowY, task, index);
    rowY += 26;
  });

  doc.y = rowY + 20;
}

async function renderChartsAndInsights(doc, tasks, metrics) {
  const [statusChart, priorityChart] = await Promise.all([
    generateTaskStatusChart(tasks),
    generatePriorityChart(tasks),
  ]);

  doc.addPage();

  setStyle(doc, { font: "Helvetica-Bold", size: 22, color: COLORS.textDark }).text(
    "Analytics Charts",
    { align: "center" }
  );
  doc.moveDown(2);

  doc.image(statusChart, 40, doc.y, { width: 240 });
  doc.image(priorityChart, 310, doc.y, { width: 240 });
  doc.moveDown(8);

  setStyle(doc, { font: "Helvetica-Bold", size: 18, color: COLORS.textDark }).text(
    "Executive Insights"
  );
  doc.moveDown(1);

  const insightY = doc.y;
  const leftColumn = [
    ["Completion Rate", `${metrics.productivity}%`],
    ["Pending Tasks", metrics.pendingTasks.toString()],
    ["Workspaces", metrics.workspaceCount.toString()],
  ];
  const rightColumn = [
    ["Dominant Priority", metrics.dominantPriority],
    ["Average Tasks / Workspace", metrics.averageTasksPerWorkspace],
    ["Report Generated By", "CampusFlow"],
  ];

  leftColumn.forEach(([title, value], i) =>
    drawInsight(doc, 40, insightY + i * 55, title, value)
  );
  rightColumn.forEach(([title, value], i) =>
    drawInsight(doc, 300, insightY + i * 55, title, value)
  );
}

function renderTeamPerformance(doc, memberPerformance) {
  doc.addPage();

  setStyle(doc, { font: "Helvetica-Bold", size: 22, color: COLORS.textDark }).text(
    "Team Performance"
  );
  doc.moveDown(1.5);

  drawMemberTableHeader(doc, doc.y);
  let rowY = doc.y + 30;

  memberPerformance.forEach((member, index) => {
    drawMemberTableRow(doc, rowY, member, index);
    rowY += 28;
  });
}

export const exportAnalyticsReport = async (req, res) => {
  try {
    const filter = await getTaskFilter(req.user);

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name")
      .populate("workspace", "name");

    const metrics = computeTaskMetrics(tasks);

    const memberPerformance =
      req.user.role === "professor" ? await getMemberPerformanceData(req.user) : [];

    const doc = new PDFDocument({ margin: PAGE.marginX, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${req.user.role}-analytics-report.pdf`
    );
    doc.pipe(res);

    renderHeader(doc);
    renderInfoBox(doc, req.user);
    renderExecutiveSummary(doc, metrics);
    renderTaskTable(doc, tasks);
    await renderChartsAndInsights(doc, tasks, metrics);

    if (req.user.role === "professor") {
      renderTeamPerformance(doc, memberPerformance);
    }

    doc.end();
  } catch (error) {
    console.error("Export PDF Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const escapeCSV = (value) => {
  const stringValue = String(value ?? "");
  const escapedValue = stringValue.replaceAll('"', '""');

  return `"${escapedValue}"`;
};

export const getCSVReport = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const tasks = await Task.find({
      assignedTo: userId,
    })
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
