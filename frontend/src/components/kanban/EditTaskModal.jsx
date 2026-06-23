import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

export default function EditTaskModal({ task, isOpen, onClose, onSave }) {
  const { id: workspaceId } = useParams();
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignee: "",
    priority: "Medium",
    dueDate: "",
    assignedTo: [],
  });
  const [members, setMembers] = useState([]);
  const [searchMember, setSearchMember] = useState("");

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchMember.toLowerCase())
  );

  const toggleMember = (memberId) => {
    setForm((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(memberId)
        ? prev.assignedTo.filter((id) => id !== memberId)
        : [...prev.assignedTo, memberId],
    }));
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get(`/api/workspaces/${workspaceId}/members`);
        setMembers(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (task && isOpen) {
      fetchMembers();
      setForm({
        title: task.title || "",
        description: task.description || "",
        assignedTo: task.assignedTo?.map((user) => user._id) || [],
        priority: task.priority || "Medium",
        dueDate: task.dueDate?.split("T")[0] || "",
        githubIssue: task.githubIssue || "",
      });
    }
  }, [task, isOpen, workspaceId]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...task, ...form });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && task && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Edit Task</h2>
                <p className="text-sm text-slate-500">Update task details and assignments</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                placeholder="Task Title"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3"
              />

              <textarea
                required
                rows="4"
                placeholder="Description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3"
              />

              <div className="space-y-3">
                <label className="font-medium text-slate-700">Assigned Members</label>
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3"
                />
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                  {filteredMembers.map((member) => {
                    const selected = form.assignedTo.includes(member._id);
                    return (
                      <button
                        key={member._id}
                        type="button"
                        onClick={() => toggleMember(member._id)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                      >
                        <span>{member.name}</span>
                        <span>{selected ? "✅" : "⬜"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <select
                value={form.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>

              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3"
              />

              <input
                placeholder="GitHub Issue"
                value={form.githubIssue}
                onChange={(e) => handleChange("githubIssue", e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-slate-200 py-3 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 text-white py-3 rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}