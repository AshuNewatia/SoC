import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  X,
  Trash2,
  GitBranch,
  FolderKanban,
  FileText,
  AlertTriangle,
} from "lucide-react";

// ----- Delete Confirmation Modal (reusable pattern) -----
function DeleteWorkspaceModal({ isOpen, onClose, onConfirm, workspace }) {
  if (!workspace) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-100 text-red-600">
                    <AlertTriangle size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Delete Workspace
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-slate-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="mt-4 text-slate-600">
                Are you sure you want to delete:
              </p>
              <p className="mt-2 font-semibold text-slate-800">
                "{workspace.name}"
              </p>
              <p className="mt-1 text-sm text-slate-500">
                All tasks and data will be permanently removed.
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ----- Main Component -----
export default function WorkspaceSettingsModal({
  isOpen,
  onClose,
  workspace,
  onSave,
  onDelete,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name || "");
      setDescription(workspace.description || "");
      setGithubRepo(workspace.githubRepo || "");
      setGithubToken(workspace.githubToken || "");
    }
  }, [workspace]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name,
      description,
      githubRepo,
      githubToken,
    });
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

  if (!isOpen || !workspace) return null;

  return (
    <>
      {/* Delete Confirmation Modal */}
      <DeleteWorkspaceModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={onDelete}
        workspace={workspace}
      />

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
                <div className="sticky top-0 bg-white border-b border-slate-200 px-7 py-5 z-20">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-900">
                        Workspace Settings
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Manage workspace details and GitHub integration.
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

                {/* ===== SCROLLABLE BODY ===== */}
                <form
                  onSubmit={handleSubmit}
                  className="flex-1 overflow-y-auto px-7 py-6 space-y-7"
                >
                  {/* Workspace Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <FolderKanban size={16} className="text-primary" />
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                      required
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      This name will be visible to all workspace members.
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <FileText size={16} className="text-primary" />
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <hr className="border-slate-200" />

                  {/* GitHub Integration Section Card */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch size={18} className="text-primary" />
                      <h3 className="font-semibold text-slate-800">
                        GitHub Integration
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500">
                      Link this workspace to a GitHub repository to automatically sync task cards with repository issues.
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        GitHub Repository
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., AshuNewatia/CampusFlow"
                        value={githubRepo}
                        onChange={(e) => setGithubRepo(e.target.value)}
                        className={inputClass}
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Format: owner/repository-name
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Personal Access Token (Classic)
                      </label>
                      <input
                        type="password"
                        placeholder="ghp_xxxxxxxxxxxxxxx"
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        className={inputClass}
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Needs <span className="font-semibold">repo</span> permissions to create and manage issues.
                      </p>
                    </div>
                  </div>
                </form>

                {/* ===== FIXED FOOTER ===== */}
                <div className="sticky bottom-0 bg-white border-t border-slate-200 px-7 py-5 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition font-medium"
                  >
                    <Trash2 size={16} />
                    Delete Workspace
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover transition font-medium"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}