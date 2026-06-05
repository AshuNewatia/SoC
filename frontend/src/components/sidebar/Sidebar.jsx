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
    <aside className="w-72 h-screen bg-surface border-r border-border-light flex flex-col overflow-y-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-border-light">
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

      {/* Navigation */}
      <div className="px-4 py-5 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-semibold transition-all">
          <LayoutDashboard size={18} />
          Overview
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg-light hover:shadow-sm transition-all">
          <KanbanSquare size={18} />
          My Board
        </button>
      </div>

      {/* Workspaces */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-widest text-text-secondary">Workspaces</h3>
          <button className="text-primary hover:bg-primary/10 p-1 rounded-md transition">
            <Plus size={16} />
          </button>
        </div>
        <div className="space-y-2">
          {workspaces.map((workspace) => (
            <button
              key={workspace}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-light hover:bg-white hover:shadow-sm transition-all">
              <FolderKanban size={18} />
              {workspace}
            </button>
          ))}
        </div>
        <button className="mt-4 text-primary font-medium flex items-center gap-2">
          See More
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto px-4 pb-6">
        <div className="border-t border-border-light pt-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg-light transition">
            <BarChart3 size={18} />
            Analytics
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg-light transition">
            <Settings size={18} />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}