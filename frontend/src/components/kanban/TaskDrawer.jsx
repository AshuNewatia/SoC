import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, CalendarDays, Flag, Trash2 } from "lucide-react";
import DeleteTaskModal from "./DeleteTaskModal";
import CommentSection from "./CommentSection";
import socket from "../../hooks/useSocket";

const priorityColors = {
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-emerald-100 text-emerald-700",
};

const statusColors = {
  todo: "bg-slate-100 text-slate-700",
  progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

const statusLabels = {
  todo: "To Do",
  progress: "In Progress",
  completed: "Completed",
};

export default function TaskDrawer({ task, isOpen, onClose, onDelete, onEdit, members }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  if (!task) return null;

  const priorityClass = priorityColors[task.priority] || "bg-slate-100 text-slate-700";
  const statusClass = statusColors[task.status] || "bg-slate-100 text-slate-700";
  const statusLabel = statusLabels[task.status] || task.status || "Unknown";
  const memberCount = task.assignedTo?.length || 0;

  return (
    <>
      <DeleteTaskModal
        isOpen={deleteModalOpen}
        taskTitle={task.title}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          onDelete(task);
          setDeleteModalOpen(false);
        }}
      />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/30 z-40"
            />

            <motion.div
              initial={{ x: 500 }}
              animate={{ x: 0 }}
              exit={{ x: 500 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 h-screen w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Header – reduced padding */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 sm:px-5 py-5 z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h2 className="text-2xl font-bold text-slate-800 break-words">
                      {task.title || "Untitled Task"}
                    </h2>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
                      {statusLabel}
                    </span>
                    <button
                      onClick={onEdit}
                      className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-white font-medium"
                    >
                      Edit Task
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeleteModalOpen(true)}
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

              {/* Body – reduced padding, removed double padding */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-5">
                {/* Description */}
                <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-slate-600 whitespace-pre-wrap">
                    {task.description || "No description provided"}
                  </p>
                </div>

                {/* Details – reduced margins */}
                <div className="mt-7 space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Priority</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityClass}`}>
                      {task.priority || "None"}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-slate-500">Assigned To</span>
                    <div className="text-right">
                      <div className="font-medium">
                        {memberCount} {memberCount === 1 ? "Member" : "Members"}
                      </div>
                      {task.assignedTo?.length > 0 && (
                        <div className="flex flex-wrap justify-end gap-2 mt-2">
                          {task.assignedTo.map((member) => (
                            <div
                              key={member._id}
                              className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                            >
                              {member.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Due Date</span>
                    <span className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                        : "Not set"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Created</span>
                    <span className="text-sm text-slate-700">
                      {task.createdAt
                        ? new Date(task.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                        : "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </div>

                  {/* Attachments */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
                      Proof of Work / Attachments
                    </h4>
                    {task.attachments && task.attachments.length > 0 ? (
                      <div className="space-y-2">
                        {task.attachments.map((file, idx) => (
                          <a
                            key={file._id || idx}
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition text-sm font-medium group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-slate-400 group-hover:text-primary transition">📎</span>
                              <span className="truncate text-slate-700 font-normal">{file.fileName}</span>
                            </div>
                            <span className="text-xs text-primary font-semibold hover:underline shrink-0">
                              Download / View
                            </span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm text-center">
                        No proofs or attachments submitted yet.
                      </div>
                    )}
                  </div>


                </div>

                {/* CommentSection */}
                <CommentSection
                  taskId={task._id}
                  members={members}
                  fetchTasks={fetchTasks}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}