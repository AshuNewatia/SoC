import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { getWorkspaceWorkload } from "../../../services/workspaceAnalyticsService";

export default function WorkloadChart({ workspaceId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchWorkload = async () => {
      try {
        const { data } =
          await getWorkspaceWorkload(workspaceId);

        setData(data);
      } catch (error) {
        console.error(
          "Failed to fetch workspace workload:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkload();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 w-44 bg-slate-200 rounded" />
          <div className="h-4 w-64 bg-slate-100 rounded mt-3" />
          <div className="h-[300px] bg-slate-100 rounded-xl mt-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text-primary">
          Workload Distribution
        </h2>

        <p className="text-sm text-text-secondary mt-1">
          Active tasks assigned across workspace members
        </p>
      </div>

      {data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-text-secondary">
          No workload data available
        </div>
      ) : (
        <div className="h-[320px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
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
                dataKey="name"
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                cursor={{
                  fill: "#F8FAFC",
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                }}
              />

              <Bar
                dataKey="activeTasks"
                name="Active Tasks"
                fill="#0EA5E9"
                radius={[6, 6, 0, 0]}
                maxBarSize={55}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}