import React, { useEffect, useState } from "react";
import { getPriorityStats } from "../../services/analyticsService";

const COLORS = {
  High: "bg-red-500",
  Medium: "bg-blue-500",
  Low: "bg-green-500",
};

const DOTS = {
  High: "bg-red-500",
  Medium: "bg-blue-500",
  Low: "bg-green-500",
};

export default function PriorityChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchPriorityData = async () => {
      try {
        const { data } = await getPriorityStats();

        const sorted = [...data].sort((a, b) => {
          const order = {
            High: 1,
            Medium: 2,
            Low: 3,
          };

          return order[a._id] - order[b._id];
        });

        setData(sorted);
      } catch (error) {
        console.error(
          "Failed to fetch priority analytics",
          error
        );
      }
    };

    fetchPriorityData();
  }, []);

  const totalTasks = data.reduce(
    (sum, item) => sum + item.count,
    0
  );

if (!data.length) {
  return (
    <div className="bg-surface rounded-2xl border p-6">
      <div className="h-[300px] flex items-center justify-center">
        No priority data available
      </div>
    </div>
  );
}

  return (
    <div className="bg-surface rounded-2xl border border-border-light shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Priority Distribution
          </h2>

          <p className="text-sm text-text-secondary mt-1">
            Breakdown of tasks by priority level
          </p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold text-text-primary">
            {totalTasks}
          </p>

          <p className="text-sm text-text-secondary">
            Total Tasks
          </p>
        </div>
      </div>

      {/* Priority List */}
      <div className="space-y-6">
        {data.map((item) => {
          const percentage =
            totalTasks > 0
              ? Math.round(
                  (item.count / totalTasks) * 100
                )
              : 0;

          return (
            <div key={item._id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      DOTS[item._id]
                    }`}
                  />

                  <span className="font-medium text-text-primary">
                    {item._id}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary">
                    {percentage}%
                  </span>

                  <span className="font-semibold text-text-primary min-w-[24px] text-right">
                    {item.count}
                  </span>
                </div>
              </div>

              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    COLORS[item._id]
                  }`}
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mt-8">
        {data.map((item) => (
          <div
            key={item._id}
            className="rounded-xl border border-border-light p-4 text-center"
          >
            <p className="text-sm text-text-secondary">
              {item._id}
            </p>

            <p className="mt-1 text-xl font-bold text-text-primary">
              {item.count}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}