import Task from "../models/Task.js";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";

export const getOverview = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();

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
      status: "completed",
    });

    const pendingTasks = await Task.countDocuments({
      status: { $ne: "completed" },
    });

    const totalUsers = await User.countDocuments();

    const productivity =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      totalUsers,
      productivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskStatus = async (req, res) => {
  try {
    const data = await Task.aggregate([
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
    const data = await Task.aggregate([
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
    const users = await User.find().select("name");

    const result = await Promise.all(
      users.map(async (user) => {
        const assigned = await Task.countDocuments({
          assignedTo: user._id,
        });

        const completed = await Task.countDocuments({
          assignedTo: user._id,
          status: "completed",
        });

        const overdue = await Task.countDocuments({
          assignedTo: user._id,
          status: { $ne: "completed" },
          dueDate: { $lt: new Date() },
        });

        return {
          id: user._id,
          name: user.name,
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

    res.json(
      result.sort(
        (a, b) => b.completion - a.completion
      )
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProductivity = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const data = await Task.aggregate([
      {
        $match: {
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
    // Top performer
    const users = await User.find();

    let topPerformer = {
      name: "N/A",
      completed: 0,
    };

    for (const user of users) {
      const completed = await Task.countDocuments({
        assignedTo: user._id,
        status: "completed",
      });

      if (completed > topPerformer.completed) {
        topPerformer = {
          name: user.name,
          completed,
        };
      }
    }

    // Priority distribution
    const priorities = await Task.aggregate([
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
      priorities[0]?._id || "None";

    // Completed tasks by day
    const trend = await Task.aggregate([
      {
        $match: {
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
      dominantPriority,
      mostActiveDay:
        days[trend[0]?._id] || "N/A",
    });
  } catch (error) {
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

      const assigned = await Task.countDocuments({
        createdAt: {
          $gte: start,
          $lte: end,
        },
      });

      const completed = await Task.countDocuments({
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