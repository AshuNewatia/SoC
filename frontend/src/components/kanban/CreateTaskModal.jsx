import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Type, FileText, CalendarDays, Flag, Users } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { useParams } from "react-router-dom";

const initialForm = {
  title: "",
  description: "",
  priority: "Medium",
  dueDate: "",
  assignedTo: [],
  status: "todo",
};

export default function CreateTaskModal({ isOpen, onClose, onCreate, defaultStatus = "todo" }) {
  const [form, setForm] = useState(initialForm);
  const [members, setMembers] = useState([]);
  const [searchMember, setSearchMember] = useState("");
  const { id: workspaceId } = useParams();

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchMember.toLowerCase())
  );

  const toggleMember = (memberId) => {
    setForm(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(memberId)
        ? prev.assignedTo.filter(id => id !== memberId)
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
    if (!form.title.trim()) return;
    onCreate({
      title: form.title,
      description: form.description,
      priority: form.priority,
      dueDate: form.dueDate,
      assignedTo: form.assignedTo,
    });
    setForm(initialForm);
    onClose();
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

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
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-5"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* ===== STICKY HEADER ===== */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-7 py-5 z-20 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Create Task</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Organize your work with priorities, assignees and deadlines.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl hover:bg-slate-100 transition flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ===== SCROLLABLE BODY ===== */}
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto px-7 py-6 space-y-6"
              >
                {/* Title */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Type size={16} className="text-slate-400" />
                    Title
                  </label>
                  <input
                    required
                    placeholder="Task Title"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <FileText size={16} className="text-slate-400" />
                    Description
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Priority – now with Critical and 4 columns */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                    <Flag size={16} className="text-slate-400" />
                    Priority
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {["Low", "Medium", "High", "Critical"].map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => handleChange("priority", priority)}
                        className={`rounded-xl border px-3 py-3 text-sm font-medium transition
                          ${
                            form.priority === priority
                              ? "bg-primary text-white border-primary"
                              : "border-slate-200 hover:border-primary"
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
                    value={form.dueDate}
                    onChange={(e) => handleChange("dueDate", e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Assign Members */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                    <Users size={16} className="text-slate-400" />
                    Assign Members
                  </label>

                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                    className={inputClass}
                  />

                  {/* Selected members chips */}
                  {form.assignedTo.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {members
                        .filter(member => form.assignedTo.includes(member._id))
                        .map(member => (
                          <div
                            key={member._id}
                            className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                          >
                            {member.name}
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="max-h-48 overflow-y-auto border rounded-xl divide-y divide-slate-100 mt-3">
                    {filteredMembers.map((member) => {
                      const selected = form.assignedTo.includes(member._id);
                      return (
                        <button
                          key={member._id}
                          type="button"
                          onClick={() => toggleMember(member._id)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                              {member.name?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{member.name}</p>
                              <p className="text-xs text-slate-500">Team Member</p>
                            </div>
                          </div>
                          <div
                            className={`
                              h-5 w-5 rounded-md border flex items-center justify-center
                              ${selected ? "bg-primary border-primary" : "border-slate-300"}
                            `}
                          >
                            {selected && <Check size={14} className="text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </form>

              {/* ===== FIXED FOOTER ===== */}
              <div className="sticky bottom-0 bg-white border-t border-slate-200 px-7 py-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!form.title.trim()}
                  className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Task
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}