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
    tag: "Frontend",
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
      tag: "Frontend",
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}

        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">
            Create New Task
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5"
        >
          {/* Title */}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Task Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>

            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Task details..."
              className="w-full border border-slate-300 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority + Date */}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priority
              </label>

              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Due Date
              </label>

              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tag */}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tag
            </label>

            <select
              name="tag"
              value={formData.tag}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Frontend">
                Frontend
              </option>

              <option value="Backend">
                Backend
              </option>

              <option value="Bug">
                Bug
              </option>

              <option value="Feature">
                Feature
              </option>

              <option value="Research">
                Research
              </option>

              <option value="Design">
                Design
              </option>
            </select>
          </div>

          {/* Footer */}

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}