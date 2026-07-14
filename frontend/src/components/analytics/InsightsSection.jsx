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

  if (!insights) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-center min-h-75">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">

          <Trophy
            size={38}
            className="mx-auto text-slate-400"
          />

          <h3 className="mt-5 text-lg font-semibold">
            No Insights Available
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Insights will appear automatically as your team starts working.
          </p>

        </div>
      </div>
    );
  }

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