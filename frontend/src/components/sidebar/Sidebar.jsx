import {
  FolderKanban,
  LayoutDashboard,
  KanbanSquare,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  X,
} from "lucide-react";
import logo from "../../assets/logo.png";

import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useWorkspaces } from "../../context/workspaceContext";
import LogoutModal from "../common/LogoutModal";
import CreateWorkspaceModal from "../workspace/CreateWorkspaceModal";
import { createWorkspace } from "../../services/workspaceServices";

export default function Sidebar({ isOpen = false, onClose = () => { }, workspaceSearch = "" }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { workspaces, fetchWorkspaces } = useWorkspaces();

  const [createOpen, setCreateOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleCreateWorkspace = async (data) => {
    try {
      const res = await createWorkspace({
        ...data,
        owner: user.id,
      });
      await fetchWorkspaces();

      setCreateOpen(false);

      const workspaceId = res._id || res?.data?._id;

      if (workspaceId) {
        navigate(`/workspace/${workspaceId}/overview`);

        window.dispatchEvent(new CustomEvent("workspaceListChanged"));
      } else {
        console.warn("No workspace ID returned; navigation skipped.");
      }
    } catch (err) {
      console.error("Error creating workspace", err);
    }
  };

  const getLinkClass = ({ isActive }) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
      ? "bg-primary/15 text-primary font-semibold shadow-sm"
      : "hover:bg-slate-100 hover:shadow-sm text-text-primary"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowLogoutModal(false);
  };

  const sortedWorkspaces = [...workspaces].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  const filteredWorkspaces = sortedWorkspaces.filter((workspace) =>
    workspace.name
      .toLowerCase()
      .includes(workspaceSearch.toLowerCase())
  );
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

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
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* ========== FIXED TOP SECTION ========== */}
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

        {/* Top nav – Overview & My Board */}
        <div className="px-4 py-5 space-y-2 shrink-0">
          <NavLink to="/dashboard" className={getLinkClass} onClick={onClose}>
            <LayoutDashboard size={18} />
            Overview
          </NavLink>
          <NavLink to="/MyBoard" className={getLinkClass} onClick={onClose}>
            <KanbanSquare size={18} />
            My Board
          </NavLink>
        </div>

        {/* Workspace header – fixed */}
        <div className="px-4 mb-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs uppercase tracking-widest text-text-secondary">
                Workspaces
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                {workspaces.length}
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                setTimeout(() => {
                  setCreateOpen(true);
                }, 300);
              }}
              className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>

        {/* ========== SCROLLABLE WORKSPACE LIST ========== */}
        <div className="flex-1 overflow-y-auto px-4 pr-3 minimalist-scrollbar">
          <div className="space-y-2 pb-4">
            {workspaces.length === 0 ? (
              <div className="text-sm text-slate-500 px-4 py-3">
                {workspaceSearch
                  ? `No workspace found for "${workspaceSearch}"`
                  : "No workspaces found"}
              </div>
            ) : (
              filteredWorkspaces.map((workspace) => (
                <NavLink
                  key={workspace._id}
                  to={`/workspace/${workspace._id}/overview`}
                  onClick={onClose}
                  className={() => {
                    const isWorkspaceActive = location.pathname.startsWith(
                      `/workspace/${workspace._id}`
                    );
                    return `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 ${isWorkspaceActive
                      ? "bg-primary/15 text-primary font-semibold shadow-sm"
                      : "bg-slate-50 hover:bg-white hover:shadow-md hover:-translate-y-0.5 text-text-primary"
                      }`;
                  }}
                >
                  <FolderKanban size={16} />
                  {workspace.name}
                </NavLink>
              ))
            )}
          </div>
        </div>

        {/* ========== FIXED BOTTOM SECTION ========== */}
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