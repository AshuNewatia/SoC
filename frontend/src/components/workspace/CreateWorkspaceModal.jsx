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
  const [githubRepo, setGithubRepo] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 bg-white";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreate({ 
      name: name.trim(), 
      description: description.trim(),
      githubRepo: githubRepo.trim(),
      githubToken: githubToken.trim()
    });

    setName("");
    setDescription("");
    setGithubRepo("");
    setGithubToken("");
    setShowGuide(false);
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
            className="fixed inset-0 bg-black/40 z-100"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-110 flex items-center justify-center p-5"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
            >
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

              <form 
                id="create-workspace-form"
                onSubmit={handleSubmit} 
                className="flex-1 overflow-y-auto px-7 py-6 space-y-6"
              >

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

                {/* ===== OPTIONAL INTEGRATION DIVIDER ===== */}
                <div className="my-5 relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400 font-semibold">Optional Integration</span>
                  </div>
                </div>

                {/* GitHub Fields Block Container */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                    <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Link GitHub Repository</h4>
                  </div>

                  {/* Repo Name Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">GitHub Repository Path</label>
                    <input
                      type="text"
                      placeholder="e.g., AshuNewatia/CampusFlow"
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Format: owner/repository-name</p>
                  </div>

                  {/* Token Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Personal Access Token (PAT)</label>
                    <input
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxxxxx"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                    />
                  </div>

                  {/* Collapsible Accordion Guide */}
                  <div className="border border-slate-200 bg-white rounded-lg overflow-hidden mt-2">
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
                          <p>Provide the core extension directory layout without web prefixes. E.g. <code className="font-semibold text-slate-700">AshuNewatia/CampusFlow</code>.</p>
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

              {/* ===== FIXED FOOTER ===== */}
              <div className="sticky bottom-0 bg-white border-t border-slate-200 px-7 py-5 flex justify-end gap-3 z-20">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="create-workspace-form"
                  disabled={!name.trim()}
                  className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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