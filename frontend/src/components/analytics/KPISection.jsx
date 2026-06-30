import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

import KPIStatCard from "./KPIStatCard";
import { getOverview } from "../../services/analyticsService";

export default function KPISection() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    productivity: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const { data } = await getOverview();

        setStats(data);
      } catch (error) {
        console.error("Failed to fetch analytics overview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-32 rounded-2xl border border-border-light animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <KPIStatCard
        title="Total Tasks"
        value={stats.totalTasks}
        subtitle="Across all workspaces"
        icon={BarChart3}
        color="blue"
      />

      <KPIStatCard
        title="Completed"
        value={stats.completedTasks}
        subtitle={`${stats.productivity}% completion rate`}
        icon={CheckCircle2}
        color="green"
      />

      <KPIStatCard
        title="Pending"
        value={stats.pendingTasks}
        subtitle="Still in progress"
        icon={Clock3}
        color="orange"
      />

      <KPIStatCard
        title="Productivity"
        value={`${stats.productivity}%`}
        subtitle="Overall efficiency"
        icon={AlertTriangle}
        color="red"
      />
    </div>
  );
}