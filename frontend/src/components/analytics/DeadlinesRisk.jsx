import React, { useEffect, useState } from "react";
import { AlertTriangle, CalendarDays, Clock } from "lucide-react";
import { getDeadlinesRisk } from "../../services/analyticsService";

export default function DeadlinesRisk() {
  const [data, setData] = useState({
    overdue: [],
    upcoming: [],
    overdueCount: 0,
    upcomingCount: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const { data } = await getDeadlinesRisk();
        setData(data);
      } catch (error) {
        console.error("Deadline analytics error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeadlines();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          Loading...
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Overdue */}

      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            <h2 className="font-semibold text-lg">
              Overdue Tasks
            </h2>
          </div>

          <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
            {data.overdueCount}
          </span>
        </div>

        {data.overdue.length === 0 ? (
          <div className="text-center py-10">
            <AlertTriangle
              size={42}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-medium">
              No overdue tasks
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Great! You're on track.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.overdue.map((task) => (
              <div
                key={task._id}
                className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition"
              >
                <div className="flex justify-between">
                  <h3 className="font-medium">
                    {task.title}
                  </h3>

                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                    {task.priority}
                  </span>
                </div>

                <p className="text-sm text-slate-500 mt-2">
                  {task.workspace?.name}
                </p>

                <div className="flex items-center gap-2 mt-3 text-xs text-red-600">
                  <Clock size={14} />
                  {formatDate(task.dueDate)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming */}

      <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CalendarDays
              className="text-blue-500"
              size={20}
            />

            <h2 className="font-semibold text-lg">
              Upcoming Deadlines
            </h2>
          </div>

          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
            {data.upcomingCount}
          </span>
        </div>

        {data.upcoming.length === 0 ? (
          <div className="text-center py-10">
            <CalendarDays
              size={42}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-medium">
              Nothing Upcoming
            </p>

            <p className="text-sm text-slate-500 mt-1">
              No deadlines in the next 7 days.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.upcoming.map((task) => (
              <div
                key={task._id}
                className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition"
              >
                <div className="flex justify-between">
                  <h3 className="font-medium">
                    {task.title}
                  </h3>

                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {task.priority}
                  </span>
                </div>

                <p className="text-sm text-slate-500 mt-2">
                  {task.workspace?.name}
                </p>

                <div className="flex items-center gap-2 mt-3 text-xs text-blue-600">
                  <Clock size={14} />
                  {formatDate(task.dueDate)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}