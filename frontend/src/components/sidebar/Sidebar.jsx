import {
  FolderKanban,
  LayoutDashboard,
  KanbanSquare,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  ChevronRight,
} from "lucide-react";

const workspaces = [
  "CS301 Project",
  "AI Research Lab",
  "Tech Fest",
];

export default function Sidebar() {
  return (
    <aside className="w-72 h-screen bg-white shadow-md relative z-30 flex flex-col">
      {/* Logo */}
      <div className="h-[72px] px-6 flex items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-lg shadow-md">
            C
          </div>
          <div>
            <h1 className="font-bold text-xl text-text-primary">CampusFlow</h1>
            <p className="text-xs text-text-secondary">Collaborative Workspace</p>
          </div>
        </div>
      </div>

      {/* Divider aligned with header */}
      <div className="px-4">
        <div className="h-px bg-slate-200"></div>
      </div>

      {/* Navigation */}
      <div className="px-4 py-5 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/15 text-primary font-semibold shadow-sm transition-all">
          <LayoutDashboard size={18} />
          Overview
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 hover:shadow-sm transition-all duration-200">
          <KanbanSquare size={18} />
          My Board
        </button>
      </div>

      {/* Workspaces */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-widest text-text-secondary">Workspaces</h3>
          <button className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition">
            <Plus size={16} />
          </button>
        </div>
        <div className="space-y-2">
          {workspaces.map((workspace) => (
            <button
              key={workspace}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <FolderKanban size={18} />
              {workspace}
            </button>
          ))}
        </div>
        <button className="mt-4 text-primary font-medium flex items-center gap-2 hover:gap-3 transition-all">
          See More
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto px-4 pb-6">
        <div className="border-t border-slate-200 pt-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 hover:shadow-sm transition-all">
            <BarChart3 size={18} />
            Analytics
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 hover:shadow-sm transition-all">
            <Settings size={18} />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}