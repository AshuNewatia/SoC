// src/pages/Dashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, CheckSquare, CalendarClock, BadgeCheck } from "lucide-react";
import { useAuth } from "../context/authContext";
import StatsGrid from "../components/dashboard/StatsGrid";
import Hero from "../components/dashboard/Hero";
import CreateWorkspaceModal from "../components/workspace/CreateWorkspaceModal";
import { createWorkspace } from "../services/workspaceServices";

const workspaceStat = [
  {
    title: "Assigned Tasks",
    value: 5,
    subtitle: "Currently assigned",
    icon: CheckSquare,
  },
  {
    title: "Due This Week",
    value: 2,
    subtitle: "Need attention",
    icon: CalendarClock,
  },
  {
    title: "Completed This Month",
    value: 18,
    subtitle: "Tasks completed",
    icon: BadgeCheck,
  },
  {
    title: "Active Workspaces",
    value: 3,
    subtitle: "Currently active",
    icon: FolderKanban,
  },
];

export default function Dashboard() {
  const [createOpen, setCreateOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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
      const res = await createWorkspace({
        ...data,
        owner: user.id,
      });

      // Let's log the actual response so you can see its exact shape!
      console.log("Workspace Created Response:", res);

      // Notify Sidebar that a new workspace was created
      window.dispatchEvent(new CustomEvent("workspaceListChanged"));

      // Bullet-proof way to grab the ID (checks multiple common response structures)
      const newWorkspaceId = res?.data?.workspace?._id || res?.data?._id || res?._id;

      if (newWorkspaceId) {
        navigate(`/workspace/${newWorkspaceId}/overview`);
      } else {
        console.warn("Could not find workspace ID in the response to redirect!");
      }

      setCreateOpen(false);
    } catch (err) {
      console.error("Error creating workspace", err);
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
      <StatsGrid workspaceStat={workspaceStat} />
    </div>
  );
}
