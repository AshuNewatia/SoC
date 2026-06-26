export default function RecentActivity({ activities }) {
  return (
    <div className="mt-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Activity Timeline
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Latest updates across all workspaces
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-sm font-medium text-slate-500">
            {activities.length} Events
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 border border-green-200">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>

            <span className="text-xs font-semibold text-green-700">
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-h-105 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              🕒
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-700">
              No recent activity
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Activity will appear here as your team collaborates.
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity._id}
              className="flex gap-4 p-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
            >
              {/* Avatar */}
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                {activity.userId?.name?.[0]?.toUpperCase() || "U"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed text-slate-700">
                  <span className="font-semibold text-slate-900">
                    {activity.userId?.name || "User"}
                  </span>{" "}
                  {activity.description}
                  {" "}
                  <span className="text-slate-500">
                    in
                  </span>{" "}
                  <span className="font-semibold text-primary">
                    {activity.workspaceId?.name || "Workspace"}
                  </span>
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>

                  <span className="text-slate-300">•</span>

                  <span className="text-xs font-medium text-slate-500">
                    {activity.actionType?.replaceAll("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}