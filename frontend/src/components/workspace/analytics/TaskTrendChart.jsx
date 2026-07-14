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
import Skeleton from "../../common/Skeleton";


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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

        <Skeleton className="h-7 w-52" />

        <Skeleton className="h-4 w-56 mt-3" />

        <div className="flex justify-between mt-6">

          <div>
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-3 w-16 mt-2" />
          </div>

        </div>

        <Skeleton className="h-80 rounded-xl mt-6" />

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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10">

          <div className="flex flex-col items-center justify-center h-80 text-center">

            <Calendar
              size={42}
              className="text-slate-400"
            />

            <h3 className="mt-5 text-lg font-semibold text-text-primary">
              No Completion History
            </h3>

            <p className="mt-2 text-sm text-text-secondary max-w-sm">
              Complete some tasks to generate productivity trends.
            </p>

          </div>

        </div>
      ) : (
        <div className="h-80">
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