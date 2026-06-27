import React, { useState, useEffect } from "react";

import {
  Target,
  Clock3,
  Trophy,
  BarChart3,
} from "lucide-react";

import KPISection from "../components/analytics/KPISection";
import TaskTrendChart from "../components/analytics/TaskTrendChart";
import TaskStatusChart from "../components/analytics/TaskStatusChart";
import PriorityChart from "../components/analytics/PriorityChart";
import MemberPerformance from "../components/analytics/MemberPerformance";
import ProductivityChart from "../components/analytics/ProductivityChart";
import GithubAnalytics from "../components/analytics/GithubAnalytics";
import InsightsSection from "../components/analytics/InsightsSection";

import { exportAnalyticsReport } from "../services/analyticsService";

export default function Analytics() {

// useEffect(() => {
//   socket.on("analyticsUpdated", () => {
//     fetchOverview();
//     fetchTaskStatus();
//     fetchPriority();
//     fetchWorkload();
//     fetchProductivity();
//   });

//   return () => {
//     socket.off("analyticsUpdated");
//   };
// }, []);

const [exporting, setExporting] = useState(false);

const handleExport = async () => {
  try {
    setExporting(true);

    const response = await exportAnalyticsReport();

    const url = window.URL.createObjectURL(
      new Blob([response.data])
    );

    const link = document.createElement("a");

    link.href = url;
    link.download = "analytics-report.pdf";

    document.body.appendChild(link);
    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export failed:", error);
  } finally {
    setExporting(false);
  }
};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Analytics
          </h1>

          <p className="text-text-secondary mt-1">
            Monitor productivity, workload and project performance.
          </p>
        </div>

        <button onClick={handleExport} disabled={exporting}
          className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-hover transition">
          {exporting ? "Generating..." : "Export Report"}
        </button>
      </div>

      {/* KPI Cards */}
      <KPISection />

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TaskTrendChart />
        <TaskStatusChart />
      </div>

      {/* Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <PriorityChart />
        <GithubAnalytics />
      </div>

      {/* AI Insights */}
      <InsightsSection />

      <ProductivityChart />

      {/* Members */}
      <MemberPerformance />
    </div>
  );
}