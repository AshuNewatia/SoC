// src/components/dashboard/RecentActivity.jsx
import { motion } from "framer-motion";
import { 
  Activity, 
  Plus, 
  Edit3, 
  MessageSquare, 
  UserPlus, 
  CheckCircle, 
  Trash2,
  Users,
  FolderKanban
} from "lucide-react";

export default function RecentActivity({ activities }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case "task_created": return <Plus size={14} className="text-emerald-600" />;
      case "task_updated": return <Edit3 size={14} className="text-blue-600" />;
      case "task_completed": return <CheckCircle size={14} className="text-green-600" />;
      case "task_deleted": return <Trash2 size={14} className="text-red-600" />;
      case "workspace_created": return <FolderKanban size={14} className="text-purple-600" />;
      case "member_added": return <UserPlus size={14} className="text-indigo-600" />;
      case "member_removed": return <Users size={14} className="text-rose-600" />;
      case "comment_added": return <MessageSquare size={14} className="text-amber-600" />;
      default: return <Activity size={14} className="text-slate-600" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "task_created": return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "task_updated": return "bg-blue-50 text-blue-600 border-blue-200";
      case "task_completed": return "bg-green-50 text-green-600 border-green-200";
      case "task_deleted": return "bg-red-50 text-red-600 border-red-200";
      case "workspace_created": return "bg-purple-50 text-purple-600 border-purple-200";
      case "member_added": return "bg-indigo-50 text-indigo-600 border-indigo-200";
      case "member_removed": return "bg-rose-50 text-rose-600 border-rose-200";
      case "comment_added": return "bg-amber-50 text-amber-600 border-amber-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getActionLabel = (type) => {
    switch (type) {
      case "task_created": return "Created";
      case "task_updated": return "Updated";
      case "task_completed": return "Completed";
      case "task_deleted": return "Deleted";
      case "workspace_created": return "Created Workspace";
      case "member_added": return "Added Member";
      case "member_removed": return "Removed Member";
      case "comment_added": return "Commented";
      default: return type?.replace(/_/g, " ") || "Activity";
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[420px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-5 border-b border-slate-100 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-text-primary">
            Recent Activity
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {activities.length} {activities.length === 1 ? "activity" : "activities"} across workspaces
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 border border-green-200">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-semibold text-green-700 uppercase tracking-wider">
              Live Updates
            </span>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto minimalist-scrollbar">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 px-4 text-center">
            <div className="text-5xl mb-3">🚀</div>
            <h3 className="text-base font-semibold text-text-primary">
              No recent activity
            </h3>
            <p className="text-sm text-text-secondary mt-1 max-w-xs">
              Team activity will appear here once collaboration begins.
            </p>
          </div>
        ) : (
          <div className="relative pl-6">
            {/* Vertical timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>
            
            {activities.slice(0, 8).map((activity, index) => (
              <motion.div
                key={activity._id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex items-start gap-4 px-4 sm:px-6 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50/80 hover:shadow-sm hover:border-l-4 hover:border-primary transition-all duration-200 cursor-default"
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm -ml-[6px]"></div>

                {/* Avatar/Icon */}
                <div className={`w-9 h-9 rounded-xl border ${getActivityColor(activity.type)} flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-105`}>
                  {getActivityIcon(activity.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary leading-relaxed break-words">
                    <span className="font-semibold text-text-primary">
                      {activity.userId?.name || "User"}
                    </span>
                    <span className="text-text-secondary"> {activity.description || "performed an action"} </span>
                    <span className="text-text-secondary">in</span>
                    <span className="font-medium text-primary"> {activity.workspaceId?.name || "Workspace"}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[11px] text-text-secondary">
                      {getTimeAgo(activity.createdAt)}
                    </span>
                    <span className="text-text-secondary">•</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {getActionLabel(activity.actionType)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}