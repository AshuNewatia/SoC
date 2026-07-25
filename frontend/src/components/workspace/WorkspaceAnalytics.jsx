import { useEffect, useRef, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";

import KPISection from "../workspace/analytics/KPISection";
import TaskTrendChart from "../workspace/analytics/TaskTrendChart";
import TaskStatusChart from "../workspace/analytics/TaskStatusChart";
import PriorityChart from "../workspace/analytics/PriorityChart";
import MemberPerformance from "../workspace/analytics/MemberPerformance";
import InsightsSection from "../workspace/analytics/InsightsSection";
import WorkloadChart from "../workspace/analytics/WorkloadChart";
import DeadlineSection from "./analytics/DeadlineSection";
import GithubAnalytics from "./analytics/GithubAnalytics";
import ExportLoadingModal from "../workspace/analytics/ExportLoadingModel";

import { getCSVReport, getAnalyticsReport } from "../../services/workspaceAnalyticsService";
import { useAuth } from "../../context/authContext";

export default function WorkspaceAnalytics() {
  const { id: workspaceId } = useParams();
  const { workspace } = useOutletContext();
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);
  const { user } = useAuth();
  const [exportLoading, setExportLoading] = useState(false);
  const [exportType, setExportType] = useState(null);

  const userId = user?._id || user?.id;

  const isOwner = workspace?.owner?._id === userId || workspace?.owner === userId;

  const isAdmin = workspace?.admins?.some((admin) => (admin?._id || admin) === userId);

  const canViewTeamAnalytics = isOwner || isAdmin;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleExportReport = async () => {
    try {
      setExportType("pdf");
      setExportLoading(true);
      setExportOpen(false);

      const res = await getAnalyticsReport(workspaceId);
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${workspace.name}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Report export failed:", error);
    } finally {
      setExportLoading(false);
      setExportType(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExportType("csv");
      setExportLoading(true);
      setExportOpen(false);

      const res = await getCSVReport(workspaceId);
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${workspace.name}-tasks.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("CSV export failed:", error);
    } finally {
      setExportLoading(false);
      setExportType(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Analytics Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Workspace Analytics</h1>
            <p className="text-sm text-text-secondary mt-1">Track workspace progress, workload and team performance.</p>
          </div>

          {/* Export Dropdown */}
          <div ref={exportRef} className="relative">
            <button
              disabled={exportLoading}
              onClick={() => !exportLoading && setExportOpen((prev) => !prev)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition min-w-[155px] ${
                exportLoading ? "bg-primary/70 cursor-not-allowed text-white" : "bg-primary hover:opacity-90 text-white"
              }`}
            >
              <Download size={17} />
              Export Report
              <ChevronDown size={16} className={`transition-transform duration-200 ${exportOpen ? "rotate-180" : ""}`} />
            </button>

            {exportOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-30">
                <button
                  onClick={handleExportReport}
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

      <KPISection workspaceId={workspaceId} />

      {workspace?.githubRepo && <GithubAnalytics workspaceId={workspaceId} githubRepo={workspace.githubRepo} />}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <TaskTrendChart workspaceId={workspaceId} />
        <TaskStatusChart workspaceId={workspaceId} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <PriorityChart workspaceId={workspaceId} />
        <InsightsSection workspaceId={workspaceId} />
      </div>

      <DeadlineSection workspaceId={workspaceId} />

      {canViewTeamAnalytics && (
        <>
          <WorkloadChart workspaceId={workspaceId} />
          <MemberPerformance workspaceId={workspaceId} />
        </>
      )}

      {/* Export Loading Modal */}
      <ExportLoadingModal open={exportLoading} type={exportType} />
    </div>
  );
}