import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Type,
  FileText,
  CalendarDays,
  Tag,
  Flag,
} from "lucide-react";

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
  priority: "",
  dueDate: "",
  tag: "",
});

    onClose();
  };

  const priorities = [
  "Low",
  "Medium",
  "High",
];

const tags = [
  "Frontend",
  "Backend",
  "Bug",
  "Feature",
  "Research",
  "Design",
  "General",
];

const priorityStyles = {
  Low: "bg-green-50 text-green-600 border-green-200",
  Medium: "bg-yellow-50 text-yellow-600 border-yellow-200",
  High: "bg-red-50 text-red-600 border-red-200",
};

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
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 20 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-5"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-7 py-5 z-20">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Create Task
                  </h2>
<div className="mt-3 w-16 h-1 rounded-full bg-sky-500" />
                  <p className="text-sm text-slate-500 mt-1">
                    Organize your work with priorities and deadlines.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl hover:bg-slate-100 transition flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-7 py-6 space-y-7"
            >
              {/* Title */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Type size={16} className="text-slate-400" />
                  Title
                </label>

                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="What needs to be done?"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-200"
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <FileText size={16} className="text-slate-400" />
                  Description
                </label>

                <textarea
                  rows={5}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add a detailed description..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 resize-none outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-200"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                  <Flag size={16} className="text-slate-400" />
                  Priority
                </label>

                <div className="grid grid-cols-4 gap-3">
                  {priorities.map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          priority,
                        })
                      }
                      className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                        formData.priority === priority
                           ? priorityStyles[priority]
                           : "border-slate-200"
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <CalendarDays size={16} className="text-slate-400" />
                  Due Date
                </label>

                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                  <Tag size={16} className="text-slate-400" />
                  Tag
                </label>

                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          tag,
                        })
                      }
                      className={`rounded-full px-4 py-2 text-sm transition border ${
                        formData.tag === tag
                         ? "bg-sky-500 text-white border-sky-500"
                         : "border-slate-200 hover:border-sky-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <input
                  name="tag"
                  value={formData.tag}
                  onChange={handleChange}
                  placeholder="Or type your own tag..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-200"
                />
              </div>
            </form>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-7 py-5 flex justify-between items-center">
              <p className="text-sm text-slate-500">
                All fields can be edited later.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);
}