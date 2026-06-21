import React, { useState } from "react";
import { X } from "lucide-react";

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreateTask,
}) {
  const [formData, setFormData] = useState({
  title: "",
  description: "",
  priority: "Medium",
  dueDate: "",
  tag: "",
});

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    const newTask = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      dueDate: formData.dueDate,
      tag: formData.tag,
      createdAt: new Date().toISOString(),
      activity: [
        {
          action: "Task Created",
          timestamp: new Date().toISOString(),
        },
      ],
    };

    onCreateTask(newTask);

    setFormData({
  title: "",
  description: "",
  priority: "Medium",
  dueDate: "",
  tag: "",
});

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-surface rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-xl font-semibold text-text-primary">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bg-light transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Task details..."
              className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary bg-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>

          {/* Priority + Date */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
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
  type="text"
  name="tag"
  value={formData.tag}
  onChange={handleChange}
  placeholder="Enter a tag (e.g. Frontend, Bug, Research)"
  className="w-full border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
/>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border-light text-text-secondary text-sm font-medium hover:bg-bg-light transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-medium transition shadow-sm"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}