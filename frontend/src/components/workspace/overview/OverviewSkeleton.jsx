// src/components/workspace/overview/OverviewSkeleton.jsx
export default function OverviewSkeleton() {
  return (
    <div className="mb-8 rounded-3xl border border-border-light bg-white shadow-sm overflow-hidden">
      <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-pulse">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="h-8 bg-slate-200 rounded-lg w-48" />
            <div className="h-4 bg-slate-200 rounded-lg w-64" />
          </div>
          <div className="h-11 bg-slate-200 rounded-xl w-32" />
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-slate-200 rounded w-32" />
            <div className="h-4 bg-slate-200 rounded w-12" />
          </div>
          <div className="h-2.5 bg-slate-200 rounded-full" />
          <div className="h-3 bg-slate-200 rounded w-40" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-border-light p-4 md:p-5 space-y-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-200" />
                <div className="h-4 bg-slate-200 rounded w-16" />
              </div>
              <div className="h-8 bg-slate-200 rounded w-12" />
            </div>
          ))}
        </div>

        {/* Collaborators */}
        <div className="space-y-3">
          <div className="h-5 bg-slate-200 rounded w-40" />
          <div className="flex -space-x-2.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-slate-200 border-2 border-white" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}