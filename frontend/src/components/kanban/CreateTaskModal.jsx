import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { useParams } from "react-router-dom";

const initialForm = {
  title: "",
  description: "",
  assignee: "",
  priority: "Medium",
  dueDate: "",
  githubIssue: "",
  status: "todo",
  assignedTo: [],
};

export default function CreateTaskModal({ isOpen, onClose, onCreate, defaultStatus = "todo" }) {
  const [form, setForm] = useState(initialForm);
  const [members, setMembers] = useState([]);
  const [searchMember, setSearchMember] = useState("");
  const { id: workspaceId } = useParams();

  const filteredMembers =
    members.filter(member =>
      member.name
        .toLowerCase()
        .includes(
          searchMember.toLowerCase()
        )
    );

  const toggleMember = (memberId) => {
    setForm(prev => ({
      ...prev,
      assignedTo:
        prev.assignedTo.includes(memberId)
          ? prev.assignedTo.filter(
            id => id !== memberId
          )
          : [...prev.assignedTo, memberId]
    }));
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get(
          `/workspaces/${workspaceId}/members`
        );

        setMembers(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (isOpen) {
      fetchMembers();

      setForm({
        ...initialForm,
        status: defaultStatus,
      });
    }
  }, [isOpen, defaultStatus, workspaceId]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    onCreate({
      title: form.title,
      description: form.description,
      priority: form.priority,
      dueDate: form.dueDate,
      assignedTo: form.assignedTo,
      // comments: 0,
      // attachments: 0,
      // githubIssue: `#${Math.floor(Math.random() * 100)}`,
    });
    setForm(initialForm);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Create Task</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                placeholder="Task Title"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900"
              />
              <textarea
                required
                rows="4"
                placeholder="Description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900"
              />
              <select
                value={form.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900"
              />
              <div className="space-y-3">
                <label className="font-medium">
                  Assign Members
                </label>

                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchMember}
                  onChange={(e) =>
                    setSearchMember(e.target.value)
                  }
                  className="w-full border border-slate-200 rounded-xl p-3"
                />

                <div className="max-h-48 overflow-y-auto border rounded-xl">
                  {filteredMembers.map((member) => {
                    const selected =
                      form.assignedTo.includes(
                        member._id
                      );

                    return (
                      <button
                        key={member._id}
                        type="button"
                        onClick={() =>
                          toggleMember(member._id)
                        }
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                      >
                        <span>
                          {member.name}
                        </span>

                        <span>
                          {selected ? "✅" : "⬜"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* <input
                placeholder="GitHub Issue (optional)"
                value={form.githubIssue}
                onChange={(e) => handleChange("githubIssue", e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-900"
              /> */}
              <button
                type="submit"
                disabled={!form.title.trim() || !form.description.trim()}
                className="w-full bg-slate-900 text-white py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition"
              >
                Create Task
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}