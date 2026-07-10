import React from "react";

import KPISection from "../components/analytics/KPISection";
import TaskTrendChart from "../components/analytics/TaskTrendChart";
import TaskStatusChart from "../components/analytics/TaskStatusChart";
import PriorityChart from "../components/analytics/PriorityChart";
import MemberPerformance from "../components/analytics/MemberPerformance";
import ProductivityChart from "../components/analytics/ProductivityChart";
import InsightsSection from "../components/analytics/InsightsSection";

import { exportReport } from "../services/analyticsService";

export default function Analytics() {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleExport = async () => {
  try {
    const response = await exportReport();

    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =
      user.role === "professor"
        ? "Workspace_Report.pdf"
        : "My_Report.pdf";

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert("Failed to export report.");
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
            {user?.role === "professor"
              ? "Monitor workspace productivity and student performance."
              : "Track your task completion and personal productivity."}
          </p>
        </div>

        <button onClick={handleExport} className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl font-medium transition shadow-sm text-sm">
          {user?.role === "professor"
            ? "Export Workspace Report"
            : "Export My Report"}
        </button>
      </div>

      {/* KPI */}
      <KPISection />

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TaskTrendChart />
        <TaskStatusChart />
      </div>

      {/* Priority + Insights */}
      <div className="grid lg:grid-cols-2 gap-6">
        <PriorityChart />
        <InsightsSection />
      </div>

      {/* Productivity */}
      {user?.role === "professor" && (
      <ProductivityChart />
      )}
      
      {/* Professor Only */}
      {user?.role === "professor" && (
        <MemberPerformance />
      )}
    </div>
  );
}