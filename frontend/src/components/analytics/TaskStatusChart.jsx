import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { getTaskStatus } from "../../services/analyticsService";

const COLORS = {
  completed: "#22C55E",
  progress: "#3B82F6",
  todo: "#94A3B8",
};

export default function TaskStatusChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchTaskStatus = async () => {
      try {
        const { data } = await getTaskStatus();

        const formatted = data.map((item) => ({
          name:
            item._id === "completed"
              ? "Completed"
              : item._id === "progress"
              ? "In Progress"
              : "To Do",
          value: item.count,
          color: COLORS[item._id],
        }));

        setData(formatted);
      } catch (error) {
        console.error(
          "Failed to fetch task status analytics",
          error
        );
      }
    };

    fetchTaskStatus();
  }, []);

  const total = data.reduce(
    (sum, item) => sum + item.value,
    0
  );

if (!data.length) {
  return (
    <div className="bg-surface rounded-2xl border p-6">
      <div className="h-[300px] flex items-center justify-center text-text-secondary">
        No task data available
      </div>
    </div>
  );
}

  return (
    <div className="bg-surface rounded-2xl border border-border-light shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text-primary">
          Task Status
        </h2>

        <p className="text-sm text-text-secondary mt-1">
          Current task distribution
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="relative h-[240px] w-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />

              <Pie
                data={data}
                innerRadius={70}
                outerRadius={95}
                dataKey="value"
                paddingAngle={4}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-text-primary">
              {total}
            </span>

            <span className="text-sm text-text-secondary">
              Tasks
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-5 w-full">
          {data.map((item) => {
            const percentage =
              total > 0
                ? Math.round(
                    (item.value / total) * 100
                  )
                : 0;

            return (
              <div key={item.name}>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: item.color,
                      }}
                    />

                    <span className="font-medium text-text-primary">
                      {item.name}
                    </span>
                  </div>

                  <span className="font-semibold text-text-primary">
                    {item.value}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${percentage}%`,
                      background: item.color,
                    }}
                  />
                </div>

                <div className="mt-1 text-right text-xs text-text-secondary">
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}