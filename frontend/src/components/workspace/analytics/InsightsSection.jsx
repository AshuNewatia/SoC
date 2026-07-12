import React, { useEffect, useState } from "react";
import {
    Trophy,
    Target,
    Calendar,
} from "lucide-react";

import InsightCard from "./InsightCard";

import {
    getWorkspaceInsights,
} from "../../../services/workspaceAnalyticsService";


export default function InsightsSection({
    workspaceId,
}) {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (!workspaceId) return;

        const fetchInsights = async () => {
            try {
                const { data } =
                    await getWorkspaceInsights(workspaceId);

                setInsights(data);
            } catch (error) {
                console.error(
                    "Failed to fetch workspace insights",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [workspaceId]);


    if (loading) {
        return (
            <div className="grid gap-5 grid-rows-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="h-32 rounded-2xl border border-slate-200 bg-white animate-pulse"
                    />
                ))}
            </div>
        );
    }


    if (!insights) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-center min-h-[300px]">
                <p className="text-text-secondary">
                    No insights available
                </p>
            </div>
        );
    }


    return (
        <div className="grid gap-5 grid-rows-3">

            {insights.type === "team" ? (
                <InsightCard
                    title="Top Performer"
                    value={insights.topContributor?.name || "N/A"}
                    description={`${insights.topContributor?.completed || 0} completed tasks`}
                    icon={Trophy}
                />
            ) : (
                <InsightCard
                    title="My Completion Rate"
                    value={`${insights.completionRate || 0}%`}
                    description="Your task completion rate in this workspace"
                    icon={Trophy}
                />
            )}


            <InsightCard
                title="Most Active Day"
                value={
                    insights.mostActiveDay || "N/A"
                }
                description="Highest task completion activity"
                icon={Calendar}
            />


            <InsightCard
                title="Dominant Priority"
                value={
                    insights.dominantPriority || "None"
                }
                description="Most common task priority"
                icon={Target}
            />

        </div>
    );
}