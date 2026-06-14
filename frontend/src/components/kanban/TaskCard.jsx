import { motion } from "framer-motion";
import { CalendarDays, Users } from "lucide-react";

const priorityColors = {
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-emerald-100 text-emerald-700",
};

export default function TaskCard({ task, onClick }) {
  const priorityStyle = priorityColors[task.priority] || "bg-slate-100 text-slate-700";
  const memberCount = task.assignedTo?.length || 0;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
    >
      {/* Title */}
      <div className="mb-3">
        <h3 className="font-semibold text-slate-800 leading-snug">
          {task.title || "Untitled Task"}
        </h3>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
          {task.description || "No description provided"}
        </p>
      </div>

      {/* Priority + Due Date */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityStyle}`}>
          {task.priority || "Medium"}
        </span>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <CalendarDays size={14} />
          {task.dueDate || "No due date"}
        </div>
      </div>

      {/* Assigned Members Count */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <Users size={14} className="text-slate-400" />
        <span className="text-sm text-slate-600">
          {memberCount} {memberCount === 1 ? "Member" : "Members"}
        </span>
      </div>
    </motion.div>
  );
}