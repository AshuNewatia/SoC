// src/pages/WorkspaceOverview.jsx
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import socket from "../../../hooks/useSocket";
import Overview from "../overview/Overview";
import WorkspaceHero from "../WorkspaceHero";
import { workspaces } from "../../../data/workspaces";

export default function WorkspaceOverview() {
  const { id } = useParams();
  const workspace = workspaces.find((w) => w.id === id);

  // Stats state
  const [tasks, setTasks] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentUser] = useState(() => ({
    name: `User-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
  }));

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("userJoined", { id: socket.id, name: currentUser.name });
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
  }, [currentUser.name]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;

  const handleCreateTask = () => {
    // Emit an event that the KanbanBoard can listen to
    window.dispatchEvent(new CustomEvent("openCreateTaskModal"));
  };

  return (
    <div className="space-y-4 p-1.5">
      <WorkspaceHero workspace={workspace} />

      {/* Real‑time Sync Board (stats + create button) */}
      <Overview
        onlineUsers={onlineUsers}
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        onCreateTask={handleCreateTask}
      />

      
    </div>
  );
}