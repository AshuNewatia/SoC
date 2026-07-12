// src/components/workspace/overview/Overview.jsx
import { Plus, Activity, CheckCircle2, Users, Clock3 } from "lucide-react";

export default function Overview({
  onlineUsers,
  totalTasks,
  completedTasks,
  onCreateTask,
}) {
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="mb-8 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-4 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Workspace Overview</h1>
            <p className="mt-1 md:mt-2 text-sm md:text-base text-slate-500">Track progress, manage tasks, and collaborate efficiently.</p>
          </div>
          <button
            onClick={() => onCreateTask("todo")}
            className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition shadow-md text-sm md:text-base"
          >
            <Plus size={18} />
            Create Task
          </button>
        </div>

        {/* Progress */}
        <div className="mt-6 md:mt-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Sprint Progress</span>
            <span className="text-sm font-semibold text-slate-800">{progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {completedTasks} of {totalTasks} tasks completed
        </p>

        {/* Stats – responsive grid: 2 cols on mobile, 4 on large */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
          <div className="rounded-2xl border border-slate-200 p-4 md:p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-2 md:gap-3">
              <Activity className="text-primary" size={18} md:size={20} />
              <span className="text-xs md:text-sm text-slate-600">Active Tasks</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold mt-2 md:mt-3">{totalTasks}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 md:p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-2 md:gap-3">
              <CheckCircle2 className="text-emerald-500" size={18} md:size={20} />
              <span className="text-xs md:text-sm text-slate-600">Completed</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold mt-2 md:mt-3">{completedTasks}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 md:p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-2 md:gap-3">
              <Users className="text-indigo-500" size={18} md:size={20} />
              <span className="text-xs md:text-sm text-slate-600">Members Online</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold mt-2 md:mt-3">{onlineUsers.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 md:p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-2 md:gap-3">
              <Clock3 className="text-violet-500" size={18} md:size={20} />
              <span className="text-xs md:text-sm text-slate-600">Pending</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold mt-2 md:mt-3">{totalTasks - completedTasks}</p>
          </div>
        </div>

        {/* Active Collaborators */}
        <div className="mt-6 md:mt-8">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Active Collaborators</h3>
          <div className="flex -space-x-3">
            {onlineUsers.slice(0, 3).map((user, index) => (
              <div
                key={index}
                className="h-10 w-10 md:h-11 md:w-11 rounded-full border-4 border-white bg-primary text-white flex items-center justify-center font-semibold shadow"
              >
                {user.name?.[0]?.toUpperCase()}
              </div>
            ))}

            {onlineUsers.length > 3 && (
              <div className="h-10 w-10 md:h-11 md:w-11 rounded-full border-4 border-white bg-slate-200 text-slate-700 flex items-center justify-center font-semibold shadow">
                +{onlineUsers.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}