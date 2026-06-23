import React, { useState, useEffect } from "react";
import { useParams, Outlet, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import api from "../services/api";
import { getTasks } from "../services/taskServices";
import { useWorkspaces } from "../context/workspaceContext";

import WorkspaceNav from "../components/workspace/WorkspaceNav";
import WorkspaceHero from "../components/workspace/WorkspaceHero";
import WorkspaceSettingsModal from "../components/workspace/WorkspaceSettingModal";

const socket = io(
  import.meta.env.VITE_API_URL || "http://localhost:5000",
  {
    withCredentials: true,
    autoConnect: false,
  }
);

export default function Workspace() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { fetchWorkspaces } = useWorkspaces();

  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Fetch tasks
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
        setError(
          err.response?.data?.message ||
          "Workspace not found"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
    fetchTasks();

    socket.connect();

    socket.emit("join_workspace", id);

    socket.on("workspace_updated", (updatedData) => {
      setWorkspace((prev) => ({
        ...prev,
        ...updatedData,
      }));
    });

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

  const handleSaveSettings = async (updatedData) => {
    try {
      const res = await api.put(
        `/api/workspaces/${id}`,
        updatedData
      );

      setWorkspace(res.data);

      await fetchWorkspaces();

      setIsSettingsOpen(false);

      socket.emit("workspace_updated", res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    }
  };

  const handleDeleteWorkspace = async () => {
    try {
      await api.delete(`/api/workspaces/${id}`);

      await fetchWorkspaces();

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to delete workspace");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-text-secondary bg-bg-light">
        <span className="animate-pulse flex items-center gap-2 font-medium">
          <span className="w-2 h-2 bg-primary rounded-full"></span>
          Loading workspace...
        </span>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="p-10 text-center text-red-500 bg-surface rounded-xl border border-red-200 max-w-2xl mx-auto mt-10 shadow-sm">
        <h3 className="font-bold text-lg">
          Error Loading Workspace
        </h3>
        <p className="text-sm mt-2 font-medium">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 font-sans bg-bg-light min-h-screen text-text-primary">

      <WorkspaceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        workspace={workspace}
        onSave={handleSaveSettings}
        onDelete={handleDeleteWorkspace}
      />

      <WorkspaceHero
        workspace={workspace}
        tasks={tasks}
        onSettingsClick={() =>
          setIsSettingsOpen(true)
        }
      />

      <WorkspaceNav workspace={workspace} />

      <Outlet
        context={{
          workspace,
          socket,
        }}
      />
    </div>
  );
}