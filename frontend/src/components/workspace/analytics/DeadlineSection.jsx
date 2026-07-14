import { useEffect, useState } from "react";
import {
  CalendarDays,
  AlertTriangle,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import {
  getWorkspaceDeadlines,
} from "../../../services/workspaceAnalyticsService";
import Skeleton from "../../common/Skeleton";

export default function DeadlineSection({ workspaceId }) {
  const [data, setData] = useState({
    overdue: [],
    upcoming: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchDeadlines = async () => {
      try {
        const response =
          await getWorkspaceDeadlines(workspaceId);

        setData(response.data);
      } catch (error) {
        console.error(
          "Failed to fetch workspace deadlines",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDeadlines();
  }, [workspaceId]);

 if (loading) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <Skeleton className="h-7 w-52"/>

            <Skeleton className="h-4 w-72 mt-3"/>

            <div className="grid lg:grid-cols-2 gap-6 mt-8">

                {[1,2].map((col)=>(
                    <div key={col}>

                        <Skeleton className="h-5 w-40 mb-5"/>

                        {[1,2,3].map((card)=>(
                            <div
                                key={card}
                                className="border rounded-xl p-4 mb-3"
                            >

                                <Skeleton className="h-4 w-40"/>

                                <Skeleton className="h-3 w-24 mt-3"/>

                            </div>
                        ))}

                    </div>
                ))}

            </div>

        </div>
    );
}

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200">
        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <CalendarDays
              size={20}
              className="text-orange-500"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Deadlines & Risk
            </h2>

            <p className="text-sm text-text-secondary mt-1">
              Track overdue tasks and upcoming deadlines
            </p>
          </div>

        </div>
      </div>


      <div className="grid lg:grid-cols-2">

        {/* OVERDUE */}
        <div className="p-6 lg:border-r border-slate-200">

          <div className="flex items-center justify-between mb-5">

            <div className="flex items-center gap-2">
              <AlertTriangle
                size={18}
                className="text-red-500"
              />

              <h3 className="font-semibold text-text-primary">
                Overdue Tasks
              </h3>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
              {data.overdue?.length || 0}
            </span>

          </div>


          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">

            {!data.overdue?.length ? (
              <div className="h-48 flex flex-col items-center justify-center text-center">

                <CheckCircle2
                  size={30}
                  className="text-green-500"
                />

                <p className="font-medium text-text-primary mt-3">
                  No overdue tasks
                </p>

                <p className="text-sm text-text-secondary mt-1">
                  Everything is currently on track.
                </p>

              </div>
            ) : (
              data.overdue.map((task) => (

                <TaskDeadlineItem
                  key={task._id}
                  task={task}
                  overdue
                />

              ))
            )}

          </div>
        </div>


        {/* UPCOMING */}
        <div className="p-6">

          <div className="flex items-center justify-between mb-5">

            <div className="flex items-center gap-2">

              <Clock3
                size={18}
                className="text-blue-500"
              />

              <h3 className="font-semibold text-text-primary">
                Upcoming Deadlines
              </h3>

            </div>

            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
              {data.upcoming?.length || 0}
            </span>

          </div>


          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">

            {!data.upcoming?.length ? (
              <div className="h-56 flex flex-col items-center justify-center text-center">

                <CalendarDays
                  size={34}
                  className="text-blue-500"
                />

                <h3 className="mt-4 font-semibold text-text-primary">
                  Nothing Upcoming
                </h3>

                <p className="text-sm text-text-secondary mt-2 max-w-xs">
                  No deadlines are scheduled for the next few days.
                </p>

              </div>
            ) : (
              data.upcoming.map((task) => (

                <TaskDeadlineItem
                  key={task._id}
                  task={task}
                />

              ))
            )}

          </div>
        </div>

      </div>
    </div>
  );
}


function TaskDeadlineItem({ task, overdue = false }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition">

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <p className="font-medium text-text-primary truncate">
            {task.title}
          </p>

          <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">

            <CalendarDays size={13} />

            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              )
              : "No deadline"}

          </div>

        </div>


        <span
          className={`shrink-0 px-2 py-1 rounded-lg text-xs font-medium ${overdue
              ? "bg-red-50 text-red-600"
              : "bg-blue-50 text-blue-600"
            }`}
        >
          {overdue ? "Overdue" : "Upcoming"}
        </span>

      </div>
    </div>
  );
}