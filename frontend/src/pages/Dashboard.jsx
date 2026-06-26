// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, CheckSquare, CalendarClock, BadgeCheck } from "lucide-react";
import api from "../services/api";
import { getTasks } from "../services/taskServices";
import { useAuth } from "../context/authContext";
import StatsGrid from "../components/dashboard/StatsGrid";
import Hero from "../components/dashboard/Hero";
import CreateWorkspaceModal from "../components/workspace/CreateWorkspaceModal";
import RecentActivity from "../components/dashboard/RecentActivity";
import UpcomingDeadlines from "../components/dashboard/UpcomingDeadlines";

export default function Dashboard() {
  const [createOpen, setCreateOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [activities, setActivities] = useState([]);

  const { user } = useAuth();
  const navigate = useNavigate();

  // ---- 1. Fetch workspaces ----
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await api.get("/api/workspaces");
        setWorkspaces(res.data || []);
      } catch (err) {
        console.error("Failed to fetch workspaces:", err);
      }
    };
    fetchWorkspaces();
  }, []);

  // ---- 2. Fetch tasks for all workspaces ----
  useEffect(() => {
    const fetchTasksForWorkspaces = async () => {
      if (!workspaces.length) return;
      try {
        let allTasks = [];
        for (const workspace of workspaces) {
          const res = await getTasks(workspace._id);
          allTasks = [...allTasks, ...(res.data || [])];
        }
        setTasks(allTasks);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };
    fetchTasksForWorkspaces();
  }, [workspaces]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        if (!workspaces.length) return;

        let allActivities = [];

        for (const workspace of workspaces) {
          const res = await api.get(
            `/api/workspaces/${workspace._id}/activity`
          );

          allActivities = [
            ...allActivities,
            ...(res.data || []),
          ];
        }

        allActivities.sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );

        setActivities(allActivities.slice(0, 10));
      } catch (err) {
        console.error(err);
      }
    };

    fetchActivities();
  }, [workspaces]);

  // ---- 3. Compute statistics ----
  const isProfessor = user?.role === "professor";

  const activeWorkspaces = workspaces.length;

  const assignedTasks = tasks.filter(task =>
    task.assignedTo?.some(assigned => assigned._id === user?._id)
  ).length;

  const completedTasks = tasks.filter(task => task.status === "completed").length;

  const dueThisWeek = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    return dueDate >= now && dueDate <= nextWeek;
  }).length;

  // ---- 4. Build role‑based stat arrays (dynamic) ----
  const studentStats = [
    {
      title: "Assigned Tasks",
      value: assignedTasks,
      subtitle: "Currently assigned",
      icon: CheckSquare,
    },
    {
      title: "Due This Week",
      value: dueThisWeek,
      subtitle: "Need attention",
      icon: CalendarClock,
    },
    {
      title: "Completed Tasks",
      value: completedTasks,
      subtitle: "Finished",
      icon: BadgeCheck,
    },
    {
      title: "Active Workspaces",
      value: activeWorkspaces,
      subtitle: "Currently active",
      icon: FolderKanban,
    },
  ];

  const professorStats = [
    {
      title: "Active Workspaces",
      value: activeWorkspaces,
      subtitle: "Projects supervised",
      icon: FolderKanban,
    },
    {
      title: "Pending Reviews",
      value: 0, // placeholder for mid‑eval
      subtitle: "Awaiting approval",
      icon: CheckSquare,
    },
    {
      title: "Projects At Risk",
      value: 0, // placeholder
      subtitle: "Need attention",
      icon: CalendarClock,
    },
    {
      title: "Upcoming Deadlines",
      value: dueThisWeek,
      subtitle: "Next 7 days",
      icon: BadgeCheck,
    },
  ];

  const dashboardStats = isProfessor ? professorStats : studentStats;

  // ---- 5. Greeting logic ----
  const displayUser = {
    name: user?.name || "User",
    role: user?.role || "Student",
  };
  const summary = "You have 2 tasks due this week";
  let greeting = "";
  const hour = new Date().getHours();
  if (hour >= 5 && hour <= 11) greeting = "Good Morning";
  else if (hour >= 12 && hour <= 16) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  const handleCreateWorkspace = async (data) => {
    try {
      const res = await api.post("/api/workspaces", data);
      window.dispatchEvent(new CustomEvent("workspaceListChanged"));

      const newWorkspaceId = res?.data?.workspace?._id || res?.data?._id || res?._id;
      if (newWorkspaceId) {
        navigate(`/workspace/${newWorkspaceId}/overview`);
      } else {
        console.warn("Could not find workspace ID in the response to redirect!");
      }
      setCreateOpen(false);
    } catch (err) {
      console.error("Error creating workspace", err);
      alert(`Failed to create workspace: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="p-5.75">
      <CreateWorkspaceModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateWorkspace}
      />
      <Hero
        user={displayUser}
        summary={summary}
        greeting={greeting}
        onCreateWorkspace={() => setCreateOpen(true)}
      />
      <StatsGrid workspaceStat={dashboardStats} />
      <UpcomingDeadlines
        tasks={tasks}
        currentUser={user}
        isProfessor={isProfessor}
      />
      <RecentActivity
        activities={activities}
      />
    </div>
  );
}