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
// import GithubAnalytics from "../components/analytics/GithubAnalytics";
import InsightsSection from "../components/analytics/InsightsSection";


export default function Analytics() {

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
        {/* AI Insights */}
      <InsightsSection />
        
      </div>

      <ProductivityChart />

      {/* Members */}
      <MemberPerformance />
    </div>
  );
}