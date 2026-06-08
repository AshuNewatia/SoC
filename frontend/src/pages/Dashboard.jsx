import StatsGrid from "../components/dashboard/StatsGrid";

const workspaceStat = [
  {
   title: "Active Workspaces",
   value: 2
  },
  {
    title: "verification pending",
    value: 3
  }
]

export default function Dashboard() {
  return (
    <div className="p-6">
      <StatsGrid workspaceStat = {workspaceStat} />
    </div>
  );
}