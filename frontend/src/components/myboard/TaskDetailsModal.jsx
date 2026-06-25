import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

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

  if (!isOpen || !task) return null;

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

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-xl font-semibold text-text-primary">Task Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bg-light transition"
          >
            <X size={18} />
          </button>
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
              className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
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
              className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary bg-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
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
                className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
              className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                  <div key={index} className="border-l-2 border-primary/30 pl-3">
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
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">No activity recorded yet.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-border-light">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border-light text-text-secondary text-sm font-medium hover:bg-bg-light transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-medium transition shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}