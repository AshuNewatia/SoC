import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, CalendarDays, Flag, Trash2, Paperclip, Loader2, FileText, Download } from "lucide-react";
import DeleteTaskModal from "./DeleteTaskModal";
import CommentSection from "./CommentSection";
import socket from "../../hooks/useSocket";
import api from "../../services/api";

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

  const priorityClass = priorityColors[task.priority] || "bg-slate-100 text-slate-700";
  const statusClass = statusColors[task.status] || "bg-slate-100 text-slate-700";
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
      // Also update the task object if needed
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
              className="fixed inset-0 bg-black/30 z-40"
            />

            <motion.div
              initial={{ x: 500 }}
              animate={{ x: 0 }}
              exit={{ x: 500 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 h-screen w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-4 sm:px-5 py-4 z-10">
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

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {/* Description */}
                <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-slate-600 whitespace-pre-wrap">
                    {task.description || "No description provided"}
                  </p>
                </div>

                {/* Details */}
                <div className="mt-6 space-y-4">
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

                  {/* ===== PROOF OF WORK / ATTACHMENTS ===== */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    {/* Fixed Header */}
                    <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50">
                      <h4 className="text-sm font-semibold text-slate-700">
                        Proof of Work / Attachments
                      </h4>
                    </div>

                    {/* Fixed Upload Area */}
                    <div className="px-4 py-3 border-b border-slate-200">
                      <label
                        className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-3 cursor-pointer hover:border-primary/50 transition bg-slate-50/50 ${
                          uploading ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        {uploading ? (
                          <>
                            <Loader2 size={16} className="animate-spin text-primary" />
                            <span className="text-sm font-medium text-slate-600">Uploading file to cloud...</span>
                          </>
                        ) : (
                          <>
                            <Paperclip size={16} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-600">Click to upload image or PDF proof</span>
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
                      <div className="max-h-40 overflow-y-auto p-3 space-y-2">
                        {attachments.map((file, idx) => (
                          <a
                            key={file._id || idx}
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition group"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="text-xl">{getFileIcon(file.fileName)}</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-700 truncate">{file.fileName}</p>
                                {file.size && (
                                  <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                                )}
                              </div>
                            </div>
                            <Download size={16} className="text-slate-400 group-hover:text-primary transition shrink-0 ml-2" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <div className="text-3xl mb-2">📎</div>
                        <p className="text-sm text-slate-500 font-medium">No files uploaded yet</p>
                        <p className="text-xs text-slate-400 mt-1">Upload images or PDFs as proof of work.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* CommentSection */}
                <CommentSection taskId={task._id} members={members} fetchTasks={fetchTasks} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}