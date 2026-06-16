// src/pages/WorkspaceOverview.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../../../hooks/useSocket";
import Overview from "../overview/Overview";
import WorkspaceHero from "../WorkspaceHero";
import { getTasks } from "../../../services/taskServices";
import api from "../../../services/api";
import { useAuth } from "../../../context/authContext";
import { useLocation } from "react-router-dom";

export default function WorkspaceOverview() {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const location = useLocation();
  const [workspace, setWorkspace] = useState(
    location.state?.workspace || null
  );
  const { user } = useAuth();
  const currentUserName = user?.name || user?.email || "Guest";

  // Fetch workspace details
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await api.get(`/api/workspaces/${id}`);
        setWorkspace(res.data);
      } catch (error) {
        console.error("Error fetching workspace:", error);
      }
    };
    fetchWorkspace();
  }, [id]);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await getTasks(id);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // Socket setup
  useEffect(() => {
    if (socket.connected) {
      socket.emit("userJoined", { id: socket.id, name: currentUserName, workspaceId: id });
    }

    socket.on("connect", () => {
      socket.emit("userJoined", { id: socket.id, name: currentUserName, workspaceId: id });
    });

    socket.on("onlineUsers", (users) => setOnlineUsers(users));
    socket.on("taskMoved", fetchTasks);
    socket.on("taskCreated", fetchTasks);
    socket.on("taskUpdated", fetchTasks);
    socket.on("taskDeleted", fetchTasks);

    fetchTasks();

    return () => {
      socket.off("connect");
      socket.off("onlineUsers");
      socket.off("taskMoved");
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
    };
  }, [currentUserName, id]);   // ✅ fixed dependency

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;

  const handleCreateTask = () => {
    window.dispatchEvent(new CustomEvent("openCreateTaskModal"));
  };

  return (
    <div className="space-y-4 p-1.5">
      {workspace ? (
        <WorkspaceHero workspace={workspace} />
      ) : (
        <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
      )}
      <Overview
        onlineUsers={onlineUsers}
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}