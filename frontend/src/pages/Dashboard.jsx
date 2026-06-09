import StatsGrid from "../components/dashboard/StatsGrid";
import Hero from "../components/dashboard/Hero";
import { FolderKanban,CheckSquare,CalendarClock,BadgeCheck } from "lucide-react";

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

const user = {
  name: "Harsh",
  role: "student"
}

const summary = "You have 2 task due this week"

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


export default function Dashboard() {
  return (
    <div className="p-6">
      <Hero user ={user} summary = {summary} greeting = {greeting} />
      <StatsGrid workspaceStat = {workspaceStat} />
    </div>
  );
}