import { useEffect, useState } from "react";
import { Trash2, X, GitBranch } from "lucide-react";

export default function WorkspaceSettingsModal({
  isOpen,
  onClose,
  workspace,
  onSave,
  onDelete,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  // Add state for GitHub integration fields
  const [githubRepo, setGithubRepo] = useState("");
  const [githubToken, setGithubToken] = useState("");

  useEffect(() => {
    if (workspace) {
      setName(workspace.name || "");
      setDescription(workspace.description || "");
      setGithubRepo(workspace.githubRepo || "");
      
      // We usually don't send the raw token back from the database for security reasons,
      // but if you do, populate it. Otherwise, leave it blank for them to update.
      setGithubToken(workspace.githubToken || ""); 
    }
  }, [workspace]);

  if (!isOpen || !workspace) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Pass the new GitHub data up to the parent component
    onSave({
      name,
      description,
      githubRepo,
      githubToken,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">Workspace Settings</h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* General Settings Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* GitHub Integration Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800">
                <GitBranch size={20} />
                <h3 className="font-semibold text-lg">GitHub Integration</h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Link this workspace to a GitHub repository to automatically sync task cards with repository issues.
              </p>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  GitHub Repository
                </label>
                <input
                  type="text"
                  placeholder="e.g., AshuNewatia/CampusFlow"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  Personal Access Token (Classic)
                </label>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Needs <span className="font-semibold text-slate-500">repo</span> permissions to create and manage issues.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Delete this workspace permanently?")) {
                  onDelete();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
            >
              <Trash2 size={16} />
              Delete Workspace
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl transition-colors text-sm font-medium shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}