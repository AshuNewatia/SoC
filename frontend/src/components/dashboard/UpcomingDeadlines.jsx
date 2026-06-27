// src/components/dashboard/UpcomingDeadlines.jsx
import { CalendarClock } from "lucide-react";

export default function UpcomingDeadlines({
  tasks,
  currentUser,
  isProfessor,
}) {
  // 1. Filter tasks based on role
  const filteredTasks = isProfessor
    ? tasks
    : tasks.filter((task) =>
        task.assignedTo?.some((user) => user._id === currentUser?._id)
      );

  // 2. Compute upcoming (next 7 days) from the filtered tasks
  const upcomingTasks = filteredTasks
    .filter((task) => {
      if (!task.dueDate || task.status === "completed") return false;

      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      return dueDate >= today && dueDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <div className="mt-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900">
          Upcoming Deadlines
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Tasks due within the next 7 days
        </p>
      </div>

      <div className="max-h-105 overflow-y-auto">
        {upcomingTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No upcoming deadlines 🎉
          </div>
        ) : (
          upcomingTasks.map((task) => (
            <div
              key={task._id}
              className="flex items-center justify-between px-6 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <CalendarClock size={18} className="text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{task.title}</p>
                  <p className="text-xs text-slate-500">
                    {task.workspace?.name || "Workspace"}
                  </p>
                </div>
              </div>
              <div className="text-sm font-semibold text-orange-600">
                {Math.ceil(
                  (new Date(task.dueDate) - new Date()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days left
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}