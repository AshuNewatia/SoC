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
      priority: "Medium",
      dueDate: "",
      tag: "",
    });

    onClose();
  };

  const priorities = ["Low", "Medium", "High"];

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
    Low: "bg-green-50 text-green-600 border-green-200 hover:bg-green-100",
    Medium: "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100",
    High: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100",
  };

  const prioritySelectedStyles = {
    Low: "bg-green-500 text-white border-green-500",
    Medium: "bg-yellow-500 text-white border-yellow-500",
    High: "bg-red-500 text-white border-red-500",
  };

  const inputClass =
    "w-full rounded-xl border border-border-light px-4 py-3 outline-none transition-all duration-200 bg-white text-text-primary placeholder:text-text-secondary focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-primary/30";

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
            className="fixed inset-0 z-[60] flex items-center justify-center p-5"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-border-light overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-border-light px-7 py-5 z-20">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold text-text-primary">
                      Create Task
                    </h2>
                    <div className="mt-3 w-16 h-1 rounded-full bg-primary" />
                    <p className="text-sm text-text-secondary mt-1">
                      Organize your work with priorities and deadlines.
                    </p>
                  </div>

                  <motion.button
                    onClick={onClose}
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                    className="w-10 h-10 rounded-xl hover:bg-slate-100 transition flex items-center justify-center"
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              </div>

              {/* Body */}
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto px-7 py-6 space-y-7"
              >
                {/* Title */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                    <Type size={16} className="text-text-secondary" />
                    Title
                  </label>

                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="What needs to be done?"
                    required
                    className={inputClass}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                    <FileText size={16} className="text-text-secondary" />
                    Description
                  </label>

                  <textarea
                    rows={5}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Add a detailed description..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-3">
                    <Flag size={16} className="text-text-secondary" />
                    Priority
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    {priorities.map((priority) => (
                      <motion.button
                        key={priority}
                        type="button"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            priority,
                          })
                        }
                        className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200 ${
                          formData.priority === priority
                            ? prioritySelectedStyles[priority]
                            : `border-border-light hover:shadow-sm ${priorityStyles[priority]}`
                        }`}
                      >
                        {priority}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                    <CalendarDays size={16} className="text-text-secondary" />
                    Due Date
                  </label>

                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-3">
                    <Tag size={16} className="text-text-secondary" />
                    Tag
                  </label>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag) => (
                      <motion.button
                        key={tag}
                        type="button"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            tag,
                          })
                        }
                        className={`rounded-full px-4 py-2 text-sm transition-all duration-200 border ${
                          formData.tag === tag
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "border-border-light hover:bg-primary/5 hover:border-primary/30"
                        }`}
                      >
                        {tag}
                      </motion.button>
                    ))}
                  </div>

                  <p className="text-xs text-text-secondary mb-2">Or type your own tag:</p>
                  <input
                    name="tag"
                    value={formData.tag}
                    onChange={handleChange}
                    placeholder="Custom tag..."
                    className={inputClass}
                  />
                </div>
              </form>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-border-light px-7 py-5 flex justify-between items-center">
                <p className="text-sm text-text-secondary">
                  All fields can be edited later.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-border-light hover:bg-slate-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-95"
                  >
                    Cancel
                  </button>

                  <motion.button
                    type="submit"
                    onClick={handleSubmit}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-7 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-all duration-200 shadow-sm hover:shadow-lg active:scale-95"
                  >
                    Create Task
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}