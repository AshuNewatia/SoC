import { FolderKanban } from "lucide-react";

export default function WorkspaceHero({ workspace }) {
  return (
    <div className="bg-gradient-to-r from-white to-sky-50 rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        {/* Left Side */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FolderKanban size={22} className="text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 truncate">
                {workspace.name}
              </h1>
              <p className="text-sm text-slate-500 truncate">
                {workspace.description}
              </p>
            </div>
          </div>
          
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-sm font-medium text-slate-600">
            <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5">
              <span>👥</span> {workspace.memberCount} Members
            </div>
            <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5">
              <span>📋</span> {workspace.taskCount} Tasks
            </div>
            <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200/60 flex items-center gap-1.5">
              GitHub Connected
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="hidden sm:flex flex-col items-end gap-2 flex-shrink-0">
          <div className="px-2.5 py-1 rounded-md bg-slate-100 text-xs text-slate-500 font-medium border border-slate-200/40">
            Updated {workspace.updatedAt}
          </div>
          <div className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold shadow-sm tracking-wide uppercase">
            {workspace.isActive || "Active"}
          </div>
        </div>
      </div>
    </div>
  );
}