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
import logo from "../../assets/logo.png";

import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
// 👇 1. Import the new Workspace Context
import { useWorkspaces } from "../../context/workspaceContext";
import LogoutModal from "../common/LogoutModal";
import CreateWorkspaceModal from "../workspace/CreateWorkspaceModal";
import { createWorkspace } from "../../services/workspaceServices";

export default function Sidebar({ isOpen = false, onClose = () => { } }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 👇 2. Grab workspaces and the fetch function from Context instead of local state
  const { workspaces, fetchWorkspaces } = useWorkspaces();

  const [createOpen, setCreateOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Handle new workspace creation from the Sidebar's '+' button
  const handleCreateWorkspace = async (data) => {
    try {
      await createWorkspace({
        ...data,
        owner: user.id,
      });

      // 👇 3. Fetch workspaces to update the global context state instantly
      await fetchWorkspaces();
      handleSubmit("Workspace created successfully");
      setCreateOpen(false);
    } catch (err) {
      console.error("Error creating workspace", err);
    }
  };

  // Helper function for NavLink styles
  const getLinkClass = ({ isActive }) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
      ? "bg-primary/15 text-primary font-semibold shadow-sm"
      : "hover:bg-slate-100 hover:shadow-sm text-text-primary"
    }`;

  // Actual logout action triggered by the modal
  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowLogoutModal(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateWorkspace}
      />

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
            <img
              src={logo}
              alt="CampusFlow"
              className="h-11 w-11 rounded-xl object-cover"
            />
            <h1 className="font-bold text-xl text-text-primary">CampusFlow</h1>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition">
            <X size={20} />
          </button>
        </div>

        {/* Desktop logo */}
        <div className="hidden md:flex h-18 px-6 items-center shrink-0 mt-0">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="CampusFlow"
              className="h-11 w-11 rounded-xl object-cover"
            />
            <div>
              <h1 className="font-bold text-xl text-text-primary">CampusFlow</h1>
              <p className="text-xs text-text-secondary">Collaborative Workspace</p>
            </div>
          </div>
        </div>

        <div className="px-4 shrink-0 mt-0">
          <div className="h-px bg-slate-200"></div>
        </div>

        {/* Scrollable content */}
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
              <button
                onClick={() => setCreateOpen(true)}
                className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Dynamic Workspace List */}
            <div className="space-y-2">
              {workspaces.length === 0 ? (
                <div className="text-sm text-slate-500 px-4 py-3">
                  No workspaces found
                </div>
              ) : (
                workspaces.map((workspace) => (
                  <NavLink
                    key={workspace._id}
                    to={`/workspace/${workspace._id}/overview`}
                    onClick={onClose}
                    className={() => {
                      const isWorkspaceActive =
                        location.pathname.startsWith(`/workspace/${workspace._id}`);

                      return `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isWorkspaceActive
                          ? "bg-primary/15 text-primary font-semibold shadow-sm"
                          : "bg-slate-50 hover:bg-white hover:shadow-md hover:-translate-y-0.5 text-text-primary"
                        }`;
                    }}
                  >
                    <FolderKanban size={18} />
                    {workspace.name}
                  </NavLink>
                ))
              )}
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

        {/* Bottom section */}
        <div className="px-4 pb-6 pt-3 border-t border-slate-200 bg-white shrink-0">
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
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all text-left"
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
