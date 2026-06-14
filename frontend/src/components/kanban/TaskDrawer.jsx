import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarDays, MessageSquare, Flag, Trash2 } from "lucide-react";

const priorityColors = {
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-emerald-100 text-emerald-700",
};

const statusLabels = {
  todo: "To Do",
  progress: "In Progress",
  completed: "Completed",
};

export default function TaskDrawer({ task, isOpen, onClose, onDelete, onEdit }) {
  if (!task) return null;

  const comments = Array.isArray(task.comments) ? task.comments : [];
  const priorityClass = priorityColors[task.priority] || "bg-slate-100 text-slate-700";
  const memberCount = task.assignedTo?.length || 0;
  const statusLabel = statusLabels[task.status] || task.status || "Unknown";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: 500 }}
            animate={{ x: 0 }}
            exit={{ x: 500 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed right-0 top-0 h-screen w-full sm:w-[420px] bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-5 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold text-slate-800 break-words">
                    {task.title || "Untitled Task"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">{statusLabel}</p>
                  <button
                    onClick={onEdit}
                    className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-white font-medium"
                  >
                    Edit Task
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDelete(task)}
                    className="p-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-slate-600 whitespace-pre-wrap">
                  {task.description || "No description provided"}
                </p>
              </div>

              {/* Details */}
              <div className="mt-8 space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Priority</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityClass}`}>
                    {task.priority || "None"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Assigned Members</span>
                  <span className="font-medium">{memberCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Due Date</span>
                  <span className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    {task.dueDate || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status</span>
                  <span className="flex items-center gap-2 capitalize">
                    <Flag size={16} />
                    {statusLabel}
                  </span>
                </div>
              </div>

              {/* Comments (keep UI, backend later) */}
              <div className="mt-10">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare size={18} />
                  <h3 className="font-semibold">Comments</h3>
                </div>
                {comments.length > 0 ? (
                  <div className="space-y-3">
                    {comments.map((comment, index) => (
                      <div key={index} className="p-4 rounded-xl bg-slate-50">
                        {comment}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 text-slate-500">
                    No comments yet
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}