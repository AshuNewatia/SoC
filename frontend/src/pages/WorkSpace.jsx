import React, { useState, useEffect } from "react";
import { useParams, Outlet, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { handleApiError, handleSuccess } from "../utils/handleApiError";

import WorkspaceNav from "../components/workspace/WorkspaceNav";
import WorkspaceHero from "../components/workspace/WorkspaceHero";
import WorkspaceSettingsModal from "../components/workspace/WorkspaceSettingModal";
import api from "../services/api";
import { updateWorkspace, deleteWorkspace, transferOwnership } from "../services/workspaceServices";
import { getTasks } from "../services/taskServices"
import Skeleton from "../components/common/Skeleton";

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

  const handleTransferOwnership = async (newOwnerId) => {
    try {
      await transferOwnership(id, newOwnerId);

      handleSuccess("Ownership transferred successfully");

      // Refresh workspace
      const res = await api.get(`/api/workspaces/${id}`);
      setWorkspace(res.data);

      setSettingsOpen(false);

      window.dispatchEvent(
        new CustomEvent("workspaceListChanged")
      );
    } catch (err) {
      console.error(err);
      handleApiError(err);
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
    fetchTasks();

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

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {/* Workspace Hero */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between">
            <div className="flex gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div>
                <Skeleton className="h-8 w-52 rounded-lg" />
                <Skeleton className="h-4 w-28 rounded mt-3" />
                <div className="flex gap-3 mt-5">
                  <Skeleton className="h-10 w-28 rounded-xl" />
                  <Skeleton className="h-10 w-28 rounded-xl" />
                  <Skeleton className="h-10 w-28 rounded-xl" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-8 w-32 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>

        {/* Page Content */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex justify-between">
            <div>
              <Skeleton className="h-9 w-72 rounded-lg" />
              <Skeleton className="h-5 w-96 rounded mt-4" />
            </div>
            <Skeleton className="h-12 w-40 rounded-2xl" />
          </div>

          <div className="mt-10">
            <Skeleton className="h-5 w-44 rounded" />
            <Skeleton className="h-3 w-full rounded-full mt-4" />
            <Skeleton className="h-4 w-36 rounded mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-10">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="border border-slate-200 rounded-2xl p-6">
                <Skeleton className="h-5 w-28 rounded" />
                <Skeleton className="h-10 w-16 rounded mt-5" />
                <Skeleton className="h-4 w-24 rounded mt-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  const currentUserId = localStorage.getItem("userId");

  const isCreator =
    String(workspace?.createdBy?._id || workspace?.createdBy) ===
    String(currentUserId);

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
        onTransferOwnership={handleTransferOwnership}
        isCreator={isCreator}
      />
    </div>
  );
}