import React, { useEffect, useState } from "react";
import {
    Trophy,
    Target,
    Calendar,
} from "lucide-react";

import InsightCard from "./InsightCard";
import Skeleton from "../../common/Skeleton";

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
                        className="rounded-2xl border border-border-light bg-surface p-5 shadow-sm"
                    >

                        <div className="flex justify-between">

                            <div className="space-y-4">

                                <Skeleton className="h-4 w-28" />

                                <Skeleton className="h-8 w-40" />

                                <Skeleton className="h-3 w-52" />

                            </div>

                            <Skeleton className="w-11 h-11 rounded-xl" />

                        </div>

                    </div>
                ))}

            </div>
        );
    }


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