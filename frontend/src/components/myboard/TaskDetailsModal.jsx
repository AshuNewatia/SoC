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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
     <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}

        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">
            Task Details
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <input
            name="title"
            value={formData?.title || ""}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          <textarea
            rows={5}
            name="description"
            value={formData?.description || ""}
            onChange={handleChange}
            className="w-full border rounded-xl p-3 resize-none"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <select
              name="priority"
              value={formData?.priority || "Medium"}
              onChange={handleChange}
              className="border rounded-xl p-3"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>


            <div>
  <label className="block mb-2 text-sm font-medium">
    Status
  </label>

  <select
    name="status"
    value={formData?.status || "todo"}
    onChange={handleChange}
    className="w-full border rounded-xl p-3"
  >
    <option value="todo">To Do</option>
    <option value="progress">In Progress</option>
    <option value="completed">Completed</option>
  </select>
</div>

            <input
              type="date"
              name="dueDate"
              value={formData?.dueDate || ""}
              onChange={handleChange}
              className="border rounded-xl p-3"
            />
          </div>

          <input
            name="tag"
            value={formData?.tag || ""}
            onChange={handleChange}
            placeholder="Tag"
            className="w-full border rounded-xl p-3"
          />
          {/* Activity History */}

<div className="mt-6 border-t pt-4">
  <h3 className="font-semibold text-lg mb-3">
    Activity History
  </h3>

  {task.activity?.length ? (
    <div className="space-y-3 max-h-48 overflow-y-auto">
      {task.activity.map((item, index) => (
        <div
          key={index}
          className="border-l-2 border-slate-300 pl-3"
        >
          <p className="text-sm font-medium">
            {item.action}
          </p>

          <span className="text-xs text-slate-500">
            {new Date(
              item.timestamp
            ).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-slate-400">
      No activity recorded yet.
    </p>
  )}
</div>
        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-5 py-3 border rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-3 bg-blue-600 text-white rounded-xl"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}