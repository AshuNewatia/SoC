import React, { useEffect, useState } from "react";
import { getWorkspacePriorityStats } from "../../../services/workspaceAnalyticsService";
import Skeleton from "../../common/Skeleton";

const COLORS = {
  Critical: "bg-purple-500",
  High: "bg-red-500",
  Medium: "bg-blue-500",
  Low: "bg-green-500",
};

const DOTS = {
  Critical: "bg-purple-500",
  High: "bg-red-500",
  Medium: "bg-blue-500",
  Low: "bg-green-500",
};

export default function PriorityChart({workspaceId}) {
  const [data, setData] = useState([]);
  const [loading,setLoading]=useState(true);

 useEffect(() => {
  if (!workspaceId) return;

  const fetchPriorityData = async () => {
    try {
      const { data } =
        await getWorkspacePriorityStats(
          workspaceId
        );

      const sorted = [...data].sort((a, b) => {
        const order = {
          Critical: 1,
          High: 2,
          Medium: 3,
          Low: 4,
        };

        return order[a._id] - order[b._id];
      });

      setData(sorted);
    } catch (error) {
      console.error(
        "Failed to fetch workspace priority analytics",
        error
      );
    }finally{
   setLoading(false);
}
  };

  fetchPriorityData();
}, [workspaceId]);

  const totalTasks = data.reduce(
    (sum, item) => sum + item.count,
    0
  );

if (!data.length) {
  return (
    <div className="bg-surface rounded-2xl border p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10">

    <div className="flex flex-col items-center justify-center h-80 text-center">

        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">

            <span className="w-4 h-4 rounded-full bg-slate-400"/>

        </div>

        <h3 className="mt-5 text-lg font-semibold text-text-primary">
            No Priority Data
        </h3>

        <p className="mt-2 text-sm text-text-secondary max-w-sm">
            Create tasks with different priorities to view the distribution.
        </p>

    </div>

</div>
    </div>
  );
}
if (loading) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <Skeleton className="h-7 w-52"/>

      <Skeleton className="h-4 w-64 mt-3"/>

      <div className="mt-8 space-y-7">

        {[1,2,3,4].map((item)=>(
          <div key={item}>

            <div className="flex justify-between mb-3">

              <Skeleton className="h-4 w-24"/>

              <Skeleton className="h-4 w-10"/>

            </div>

            <Skeleton className="h-3 rounded-full"/>

          </div>
        ))}

      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">

        {[1,2,3,4].map((item)=>(
          <div
            key={item}
            className="border rounded-xl p-4"
          >
            <Skeleton className="h-4 w-16 mx-auto"/>
            <Skeleton className="h-7 w-10 mx-auto mt-3"/>
          </div>
        ))}

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

                  <span className="font-semibold text-text-primary min-w-6 text-right">
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
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