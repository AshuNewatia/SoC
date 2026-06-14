import {
  FolderKanban,
  LayoutDashboard,
  KanbanSquare,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  ChevronRight,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { workspaces } from "../../data/workspaces";

export default function Sidebar({ isOpen = false, onClose = () => { } }) {
  // Helper function to get NavLink classes based on active state
  const getLinkClass = ({ isActive }) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
      ? "bg-primary/15 text-primary font-semibold shadow-sm"
      : "hover:bg-slate-100 hover:shadow-sm text-text-primary"
    }`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 w-72 bg-white shadow-md z-50 flex flex-col h-screen
          transition-transform duration-300 ease-in-out
          md:sticky md:top-0 md:translate-x-0 md:z-30
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-lg shadow-md">
              C
            </div>
            <h1 className="font-bold text-xl text-text-primary">CampusFlow</h1>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition">
            <X size={20} />
          </button>
        </div>

        {/* Desktop logo  */}
        <div className="hidden md:flex h-[72px] px-6 items-center flex-shrink-0">
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

        <div className="px-4 flex-shrink-0">
          <div className="h-px bg-slate-200"></div>
        </div>

        {/* Scrollable content inside the sidebar */}
        <div className="flex-1 overflow-y-auto minimalist-scrollbar">
          <div className="px-4 py-5 space-y-2">
            <NavLink to="/dashboard" className={getLinkClass} onClick={onClose}>
              <LayoutDashboard size={18} />
              Overview
            </NavLink>
            <NavLink to="/MyBoard" className={getLinkClass} onClick={onClose}>
              <KanbanSquare size={18} />
              My Board
            </NavLink>
            
          </div>

          <div className="px-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-widest text-text-secondary">Workspaces</h3>
              <button className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition">
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {workspaces.map((workspace) => (
                <NavLink
                  key={workspace.id}
                  to={`/workspace/${workspace.id}/overview`}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-primary/15 text-primary font-semibold shadow-sm"
                        : "bg-slate-50 hover:bg-white hover:shadow-md hover:-translate-y-0.5 text-text-primary"
                    }`
                  }
                >
                  <FolderKanban size={18} />
                  {workspace.name}
                </NavLink>
              ))}
            </div>

            <button 
              className="mt-4 mb-6 text-primary font-medium flex items-center gap-2 hover:gap-3 transition-all"
              onClick={onClose}
            >
              See More
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Bottom section (Stays anchored to the bottom) */}
        <div className="px-4 pb-6 pt-3 border-t border-slate-200 bg-white flex-shrink-0">
          <div className="space-y-2">
            <NavLink to="/Analytics" className={getLinkClass} onClick={onClose}>
              <BarChart3 size={18} />
              Analytics
            </NavLink>
            <NavLink to="/Settings" className={getLinkClass} onClick={onClose}>
              <Settings size={18} />
              Settings
            </NavLink>
            <button 
              onClick={onClose}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}