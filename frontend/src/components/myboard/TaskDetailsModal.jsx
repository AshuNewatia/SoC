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
      [e.target.name]:
        e.target.value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="
          bg-white
          rounded-3xl
          shadow-2xl
          w-full
          max-w-3xl
          max-h-[90vh]
          flex
          flex-col
          overflow-hidden
        "
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Edit Task
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Update task details and keep your team aligned.
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              p-2
              rounded-xl
              hover:bg-slate-100
              transition
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Task Title
            </label>

            <input
              name="title"
              value={
                formData?.title || ""
              }
              onChange={
                handleChange
              }
              className="
                w-full
                border
                border-slate-300
                rounded-2xl
                px-4
                py-3
                focus:outline-none
                focus:ring-2
                focus:ring-sky-500
              "
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>

            <textarea
              rows={4}
              name="description"
              value={
                formData?.description ||
                ""
              }
              onChange={
                handleChange
              }
              className="
                w-full
                border
                border-slate-300
                rounded-2xl
                px-4
                py-3
                resize-none
                focus:outline-none
                focus:ring-2
                focus:ring-sky-500
              "
            />
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priority
              </label>

              <select
                name="priority"
                value={
                  formData?.priority ||
                  "Medium"
                }
                onChange={
                  handleChange
                }
                className="
                  w-full
                  border
                  border-slate-300
                  rounded-2xl
                  px-4
                  py-3
                  focus:outline-none
                  focus:ring-2
                  focus:ring-sky-500
                "
              >
                <option>
                  Low
                </option>

                <option>
                  Medium
                </option>

                <option>
                  High
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>

              <select
                name="status"
                value={
                  formData?.status ||
                  "todo"
                }
                onChange={
                  handleChange
                }
                className="
                  w-full
                  border
                  border-slate-300
                  rounded-2xl
                  px-4
                  py-3
                  focus:outline-none
                  focus:ring-2
                  focus:ring-sky-500
                "
              >
                <option value="todo">
                  To Do
                </option>

                <option value="progress">
                  In Progress
                </option>

                <option value="done">
                  Completed
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Due Date
              </label>

              <input
                type="date"
                name="dueDate"
                value={
                  formData?.dueDate ||
                  ""
                }
                onChange={
                  handleChange
                }
                className="
                  w-full
                  border
                  border-slate-300
                  rounded-2xl
                  px-4
                  py-3
                  focus:outline-none
                  focus:ring-2
                  focus:ring-sky-500
                "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Team / Tag
              </label>

              <input
                name="tag"
                value={
                  formData?.tag || ""
                }
                onChange={
                  handleChange
                }
                placeholder="Backend"
                className="
                  w-full
                  border
                  border-slate-300
                  rounded-2xl
                  px-4
                  py-3
                  focus:outline-none
                  focus:ring-2
                  focus:ring-sky-500
                "
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            flex
            justify-end
            gap-3
            p-6
            border-t
            bg-slate-50
          "
        >
          <button
            onClick={onClose}
            className="
              px-5
              py-3
              rounded-2xl
              border
              border-slate-300
              hover:bg-white
              transition
            "
          >
            Cancel
          </button>

          <button
            onClick={
              handleSubmit
            }
            className="
              px-6
              py-3
              rounded-2xl
              bg-sky-500
              text-white
              font-medium
              hover:bg-sky-600
              transition
              shadow-md
            "
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}