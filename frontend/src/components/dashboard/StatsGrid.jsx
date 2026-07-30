// src/components/dashboard/StatsGrid.jsx
import StatCard from "./StatCard"

export default function StatsGrid({ workspaceStat }) {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {workspaceStat.map((stat, index) => (
          <StatCard key={stat.title} stat={stat} index={index} />
        ))}
      </div>
    </div>
  )
}