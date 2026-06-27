import React, { useEffect, useState } from "react";
import {
  Trophy,
  Target,
  Calendar,
} from "lucide-react";

import InsightCard from "./InsightCard";
import { getInsights } from "../../services/analyticsService";

export default function InsightsSection() {
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
    <div className="grid gap-5 md:grid-cols-3">
      <InsightCard
        title="Top Performer"
        value={insights.topPerformer.name}
        description={`${insights.topPerformer.completed} completed tasks`}
        icon={Trophy}
      />

      <InsightCard
        title="Most Active Day"
        value={insights.mostActiveDay}
        description="Highest completion activity"
        icon={Calendar}
      />

      <InsightCard
        title="Dominant Priority"
        value={insights.dominantPriority}
        description="Most common task priority"
        icon={Target}
      />
    </div>
  );
}