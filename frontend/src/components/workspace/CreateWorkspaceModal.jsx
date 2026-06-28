import { motion, AnimatePresence } from "framer-motion";
import { X, Type, FileText, FolderKanban } from "lucide-react";
import { useState } from "react";

export default function CreateWorkspaceModal({
  isOpen,
  onClose,
  onCreate,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: description.trim() });
    setName("");
    setDescription("");
    onClose();
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
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <FolderKanban size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Create Workspace</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Create a collaborative workspace for your team.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl hover:bg-slate-100 transition flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ===== SCROLLABLE BODY ===== */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
                {/* Workspace Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Type size={16} className="text-slate-400" />
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design Team, SOC Project"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    placeholder="What's this workspace about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={inputClass}
                    maxLength={250}
                  />
                  {/* Character counter */}
                  <p className="text-xs text-slate-500 mt-1.5 text-right">
                    {description.length}/250
                  </p>
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
                  disabled={!name.trim()}
                  className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Workspace
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}