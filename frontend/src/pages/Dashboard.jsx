import StatsGrid from "../components/dashboard/StatsGrid";
import Hero from "../components/dashboard/Hero";
import { FolderKanban,CheckSquare,CalendarClock,BadgeCheck } from "lucide-react";
import { useAuth } from '../context/authContext';

const workspaceStat = [
  {
    title: "Assigned Tasks",
    value: 5,
    subtitle: "Currently assigned",
    icon: CheckSquare
  },
  {
    title: "Due This Week",
    value: 2,
    subtitle: "Need attention",
    icon: CalendarClock
  },
  {
    title: "Completed This Month",
    value: 18,
    subtitle: "Tasks completed",
    icon: BadgeCheck
  },
  {
    title: "Active Workspaces",
    value: 3,
    subtitle: "Currently active",
    icon: FolderKanban
  }
]




export default function Dashboard() {
  const { user } = useAuth(); 
  const displayUser = {
    name: user?.name || "User", 
    role: user?.role || "Student"
  };

  const summary = "You have 2 tasks due this week";
  let greeting = " ";
const hour = new Date().getHours();
if(hour >= 5 && hour <=11){
  greeting = "Good Morning"
}
else if(hour >=12 && hour <= 16){
  greeting = "Good Afternoon"
}
else if(hour >= 17 && hour <= 23){
  greeting = "Good Evening"
}
else if(hour >= 0 && hour <= 4){
  greeting = "Good Evening"
}


  return (
    <div className="p-6">
      <Hero user ={displayUser} summary = {summary} greeting = {greeting} />
      <StatsGrid workspaceStat = {workspaceStat} />
    </div>
  );
}