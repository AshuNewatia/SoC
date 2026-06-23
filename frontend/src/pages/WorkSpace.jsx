import React, { useState, useEffect } from "react";
import { useParams, Outlet, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
<<<<<<< HEAD
import { getTasks } from "../services/taskServices";   // ✅ import task service
import api from "../services/api";
import WorkspaceNav from "../components/workspace/WorkspaceNav";
import WorkspaceHero from "../components/workspace/WorkspaceHero";
=======
import api from "../services/api"; // Ensure you import your API service
import { useWorkspaces } from "../context/workspaceContext"; // To refresh the sidebar

import WorkspaceNav from "../components/workspace/WorkspaceNav";
import WorkspaceHero from "../components/workspace/WorkspaceHero";
import WorkspaceSettingsModal from "../components/workspace/WorkspaceSettingModal"; // Import the modal!
>>>>>>> origin/main

// Establish socket outside component
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
  withCredentials: true,
  autoConnect: false,
});

export default function Workspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchWorkspaces } = useWorkspaces(); // Grab the fetch function to update the sidebar

  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for the Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
<<<<<<< HEAD
        const res = await api.get(`/api/workspaces/${id}`);
        setWorkspace(res.data);
=======
        const response = await api.get(`/api/workspaces/${id}`);
        setWorkspace(response.data);
>>>>>>> origin/main
      } catch (err) {
        console.error("Failed to fetch workspace:", err);
        setError("Workspace not found");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
    fetchTasks(); // ✅ call it here

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

<<<<<<< HEAD
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
=======
  // Handle saving the settings (Name, Desc, GitHub)
  const handleSaveSettings = async (updatedData) => {
    try {
      const response = await api.put(`/api/workspaces/${id}`, updatedData);
      
      // Update local state instantly so the Hero changes
      setWorkspace(response.data); 
      
      // Notify the backend via socket so other users see the name change instantly (optional)
      socket.emit("update_workspace", { roomId: id, ...response.data });

      // Refresh the sidebar list in case the workspace name changed
      await fetchWorkspaces();

      setIsSettingsOpen(false);
    } catch (err) {
      console.error("Failed to update workspace:", err);
      alert("Failed to save settings.");
    }
  };

  // Handle deleting the workspace
  const handleDeleteWorkspace = async () => {
    try {
      await api.delete(`/api/workspaces/${id}`);
      
      // Refresh the sidebar
      await fetchWorkspaces();
      
      // Kick the user back to the dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to delete workspace:", err);
      alert("Failed to delete workspace.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading workspace...</div>;
  if (error || !workspace) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-4 font-sans bg-bg-light min-h-screen text-text-primary">
      
      {/* Settings Modal */}
      <WorkspaceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        workspace={workspace}
        onSave={handleSaveSettings}
        onDelete={handleDeleteWorkspace}
      />

      {/* Pass the function down to open the modal */}
      <WorkspaceHero 
        workspace={workspace} 
        onSettingsClick={() => setIsSettingsOpen(true)} 
      />
      
>>>>>>> origin/main
      <WorkspaceNav workspace={workspace} />

      <Outlet context={{ workspace, socket }} />
    </div>
  );
}