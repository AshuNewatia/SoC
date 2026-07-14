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
import Skeleton from "../../common/Skeleton";

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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

        <Skeleton className="h-7 w-44" />

        <Skeleton className="h-4 w-64 mt-3" />

        <Skeleton className="h-80 rounded-xl mt-8" />

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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10">

          <div className="flex flex-col items-center justify-center h-80 text-center">

            <BarChart
              size={42}
              className="text-slate-400"
            />

            <h3 className="mt-5 text-lg font-semibold text-text-primary">
              No Workload Data
            </h3>

            <p className="mt-2 text-sm text-text-secondary max-w-sm">
              Assign tasks to workspace members to view workload distribution.
            </p>

          </div>

        </div>
      ) : (
        <div className="h-80">
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