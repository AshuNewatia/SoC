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
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl">
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

        <div className="p-6 space-y-4">
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