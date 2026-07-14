import React, { useEffect, useState } from "react";
import {
    CheckCircle2,
    Clock3,
    AlertTriangle,
    BarChart3,
} from "lucide-react";

import KPIStatCard from "./KPIStatCard";
import { getWorkspaceOverview } from "../../../services/workspaceAnalyticsService";
import Skeleton from "../../common/Skeleton";

export default function KPISection({ workspaceId }) {
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
                const { data } =
                    await getWorkspaceOverview(workspaceId);

                setStats(data);
            } catch (error) {
                console.error("Failed to fetch analytics overview:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOverview();
    }, [workspaceId]);

    if (loading) {
        return (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="rounded-2xl border border-border-light bg-surface p-5 shadow-sm"
                    >
                        <Skeleton className="h-1 w-12 rounded-full mb-5" />

                        <div className="flex justify-between">

                            <div className="space-y-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-3 w-28" />
                            </div>

                            <Skeleton className="w-11 h-11 rounded-xl" />
                        </div>
                    </div>
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
                title="Overdue"
                value={stats.overdueTasks}
                subtitle="Past their deadline"
                icon={AlertTriangle}
                color="red"
            />
        </div>
    );
}