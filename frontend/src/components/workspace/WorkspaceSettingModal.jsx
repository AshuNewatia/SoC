import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import api from "../../services/api";   
import {
  X,
  Trash2,
  GitBranch,
  FolderKanban,
  FileText,
  AlertTriangle,
  LogOut,
} from "lucide-react";

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
            className="fixed inset-0 bg-black/40 z-100"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-0 flex items-center justify-center z-101 p-4"
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

function LeaveWorkspaceModal({ isOpen, onClose, onConfirm, workspace }) {
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
            className="fixed inset-0 bg-black/40 `z-[110]`"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-0 flex items-center justify-center z-[120] p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                    <LogOut size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Leave Workspace
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
                Are you sure you want to leave:
              </p>
              <p className="mt-2 font-semibold text-slate-800">
                "{workspace.name}"
              </p>
              <p className="mt-1 text-sm text-slate-500">
                You will lose access to all tasks and data inside this workspace.
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-3 rounded-xl bg-orange-600 text-white font-medium hover:bg-orange-700 transition"
                >
                  Leave
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function TransferOwnershipModal({
  isOpen,
  onClose,
  workspace,
  selectedOwner,
  setSelectedOwner,
  onConfirm,
}) {
  if (!workspace) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[130]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[140] p-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6">

              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold">
                  Transfer Ownership
                </h2>

                <button onClick={onClose}>
                  <X size={20}/>
                </button>
              </div>

              <p className="text-sm text-slate-500 mb-4">
                Select the new workspace owner.
              </p>

              <select
                value={selectedOwner}
                onChange={(e)=>setSelectedOwner(e.target.value)}
                className="w-full border rounded-xl px-4 py-3"
              >
                {workspace.members
                  ?.filter(
                    m =>
                      String(m._id || m) !==
                      String(workspace.owner?._id || workspace.owner)
                  )
                  .map(member=>(
                    <option
                      key={member._id}
                      value={member._id}
                    >
                      {member.name}
                    </option>
                  ))}
              </select>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={onClose}
                  className="flex-1 border rounded-xl py-3"
                >
                  Cancel
                </button>

                <button
                  onClick={()=>{
                    onConfirm(selectedOwner);
                    onClose();
                  }}
                  className="flex-1 bg-blue-600 text-white rounded-xl py-3"
                >
                  Transfer
                </button>

              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function WorkspaceSettingsModal({
  isOpen,
  onClose,
  workspace,
  onSave,
  onDelete,
  isCreator,
  onTransferOwnership,
}) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [githubRepo, setGithubRepo] = useState(workspace?.githubRepo || "");
  const [githubToken, setGithubToken] = useState(workspace?.githubToken || "");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState("");
  const [showGuide, setShowGuide] = useState(false);


  useEffect(() => {
  if (workspace) {
    setName(workspace.name || "");
    setDescription(workspace.description || "");
    setGithubRepo(workspace.githubRepo || "");
    setGithubToken(workspace.githubToken || "");
    setError("");

    if (workspace.members?.length) {
      const firstMember = workspace.members.find(
        (member) =>
          String(member._id || member) !==
          String(workspace.owner?._id || workspace.owner)
      );

      setSelectedOwner(firstMember?._id || firstMember || "");
    }
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

  const handleLeaveConfirm = async () => {
    setLeaveModalOpen(false);
    setLeaveLoading(true);
    setError("");

    try {
      const response = await api.post(
  `/api/workspaces/${workspace._id}/leave`
);

      if (response.data.success) {
        onClose();
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Failed to leave workspace:", err);
      setError(err.response?.data?.message || "An error occurred while leaving.");
    } finally {
      setLeaveLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

  if (!isOpen || !workspace) return null;


  return (
    <>
      <DeleteWorkspaceModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={onDelete}
        workspace={workspace}
      />

      <LeaveWorkspaceModal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        onConfirm={handleLeaveConfirm}
        workspace={workspace}
      />

      <TransferOwnershipModal
  isOpen={transferModalOpen}
  onClose={() => setTransferModalOpen(false)}
  workspace={workspace}
  selectedOwner={selectedOwner}
  setSelectedOwner={setSelectedOwner}
  onConfirm={onTransferOwnership}
/>

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
        className="fixed inset-0 z-[60] flex items-center justify-center p-5"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        >
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
          <form
            id="workspace-settings-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-7 py-6 space-y-7"
          >
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-2xl flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                {error}
              </div>
            )}
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
            {/* ===== GITHUB INTEGRATION CONTAINER ===== */}
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

  {/* GitHub Repository Input */}
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

  {/* Personal Access Token Input */}
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

  {/* Collapsible Accordion Guide */}
  <div className="border border-slate-200 bg-white rounded-xl overflow-hidden mt-2">
    <button
      type="button"
      onClick={() => setShowGuide(!showGuide)}
      className="w-full px-3 py-2 bg-slate-100/70 hover:bg-slate-100 flex items-center justify-between transition text-left"
    >
      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
        How to link repository?
      </span>
      <span className="text-[10px] text-slate-400 font-semibold">
        {showGuide ? "Hide Steps ▲" : "Show Steps ▼"}
      </span>
    </button>

    {showGuide && (
      <div className="p-3 border-t border-slate-100 bg-white text-[11px] text-slate-500 space-y-2.5 leading-relaxed">
        <div>
          <span className="font-bold text-slate-700 block">1. Repository Format</span>
          <p>Provide the core repository pathway without web prefixes. E.g. <code className="font-semibold text-slate-700">AshuNewatia/CampusFlow</code>.</p>
        </div>
        <div className="border-t border-slate-100 pt-1.5">
          <span className="font-bold text-slate-700 block">2. Classic Tokens</span>
          <p>Create a classic token target inside GitHub profile Settings → Developer Settings → Personal Access Tokens.</p>
        </div>
        <div className="border-t border-slate-100 pt-1.5">
          <span className="font-bold text-slate-700 block">3. Token Scopes</span>
          <p>Check the explicit <strong className="text-primary">repo</strong> permission box, click generate, copy the code string, and paste it above.</p>
        </div>

        {/* Dynamic Relative Asset PDF Link */}
        <div className="border-t border-slate-100 pt-2 flex justify-start">
          <a
            href="/github-setup.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline transition"
          >
            Open Complete Setup PDF Guide →
          </a>
        </div>
      </div>
    )}
  </div>
</div>
          </form>


<div className="sticky bottom-0 bg-white border-t border-slate-200 px-7 py-5">

  <div className="mb-5">

    <div className="flex flex-wrap gap-3">

      <button
        type="button"
        onClick={() => setDeleteModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition font-medium text-sm"
      >
        <Trash2 size={16} />
        Delete Workspace
      </button>

      <button
        type="button"
        onClick={() => setTransferModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition font-medium text-sm"
      >
        <GitBranch size={16} />
        Transfer Ownership
      </button>

      <button
        type="button"
        disabled={leaveLoading}
        onClick={() => setLeaveModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition font-medium text-sm disabled:opacity-50"
      >
        <LogOut size={16} />
        {leaveLoading ? "Leaving..." : "Leave Workspace"}
      </button>

    </div>
  </div>

  <div className="flex justify-end gap-3">

    <button
      type="button"
      onClick={onClose}
      className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition font-medium text-sm"
    >
      Cancel
    </button>

    <button
      type="submit"
      form="workspace-settings-form"
      className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover transition font-medium text-sm"
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