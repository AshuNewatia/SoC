import React from "react";
import {
  Calendar,
  Pencil,
  Trash2,
  FolderKanban,
  Tag,
} from "lucide-react";

export default function TaskCard({ task, onDelete, onOpen }) {
  const priorityColors = {
    Low: "text-green-600 bg-green-50",
    Medium: "text-yellow-700 bg-yellow-50",
    High: "text-orange-700 bg-orange-50",
    Critical: "text-red-600 bg-red-50",
  };

  const overdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date();

  return (
    <div className="group bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 p-4">

      {/* Header */}
      <div className="flex justify-between items-start">

        <h3 className="font-semibold text-slate-800 text-[15px] leading-5 line-clamp-2">
          {task.title}
        </h3>

        <span
          className={`text-[11px] px-2 py-1 rounded-md font-medium ${priorityColors[task.priority]
            }`}
        >
          {task.priority}
        </span>

      </div>

      {/* Description */}

      {task.description && (
        <p className="mt-3 text-sm text-slate-500 line-clamp-2 leading-5">
          {task.description}
        </p>
      )}

      {/* Divider */}

      <div className="my-4 border-t border-slate-100"></div>

      {/* Workspace */}

      <div className="space-y-2 text-xs">

        {task.taskType === "workspace" ? (
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wide text-blue-500 font-semibold">
              Workspace Task
            </span>

            <div className="flex items-center gap-2">
              <FolderKanban size={14} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-600">
                {task.workspaceName}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-green-600 font-medium">
            Personal Task
          </div>
        )}
        {task.taskType === "personal" && (
          <div className="flex items-center gap-2 text-slate-600">
            <Tag size={14} />
            {task.tag || "No Tag"}
          </div>
        )}

        <div
          className={`flex items-center gap-2 ${overdue
            ? "text-red-500"
            : "text-slate-500"
            }`}
        >
          <Calendar size={14} />

          {task.dueDate
            ? new Date(task.dueDate).toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            )
            : "No due date"}
        </div>

      </div>

      {/* Actions */}

      {task.taskType === "personal" && (

        <div className="mt-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen(task);
            }}
            className="p-2 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
            className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>

        </div>

      )}

    </div>
  );
}