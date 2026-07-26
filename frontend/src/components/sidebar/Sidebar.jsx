import {
  FolderKanban,
  LayoutDashboard,
  KanbanSquare,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  X,
  Pin,
} from "lucide-react";
import logo from "../../assets/logo.png";

import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useWorkspaces } from "../../context/workspaceContext";
import LogoutModal from "../common/LogoutModal";
import CreateWorkspaceModal from "../workspace/CreateWorkspaceModal";
import { createWorkspace } from "../../services/workspaceServices";
import api from "../../services/api";

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

  const handleTogglePin = async (e, workspaceId) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await api.patch(`/api/workspaces/${workspaceId}/pin`);
      await fetchWorkspaces();
    } catch (err) {
      console.error("Error toggling workspace pin:", err);
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
    (a, b) =>
      new Date(b.lastActivityAt || b.updatedAt) -
      new Date(a.lastActivityAt || a.updatedAt)
  );

  const filteredWorkspaces = sortedWorkspaces.filter((workspace) =>
    workspace.name
      .toLowerCase()
      .includes(workspaceSearch.toLowerCase())
  );

  const userId = user?.id || user?._id;

  const pinnedWorkspaces = filteredWorkspaces.filter((ws) =>
    ws.pinnedBy?.some((id) => (id._id || id).toString() === userId?.toString())
  );

  const unpinnedWorkspaces = filteredWorkspaces.filter((ws) =>
    !ws.pinnedBy?.some((id) => (id._id || id).toString() === userId?.toString())
  );

  const renderWorkspaceItem = (workspace, isPinned) => {
    const isWorkspaceActive = location.pathname.startsWith(
      `/workspace/${workspace._id}`
    );

    return (
      <NavLink
        key={workspace._id}
        to={`/workspace/${workspace._id}/overview`}
        onClick={onClose}
        className={`group relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
          isWorkspaceActive
            ? "bg-primary/15 text-primary font-semibold shadow-sm"
            : "bg-slate-50 hover:bg-white hover:shadow-md hover:-translate-y-0.5 text-text-primary"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <FolderKanban size={16} className="shrink-0" />
          <span className="truncate text-sm">{workspace.name}</span>
        </div>

        <button
          type="button"
          onClick={(e) => handleTogglePin(e, workspace._id)}
          title={isPinned ? "Unpin workspace" : "Pin workspace"}
          className={`p-1 rounded-lg transition-all ${
            isPinned
              ? "text-amber-500 opacity-100"
              : "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-500 hover:bg-slate-200/50"
          }`}
        >
          <Pin size={14} className={isPinned ? "fill-amber-500" : ""} />
        </button>
      </NavLink>
    );
  };

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

        {/* Header and Add Workspace */}
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

        {/* Scrollable Workspace Lists */}
        <div className="flex-1 overflow-y-auto px-4 pr-3 minimalist-scrollbar">
          <div className="space-y-4 pb-4">
            {filteredWorkspaces.length === 0 ? (
              <div className="text-sm text-slate-500 px-4 py-3">
                {workspaceSearch
                  ? `No workspace found for "${workspaceSearch}"`
                  : "No workspaces found"}
              </div>
            ) : (
              <>
                {/* Pinned Section */}
                {pinnedWorkspaces.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
                      <Pin size={12} className="fill-amber-500" />
                      Pinned
                    </div>
                    {pinnedWorkspaces.map((workspace) =>
                      renderWorkspaceItem(workspace, true)
                    )}
                  </div>
                )}

                {/* All / Other Workspaces Section */}
                {unpinnedWorkspaces.length > 0 && (
                  <div className="space-y-1.5">
                    {pinnedWorkspaces.length > 0 && (
                      <div className="px-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Other Workspaces
                      </div>
                    )}
                    {unpinnedWorkspaces.map((workspace) =>
                      renderWorkspaceItem(workspace, false)
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer Links */}
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