import { FolderKanban } from "lucide-react";

export default function WorkspaceHero({ workspace }) {
  return (
    <div className="bg-gradient-to-r from-white to-sky-50 rounded-3xl p-8 border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between">
        {/* Left Side */}
        <div>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FolderKanban size={26} className="text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{workspace.name}</h1>
              <p className="mt-1 text-lg text-slate-600">{workspace.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <div className="px-4 py-2 bg-white rounded-xl border border-slate-200">
              👥 {workspace.memberCount} Members
            </div>
            <div className="px-4 py-2 bg-white rounded-xl border border-slate-200">
              📋 {workspace.taskCount} Tasks
            </div>
            <div className="px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-200">
              GitHub Connected
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="hidden lg:flex flex-col items-end gap-3">
          <div className="px-4 py-2 rounded-xl bg-white border border-slate-200">
            Updated {workspace.updatedAt}
          </div>
          <div className="px-4 py-2 rounded-xl bg-primary text-white shadow-md">
            {workspace.isActive}
          </div>
        </div>
      </div>
    </div>
  );
}