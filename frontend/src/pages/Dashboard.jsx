import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, CheckSquare, CalendarClock, BadgeCheck, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";
import api from "../services/api";
import { getTasks } from "../services/taskServices";
import { useAuth } from "../context/authContext";
import StatsGrid from "../components/dashboard/StatsGrid";
import Hero from "../components/dashboard/Hero";
import CreateWorkspaceModal from "../components/workspace/CreateWorkspaceModal";
import RecentActivity from "../components/dashboard/RecentActivity";
import UpcomingDeadlines from "../components/dashboard/UpcomingDeadlines";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import { handleSuccess, handleApiError } from "../utils/handleApiError";

export default function Dashboard() {
  const [createOpen, setCreateOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch workspaces first
        const workspacesRes = await api.get("/api/workspaces");
        const fetchedWorkspaces = workspacesRes.data || [];
        setWorkspaces(fetchedWorkspaces);

        if (fetchedWorkspaces.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch tasks and activities in parallel using Promise.all
        const [tasksResults, activitiesResults] = await Promise.all([
          // Fetch tasks from all workspaces in parallel
          Promise.all(
            fetchedWorkspaces.map((workspace) =>
              getTasks(workspace._id).catch(() => ({ data: [] }))
            )
          ),
          // Fetch activities from all workspaces in parallel
          Promise.all(
            fetchedWorkspaces.map((workspace) =>
              api.get(`/api/workspaces/${workspace._id}/activity`).catch(() => ({ data: [] }))
            )
          ),
        ]);

        // Flatten tasks
        let allTasks = [];
        tasksResults.forEach((res) => {
          allTasks = [...allTasks, ...(res.data || [])];
        });
        setTasks(allTasks);

        // Flatten and sort activities
        let allActivities = [];
        activitiesResults.forEach((res) => {
          allActivities = [...allActivities, ...(res.data || [])];
        });
        allActivities.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setActivities(allActivities.slice(0, 10));

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const isProfessor = user?.role === "professor";

  const activeWorkspaces = workspaces.length;

  const assignedTasks = tasks.filter(task =>
    task.assignedTo?.some(assigned => assigned._id === user?.id)
  );

  const completedTasks = tasks.filter(task => task.status === "completed").length;

  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;
    return (
      task.status !== "completed" &&
      new Date(task.dueDate) < new Date()
    );
  }).length;

  const overdueTasksStudent = assignedTasks.filter((task) => {
    if (!task.dueDate) return false;
    return (
      task.status !== "completed" &&
      new Date(task.dueDate) < new Date()
    );
  }).length;

  const dueThisWeek = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    return dueDate >= now && dueDate <= nextWeek;
  }).length;

  // Calculate weekly changes for stats
  const weeklyChange = 4; // This would come from real data in production

  const studentStats = [
    {
      title: "Active Workspaces",
      value: activeWorkspaces,
      subtitle: "Currently active",
      icon: FolderKanban,
      change: `+${weeklyChange}`,
      changeLabel: "this week",
      trend: "up",
    },
    {
      title: "Assigned Tasks",
      value: assignedTasks.length,
      subtitle: "Currently assigned",
      icon: CheckSquare,
      change: `+${Math.min(assignedTasks.length, 3)}`,
      changeLabel: "new this week",
      trend: "up",
    },
    {
      title: "Due This Week",
      value: dueThisWeek,
      subtitle: "Need attention",
      icon: CalendarClock,
      change: dueThisWeek > 0 ? `${dueThisWeek} tasks` : "All caught up",
      changeLabel: dueThisWeek > 0 ? "this week" : "🎉",
      trend: dueThisWeek > 0 ? "up" : "down",
    },
    {
      title: "Overdue Tasks",
      value: overdueTasksStudent,
      subtitle: "Require attention",
      icon: AlertTriangle,
      change: overdueTasksStudent > 0 ? `${overdueTasksStudent} overdue` : "No overdue",
      changeLabel: overdueTasksStudent > 0 ? "take action" : "✅",
      trend: overdueTasksStudent > 0 ? "up" : "down",
    },
  ];

  const professorStats = [
    {
      title: "Active Workspaces",
      value: activeWorkspaces,
      subtitle: "Projects supervised",
      icon: FolderKanban,
      change: `+${weeklyChange}`,
      changeLabel: "this week",
      trend: "up",
    },
    {
      title: "Total Tasks",
      value: tasks.length,
      subtitle: "Awaiting approval",
      icon: CheckSquare,
      change: `+${Math.min(tasks.length, 5)}`,
      changeLabel: "new tasks",
      trend: "up",
    },
    {
      title: "Completed Tasks",
      value: completedTasks,
      subtitle: "Finished",
      icon: BadgeCheck,
      change: `${Math.min(completedTasks, 8)} completed`,
      changeLabel: "this month",
      trend: "up",
    },
    {
      title: "Overdue Tasks",
      value: overdueTasks,
      subtitle: "Require attention",
      icon: AlertTriangle,
      change: overdueTasks > 0 ? `${overdueTasks} overdue` : "All on track",
      changeLabel: overdueTasks > 0 ? "⚠️" : "🌟",
      trend: overdueTasks > 0 ? "up" : "down",
    },
  ];

  const dashboardStats = isProfessor ? professorStats : studentStats;

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
      handleSuccess("Workspace created successfully");
      setCreateOpen(false);
    } catch (err) {
      handleApiError(err);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <CreateWorkspaceModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateWorkspace}
      />
      <Hero
        user={displayUser}
        summary={summary}
        greeting={greeting}
        onCreateWorkspace={() => setCreateOpen(true)} />
      <StatsGrid workspaceStat={dashboardStats} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <UpcomingDeadlines
          tasks={tasks}
          currentUser={user}
          isProfessor={isProfessor}
        />
        <RecentActivity activities={activities} />
      </div>
    </div>
  );
}