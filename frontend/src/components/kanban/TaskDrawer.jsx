import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, CalendarDays, Flag, Trash2, Paperclip, Loader2, FileText, Download } from "lucide-react";
import DeleteTaskModal from "./DeleteTaskModal";
import CommentSection from "./CommentSection";
import socket from "../../hooks/useSocket";
import api from "../../services/api";

const priorityColors = {
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const priorityDots = {
  High: "🟠",
  Medium: "🟡",
  Low: "🟢",
};

const statusColors = {
  todo: "bg-slate-100 text-slate-700 border-slate-200",
  progress: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
};

const statusDots = {
  todo: "⚪",
  progress: "🔵",
  completed: "🟢",
};

const statusLabels = {
  todo: "To Do",
  progress: "In Progress",
  completed: "Completed",
};

const getFileIcon = (fileName) => {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "📄";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "🖼️";
  if (["doc", "docx"].includes(ext)) return "📝";
  if (["xls", "xlsx", "csv"].includes(ext)) return "📊";
  return "📎";
};

export default function TaskDrawer({ task, isOpen, onClose, onDelete, onEdit, members, fetchTasks }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState(task?.attachments || []);

  if (!task) return null;

  const priorityClass = priorityColors[task.priority] || "bg-slate-100 text-slate-700 border-slate-200";
  const priorityDot = priorityDots[task.priority] || "🔵";
  const statusClass = statusColors[task.status] || "bg-slate-100 text-slate-700 border-slate-200";
  const statusDot = statusDots[task.status] || "⚪";
  const statusLabel = statusLabels[task.status] || task.status || "Unknown";
  const memberCount = task.assignedTo?.length || 0;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await api.post(`/api/tasks/${task._id}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAttachments(res.data.task.attachments);
      task.attachments = res.data.task.attachments;
    } catch (err) {
      console.error("Upload error:", err);
      alert(err.response?.data?.message || "Failed to upload attachment");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

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
              className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ x: 500 }}
              animate={{ x: 0 }}
              exit={{ x: 500 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed right-0 top-0 h-screen w-full sm:w-[520px] lg:w-[560px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-border-light px-4 sm:px-5 py-4 z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary break-words">
                      {task.title || "Untitled Task"}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${statusClass}`}>
                        {statusDot} {statusLabel}
                      </span>
                    </div>
                    <motion.button
                      onClick={onEdit}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-4 w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 transition-all duration-200 hover:shadow-lg active:scale-95"
                    >
                      Edit Task
                    </motion.button>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <motion.button
                      onClick={() => setDeleteModalOpen(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                    <motion.button
                      onClick={onClose}
                      whileHover={{ scale: 1.05, rotate: 90 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="p-2 rounded-xl bg-slate-100 text-text-secondary hover:bg-slate-200 transition-all duration-200"
                    >
                      <X size={20} />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 minimalist-scrollbar">
                {/* Description */}
                <div className="rounded-3xl bg-slate-50/60 p-4 border border-border-light">
                  <h3 className="font-semibold text-text-primary mb-2">Description</h3>
                  <p className="text-text-secondary whitespace-pre-wrap">
                    {task.description || "No description provided"}
                  </p>
                </div>

                {/* Details */}
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Priority</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${priorityClass}`}>
                      {priorityDot} {task.priority || "None"}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-text-secondary">Assigned To</span>
                    <div className="text-right">
                      <div className="font-medium text-text-primary">
                        {memberCount} {memberCount === 1 ? "Member" : "Members"}
                      </div>
                      {task.assignedTo?.length > 0 && (
                        <div className="flex flex-wrap justify-end gap-2 mt-2">
                          {task.assignedTo.map((member) => (
                            <div
                              key={member._id}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                            >
                              <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                                {member.name?.[0]?.toUpperCase()}
                              </span>
                              {member.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Due Date</span>
                    <span className="flex items-center gap-2 text-text-primary">
                      <CalendarDays size={16} className="text-text-secondary" />
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
                    <span className="text-text-secondary">Created</span>
                    <span className="text-sm text-text-primary">
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
                    <span className="text-text-secondary">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusClass}`}>
                      {statusDot} {statusLabel}
                    </span>
                  </div>

                  {/* ===== PROOF OF WORK / ATTACHMENTS ===== */}
                  <div className="rounded-2xl border border-border-light bg-white overflow-hidden">
                    {/* Fixed Header */}
                    <div className="px-4 py-3 border-b border-border-light bg-slate-50/50">
                      <h4 className="text-sm font-semibold text-text-primary">
                        Proof of Work / Attachments
                      </h4>
                    </div>

                    {/* Fixed Upload Area */}
                    <div className="px-4 py-3 border-b border-border-light">
                      <label
                        className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-light px-4 py-3 cursor-pointer transition-all duration-200 bg-slate-50/50 hover:bg-primary/5 hover:border-primary ${
                          uploading ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        {uploading ? (
                          <>
                            <Loader2 size={16} className="animate-spin text-primary" />
                            <span className="text-sm font-medium text-text-secondary">Uploading file to cloud...</span>
                          </>
                        ) : (
                          <>
                            <Paperclip size={16} className="text-text-secondary" />
                            <span className="text-sm font-medium text-text-secondary">Click to upload image or PDF proof</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,image/png,image/jpeg,image/jpg"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>

                    {/* Scrollable Attachment List */}
                    {attachments && attachments.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto p-3 space-y-2 minimalist-scrollbar">
                        {attachments.map((file, idx) => (
                          <motion.a
                            key={file._id || idx}
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -2 }}
                            className="flex items-center justify-between p-3 rounded-xl border border-border-light bg-slate-50/50 hover:bg-slate-100 hover:shadow-sm transition-all duration-200 group"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="text-xl">{getFileIcon(file.fileName)}</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-text-primary truncate">{file.fileName}</p>
                                {file.size && (
                                  <p className="text-xs text-text-secondary">{formatFileSize(file.size)}</p>
                                )}
                              </div>
                            </div>
                            <Download size={16} className="text-text-secondary group-hover:text-primary transition-colors duration-200 shrink-0 ml-2" />
                          </motion.a>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <div className="text-3xl mb-2">📎</div>
                        <p className="text-sm font-medium text-text-primary">No files uploaded yet</p>
                        <p className="text-xs text-text-secondary mt-1">Upload images or PDFs as proof of work.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* CommentSection with spacing */}
                <div className="mt-8">
                  <CommentSection taskId={task._id} members={members} fetchTasks={fetchTasks} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}