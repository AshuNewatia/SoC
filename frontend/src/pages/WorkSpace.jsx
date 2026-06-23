import React, { useState, useEffect } from "react";
import { useParams, Outlet } from "react-router-dom";
import { io } from "socket.io-client";
import { getTasks } from "../services/taskServices";   // ✅ import task service
import api from "../services/api";
import WorkspaceNav from "../components/workspace/WorkspaceNav";
import WorkspaceHero from "../components/workspace/WorkspaceHero";

// Socket instance (reused, autoConnect false)
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
  withCredentials: true,
  autoConnect: false,
});

export default function Workspace() {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ✅ Fetch tasks function (reusable for socket updates)
  const fetchTasks = async () => {
    try {
      const res = await getTasks(id);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchWorkspace = async () => {
      try {
        const res = await api.get(`/api/workspaces/${id}`);
        setWorkspace(res.data);
      } catch (err) {
        console.error("Failed to fetch workspace:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
    fetchTasks(); // ✅ call it here

    // Socket connection
    socket.connect();
    socket.emit("join_workspace", id);

    // Listen for workspace updates
    socket.on("workspace_updated", (updatedData) => {
      setWorkspace((prev) => ({ ...prev, ...updatedData }));
    });

    // ✅ Listen for task events and refresh tasks
    socket.on("taskMoved", fetchTasks);
    socket.on("taskCreated", fetchTasks);
    socket.on("taskUpdated", fetchTasks);
    socket.on("taskDeleted", fetchTasks);

    return () => {
      socket.emit("leave_workspace", id);
      socket.off("workspace_updated");
      socket.off("taskMoved");
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
      socket.disconnect();
    };
  }, [id]);

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
      <div className="p-10 text-center text-red-500 bg-surface rounded-(--rounded-xl) border border-red-200 max-w-2xl mx-auto mt-10 shadow-sm">
        <h3 className="font-bold text-lg">Error Loading Workspace</h3>
        <p className="text-sm mt-2 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 font-sans bg-bg-light min-h-screen text-text-primary">
      {/* ✅ Pass tasks (and onlineUsers as empty array – WorkspaceHero will fallback to workspace.members) */}
      <WorkspaceHero
        workspace={workspace}
        onSettingsClick={() => setSettingsOpen(true)}
        tasks={tasks}
      />
      <WorkspaceNav workspace={workspace} />
      <Outlet context={{ workspace, socket }} />
    </div>
  );
}