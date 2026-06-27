import React, { useState, useEffect } from "react";
import { useParams, Outlet, useNavigate} from "react-router-dom";
import { io } from "socket.io-client";
import { handleApiError,handleSuccess } from "../utils/handleApiError";

import WorkspaceNav from "../components/workspace/WorkspaceNav";
import WorkspaceHero from "../components/workspace/WorkspaceHero";
import WorkspaceSettingsModal from "../components/workspace/WorkspaceSettingModal";
import api from "../services/api"; 
import { updateWorkspace, deleteWorkspace } from "../services/workspaceServices";
import { getTasks } from "../services/taskServices"

// Socket instance (reused, autoConnect false)
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
  withCredentials: true,
  autoConnect: false,
});

export default function Workspace() {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const res = await getTasks(id);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const totalTasks = tasks.length;

  const handleUpdateWorkspace = async (data) => {
    try {
      const res = await updateWorkspace(id, data);

      setWorkspace(res.data);

      setSettingsOpen(false);
      handleSuccess("Workspace updated successfully");
      window.dispatchEvent(
        new CustomEvent("workspaceListChanged")
      );
    } catch (err) {
      console.error(err);
      handleApiError(err);
    }
  };

  const handleDeleteWorkspace = async () => {
    try {
      await deleteWorkspace(id);
      handleSuccess("Workspace deleted successfully");
      window.dispatchEvent(
        new CustomEvent("workspaceListChanged")
      );
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      handleApiError(err);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchWorkspace = async () => {
      try {
        // ✅ use api.get – token automatically added
        const res = await api.get(`workspaces/${id}`);
        setWorkspace(res.data);

      } catch (err) {
        console.error("Failed to fetch workspace:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
    fetchTasks();

    // Socket connection
    socket.connect();
    socket.emit("join_workspace", id);

    socket.on("workspace_updated", (updatedData) => {
      setWorkspace((prev) => ({ ...prev, ...updatedData }));
    });

    return () => {
      socket.emit("leave_workspace", id);
      socket.disconnect();
    };
  }, [id]);

  // Loading & error states (same as before)
  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-text-secondary bg-bg-light">
        <span className="animate-pulse flex items-center gap-2 font-medium">
          <span className="w-2 h-2 bg-primary rounded-full"></span> Loading workspace...
        </span>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      // Updated to use surface, rounded-xl, and red text alerts
      <div className="p-10 text-center text-red-500 bg-surface rounded-(--rounded-xl) border border-red-200 max-w-2xl mx-auto mt-10 shadow-sm">

        <h3 className="font-bold text-lg">Error Loading Workspace</h3>
        <p className="text-sm mt-2 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 font-sans bg-bg-light min-h-screen text-text-primary">
      {workspace ? (
        <WorkspaceHero workspace={workspace} tasks={totalTasks} onSettingsClick={() => setSettingsOpen(true)} />
      ) : (
        <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
      )}
      <WorkspaceNav workspace={workspace} />
      <Outlet context={{ workspace, socket }} />
      <WorkspaceSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        workspace={workspace}
        onSave={handleUpdateWorkspace}
        onDelete={handleDeleteWorkspace}
      />
    </div>
  );
}