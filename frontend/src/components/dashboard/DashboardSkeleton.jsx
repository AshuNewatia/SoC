// src/components/dashboard/DashboardSkeleton.jsx
import { motion } from "framer-motion";

export default function DashboardSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Hero Skeleton */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm animate-pulse">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex-1 space-y-4">
            <div className="h-10 bg-slate-200 rounded-lg w-2/3" />
            <div className="h-6 bg-slate-200 rounded-lg w-1/2" />
            <div className="h-14 bg-slate-200 rounded-xl w-48" />
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 min-h-[170px] animate-pulse">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-slate-200" />
            <div className="h-8 bg-slate-200 rounded w-16 mt-4" />
            <div className="h-6 bg-slate-200 rounded w-32 mt-2" />
            <div className="h-4 bg-slate-200 rounded w-24 mt-3" />
          </div>
        ))}
      </div>

      {/* Activity & Deadlines Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm min-h-[300px] animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-32 mb-4" />
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
                <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}