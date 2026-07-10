import React, { useEffect, useState } from "react";
import {
  Trophy,
  Target,
  Calendar,
} from "lucide-react";

import InsightCard from "./InsightCard";
import { getInsights } from "../../services/analyticsService";

export default function InsightsSection() {

 const user = JSON.parse(localStorage.getItem("user"));

  const [insights, setInsights] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data } = await getInsights();
        setInsights(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchInsights();
  }, []);

  if (!insights) return null;

  return (
  <div className="grid gap-5 md:grid-rows-3">
    
    {user.role === "professor" && (
        <InsightCard
      title="Top Performer"
      value={insights?.topPerformer?.name || "N/A"}
      description={
        insights?.topPerformer
          ? `${insights.topPerformer.completed} completed tasks`
          : "No data available"
      }
      icon={Trophy}
    />
    )}

    {user.role === "student" && (
      <InsightCard
  title="Performance"
  value={
    insights.completionRate >= 90
      ? "Excellent"
      : insights.completionRate >= 70
      ? "Good"
      : insights.completionRate >= 50
      ? "Average"
      : "Needs Improvement"
  }
  description={`${insights.completionRate}% completion rate`}
  icon={Trophy}
/>
    )}

    <InsightCard
      title="Most Active Day"
      value={insights?.mostActiveDay || "N/A"}
      description="Highest completion activity"
      icon={Calendar}
    />

    <InsightCard
      title="Dominant Priority"
      value={insights?.dominantPriority || "N/A"}
      description="Most common task priority"
      icon={Target}
    />
  </div>
);
}