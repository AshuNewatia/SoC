import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Clock } from "lucide-react";

export default function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState(task);

  useEffect(() => {
    setFormData(task);
  }, [task]);

  if (!task) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const inputClass =
    "w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/30 transition-all duration-200";

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
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-2xl w-full max-w-2xl shadow-2xl border border-border-light max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border-light">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Task Details</h2>
                  <div className="mt-2 w-12 h-1 rounded-full bg-primary" />
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="p-1.5 rounded-lg hover:bg-bg-light transition"
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Task Title
                  </label>
                  <input
                    name="title"
                    value={formData?.title || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    name="description"
                    value={formData?.description || ""}
                    onChange={handleChange}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData?.priority || "Medium"}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData?.status || "todo"}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="todo">To Do</option>
                      <option value="progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData?.dueDate || ""}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Tag */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Tag
                  </label>
                  <input
                    name="tag"
                    value={formData?.tag || ""}
                    onChange={handleChange}
                    placeholder="e.g., Frontend, Backend, Design..."
                    className={inputClass}
                  />
                </div>

                {/* Activity History */}
                <div className="mt-4 border-t border-border-light pt-4">
                  <h3 className="font-semibold text-text-primary mb-3 text-base">
                    Activity History
                  </h3>
                  {task.activityHistory?.length ? (
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {task.activityHistory.map((item, index) => (
                        <div key={index} className="relative flex items-start gap-3">
                          {/* Timeline dot */}
                          <div className="relative flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary/60 border-2 border-white shadow-sm mt-1.5"></div>
                            {index !== task.activityHistory.length - 1 && (
                              <div className="w-0.5 flex-1 bg-border-light mt-1"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-3">
                            <p className="text-sm font-medium text-text-primary">
                              {item.action}
                            </p>
                            <span className="text-xs text-text-secondary">
                              {new Date(item.timestamp).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <Clock size={20} className="text-text-secondary" />
                      </div>
                      <p className="text-sm text-text-secondary">No activity recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-5 border-t border-border-light">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-border-light text-text-secondary text-sm font-medium hover:bg-bg-light transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-95"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSubmit}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-lg active:scale-95"
                >
                  Save Changes
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}