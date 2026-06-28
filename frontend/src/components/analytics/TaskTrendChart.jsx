import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getProductivity } from "../../services/analyticsService";

export default function TaskTrendChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        const { data } = await getProductivity();

        const formatted = data.map((item) => ({
          day: new Date(item._id).toLocaleDateString(
            "en-US",
            {
              weekday: "short",
            }
          ),
          completed: item.completed,
        }));

        setData(formatted);
      } catch (error) {
        console.error(
          "Failed to fetch productivity analytics",
          error
        );
      }
    };

    fetchTrendData();
  }, []);

  const totalCompleted = data.reduce(
    (sum, item) => sum + item.completed,
    0
  );

if (!data.length) {
  return (
    <div className="bg-surface rounded-2xl border p-6">
      <div className="h-[300px] flex items-center justify-center">
        No completed tasks yet
      </div>
    </div>
  );
}

  return (
    <div className="bg-surface rounded-2xl border border-border-light shadow-sm p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Task Completion Trend
          </h2>

          <p className="text-sm text-text-secondary mt-1">
            Tasks completed over the last 7 days
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-text-primary">
            {totalCompleted}
          </div>

          <div className="text-xs text-text-secondary">
            Completed
          </div>
        </div>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />

            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />

            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.08)",
              }}
            />

            <Line
              type="monotone"
              dataKey="completed"
              stroke="#2563EB"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}