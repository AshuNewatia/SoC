import { ChartJSNodeCanvas } from "chartjs-node-canvas";

const width = 600;
const height = 400;

const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour: "white",
});

export async function generateTaskStatusChart(tasks) {
  const completed = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const progress = tasks.filter(
    (task) => task.status === "progress"
  ).length;

  const todo = tasks.filter(
    (task) => task.status === "todo"
  ).length;

  const configuration = {
    type: "pie",

    data: {
      labels: [
        "Completed",
        "In Progress",
        "Todo",
      ],

      datasets: [
        {
          data: [
            completed,
            progress,
            todo,
          ],

          backgroundColor: [
            "#22C55E",
            "#3B82F6",
            "#94A3B8",
          ],

          borderColor: "#FFFFFF",
          borderWidth: 2,
        },
      ],
    },

    options: {
      plugins: {
        title: {
          display: true,
          text: "Task Status Distribution",
          font: {
            size: 18,
          },
        },

        legend: {
          position: "bottom",
        },
      },
    },
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

export async function generatePriorityChart(tasks) {
  const priorities = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  tasks.forEach((task) => {
    const key = task.priority?.toLowerCase();

    if (priorities[key] !== undefined) {
      priorities[key]++;
    }
  });

  const configuration = {
    type: "bar",

    data: {
      labels: [
        "Low",
        "Medium",
        "High",
        "Critical",
      ],

      datasets: [
        {
          label: "Tasks",

          data: [
            priorities.low,
            priorities.medium,
            priorities.high,
            priorities.critical,
          ],

          backgroundColor: [
            "#22C55E",
            "#FACC15",
            "#FB923C",
            "#EF4444",
          ],
        },
      ],
    },

    options: {
      responsive: false,

      plugins: {
        title: {
          display: true,
          text: "Priority Distribution",
          font: {
            size: 18,
          },
        },

        legend: {
          display: false,
        },
      },

      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  };

  return chartJSNodeCanvas.renderToBuffer(configuration);
}