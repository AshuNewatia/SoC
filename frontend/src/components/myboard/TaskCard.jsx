import React from "react";
import { Calendar, Trash2 } from "lucide-react";



export default function TaskCard({ task, onDelete, onOpen }) {
    const isOverdue =
      task.dueDate &&
      new Date(task.dueDate) < new Date();
  const priorityStyles = {
    Low: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
  };

  return (
    <div onClick={() => onOpen(task)} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}

      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-slate-800">
          {task.title}
        </h3>

        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            priorityStyles[task.priority] ||
            "bg-slate-100 text-slate-700"
          }`}
        >
          {task.priority}
        </span>
      </div>

      {/* Description */}

      {task.description && (
        <p className="text-sm text-slate-500 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Due Date */}

      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Calendar size={14} />
        <span>{task.dueDate}</span>
      </div>

      {/* Footer */}

      <div className="flex items-center justify-between">
        <span className="text-xs bg-slate-100 px-2 py-1 rounded-lg">
          {task.tag}
        </span>

        <div className="flex items-center gap-2">
  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
    ME
  </div>

  <button
  onClick={(e) => {
    e.stopPropagation();
    onDelete(task.id);
  }}
  className="text-red-500 hover:bg-red-50 p-1 rounded"
>
  <Trash2 size={16} />
</button>
</div>
      </div>
    </div>
  );
}