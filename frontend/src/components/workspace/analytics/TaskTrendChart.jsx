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

import { getWorkspaceCompletionTrend } from "../../../services/workspaceAnalyticsService";


export default function TaskTrendChart({
  workspaceId,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
  if (!workspaceId) return;

  const fetchTrendData = async () => {
    try {
      const { data } =
        await getWorkspaceCompletionTrend(workspaceId);

      setData(data);
    } catch (error) {
      console.error(
        "Failed to fetch workspace completion trend",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  fetchTrendData();
}, [workspaceId]);

  const totalCompleted = data.reduce(
    (sum, item) => sum + item.completed,
    0
  );


  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="h-[360px] bg-slate-100 animate-pulse rounded-xl" />
      </div>
    );
  }


  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

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


      {data.length === 0 ? (
        <div className="h-[320px] flex items-center justify-center text-text-secondary">
          No completed tasks in the last 7 days
        </div>
      ) : (
        <div className="h-[320px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
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

              <Tooltip />

              <Line
                type="monotone"
                dataKey="completed"
                stroke="#0EA5E9"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}