import React from "react";
import { useEffect, useRef, useState } from "react";

import { Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";

import KPISection from "../components/analytics/KPISection";
import TaskTrendChart from "../components/analytics/TaskTrendChart";
import TaskStatusChart from "../components/analytics/TaskStatusChart";
import PriorityChart from "../components/analytics/PriorityChart";
import MemberPerformance from "../components/analytics/MemberPerformance";
import ProductivityChart from "../components/analytics/ProductivityChart";
import InsightsSection from "../components/analytics/InsightsSection";

import { exportReport } from "../services/analyticsService";
import { getCSVReport } from "../services/analyticsService";

export default function Analytics() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);

  const handleExportPDF = async () => {
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

  const handleExportCSV = async () => {
    try {
      setExportOpen(false);

      const res = await getCSVReport();

      const url = URL.createObjectURL(res.data);

      const link = document.createElement("a");

      link.href = url;
      link.download = `tasks.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV export failed:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left Side */}
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Workspace Analytics</h1>
            <p className="text-sm text-text-secondary mt-1">Track your task completion and personal productivity.</p>
          </div>

          {/* Export Dropdown */}
          <div ref={exportRef} className="relative">
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium shadow-sm hover:opacity-90 transition min-w-38.75"
            >
              <Download size={17} />
              Export Report
              <ChevronDown size={16} className={`transition-transform duration-200 ${exportOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {exportOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-30">
                <button
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                    <FileText size={17} className="text-red-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Export as PDF</p>
                    <p className="text-xs text-slate-400 mt-0.5">Complete analytics report</p>
                  </div>
                </button>

                <div className="h-px bg-slate-100" />

                <button
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                    <FileSpreadsheet size={17} className="text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Export as CSV</p>
                    <p className="text-xs text-slate-400 mt-0.5">Raw workspace data</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
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