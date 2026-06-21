import React from "react";
import { Calendar, Trash2, User } from "lucide-react";

export default function TaskCard({ task, onDelete, onOpen }) {
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date();

  const priorityStyles = {
    Low: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
    Critical: "bg-purple-100 text-purple-700",
  };

  const tagStyles = {
    Frontend: "bg-blue-100 text-blue-700",
    Backend: "bg-purple-100 text-purple-700",
    Bug: "bg-red-100 text-red-700",
    Feature: "bg-green-100 text-green-700",
    Research: "bg-yellow-100 text-yellow-700",
    Design: "bg-pink-100 text-pink-700",
    General: "bg-slate-100 text-slate-700",
  };

  return (
    <div
      onClick={() => onOpen(task)}
      className="bg-surface rounded-xl border border-border-light p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-text-primary text-sm line-clamp-2">
          {task.title}
        </h3>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            priorityStyles[task.priority] || "bg-slate-100 text-slate-700"
          }`}
        >
          {task.priority}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-text-secondary mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Due Date */}
      <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-3">
        <Calendar size={12} />
        <span className={isOverdue ? "text-red-500 font-medium" : ""}>
          {task.dueDate || "No due date"}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs px-2 py-1 rounded-md font-medium ${
            tagStyles[task.tag] || "bg-slate-100 text-slate-700"
          }`}
        >
          {task.tag}
        </span>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
            <User size={12} />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}