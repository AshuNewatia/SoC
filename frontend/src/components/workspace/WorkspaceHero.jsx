import { FolderKanban, Settings, GitBranch } from "lucide-react";

export default function WorkspaceHero({ workspace, onSettingsClick }) {
  if (!workspace) return null;

  const memberCount = workspace.members?.length || 0;
  const taskCount = workspace.tasks?.length || workspace.taskCount || 0;

  return (
    <div className="bg-linear-to-r from-white to-sky-50 rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        {/* Left Side */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FolderKanban size={22} className="text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 truncate">
                {workspace.name || "Untitled Workspace"}
              </h1>
              <p className="text-sm text-slate-500 truncate">
                {workspace.description || "No description"}
              </p>
            </div>
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-sm font-medium text-slate-600">
            <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5">
              <span>👥</span> {memberCount} {memberCount === 1 ? "Member" : "Members"}
            </div>
            <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5">
              <span>📋</span> {taskCount} {taskCount === 1 ? "Task" : "Tasks"}
            </div>
            
            {/* Dynamic GitHub Badge */}
            {workspace.githubRepo ? (
              <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-1.5 text-xs font-semibold">
                <GitBranch size={14} /> 
                {workspace.githubRepo.split('/')[1] || workspace.githubRepo} Linked
              </div>
            ) : (
              <div className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg border border-slate-200 flex items-center gap-1.5 text-xs">
                <GitBranch size={14} /> Not Linked
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
          <div className="px-2.5 py-1 rounded-md bg-slate-100 text-xs text-slate-500 font-medium border border-slate-200/40">
            Updated{" "}
            {workspace.updatedAt
              ? new Date(workspace.updatedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
              : "Recently"}
          </div>
          <button
            onClick={onSettingsClick}
            className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition"
          >
            <Settings size={14} className="inline mr-1" />
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}