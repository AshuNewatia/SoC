// src/components/workspace/WorkspaceHero.jsx
import { FolderKanban, Settings, Users, ListTodo, GitBranch } from "lucide-react";

export default function WorkspaceHero({
  workspace,
  onSettingsClick,
  tasks,
  onlineUsers = []
}) {
  if (!workspace) return null;

  const memberCount = workspace.members?.length || 0;

  return (
    <div className="bg-linear-to-r from-white to-sky-50 rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        {/* Left Side */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FolderKanban size={18} className="text-primary md:text-[22px]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-bold tracking-tight text-slate-800 truncate">
                {workspace.name || "Untitled Workspace"}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 truncate">
                {workspace.description || "No description"}
              </p>
            </div>
          </div>

          {/* Metadata Badges – responsive sizes */}
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-3 md:mt-4 text-xs md:text-sm font-medium text-slate-600">
            <div className="px-2 md:px-3 py-1 md:py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-1 md:gap-1.5">
              <Users size={14} className="text-indigo-500 md:text-[16px]" />
              <span>{memberCount} {memberCount === 1 ? "Member" : "Members"}</span>
            </div>
            <div className="px-2 md:px-3 py-1 md:py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-1 md:gap-1.5">
              <ListTodo size={14} className="text-primary md:text-[16px]" />
              <span>{tasks} {tasks === 1 ? "Task" : "Tasks"}</span>
            </div>
            {workspace.githubRepo ? (
              <div className="flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200">
                <GitBranch size={12} className="md:text-[14px]" />
  
                <a 
                  href={`https://github.com/${workspace.githubRepo}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline font-medium"
                >
                  {workspace.githubRepo?.split('/')[1] || workspace.githubRepo} Linked
                </a>
              </div>
            ) : (
              <div className="px-2 md:px-3 py-1 md:py-1.5 bg-slate-50 text-slate-500 rounded-lg border border-slate-200 flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs">
                <GitBranch size={12} className="md:text-[14px]" /> Not Linked
              </div>
            )}
          </div>
        </div>

        {/* Right Side – now always visible, with responsive sizing */}
        <div className="flex flex-col items-end gap-1.5 md:gap-2 shrink-0">
          <div className="px-2 md:px-2.5 py-0.5 md:py-1 rounded-md bg-slate-100 text-[10px] md:text-xs text-slate-500 font-medium border border-slate-200/40 whitespace-nowrap">
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
            className="px-2 md:px-3 py-1.5 md:py-2 bg-primary text-white rounded-lg text-[10px] md:text-sm hover:bg-primary-hover transition whitespace-nowrap flex items-center gap-1"
          >
            <Settings size={12} className="md:size-[3.5]" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}