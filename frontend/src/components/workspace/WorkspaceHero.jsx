// src/components/workspace/WorkspaceHero.jsx
import { FolderKanban, Settings, Users, ListTodo, GitBranch, Circle, Calendar, User } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkspaceHero({
  workspace,
  onSettingsClick,
  tasks,
  onlineUsers = []
}) {
  if (!workspace) return null;

  const memberCount = workspace.members?.length || 0;
  const isOnline = onlineUsers.length > 0;

  const getTimeAgo = (date) => {
    if (!date) return "Recently";
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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden bg-gradient-to-r from-white via-sky-50/40 to-primary/5 rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Decorative blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left Side */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 md:gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 3 }}
              className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-primary/20"
            >
              <FolderKanban size={20} className="text-primary lg:text-[24px]" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight text-text-primary truncate">
                {workspace.name || "Untitled Workspace"}
              </h1>
              <p className="text-xs md:text-sm text-text-secondary truncate">
                {workspace.description || "No description"}
              </p>
            </div>
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-3 md:mt-4">
            {/* Members */}
            <div className="px-2 md:px-3 py-1 md:py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-1 md:gap-1.5 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 cursor-default">
              <Users size={14} className="text-indigo-500 md:text-[16px]" />
              <span className="text-xs md:text-sm font-medium text-slate-600">
                {memberCount} {memberCount === 1 ? "Member" : "Members"}
              </span>
            </div>

            {/* Tasks */}
            <div className="px-2 md:px-3 py-1 md:py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-1 md:gap-1.5 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 cursor-default">
              <ListTodo size={14} className="text-primary md:text-[16px]" />
              <span className="text-xs md:text-sm font-medium text-slate-600">
                {tasks} {tasks === 1 ? "Task" : "Tasks"}
              </span>
            </div>

            {/* Online Users */}
            {onlineUsers.length > 0 && (
              <div className="px-2 md:px-3 py-1 md:py-1.5 bg-green-50 rounded-lg border border-green-200 flex items-center gap-1 md:gap-1.5">
                <Circle size={10} className="fill-green-500 text-green-500 animate-pulse" />
                <span className="text-xs md:text-sm font-medium text-green-700">
                  {onlineUsers.length} Online
                </span>
              </div>
            )}

            {/* GitHub Badge */}
            {workspace.githubRepo ? (
              <div className="px-2 md:px-3 py-1 md:py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 flex items-center gap-1 md:gap-1.5 hover:bg-emerald-100 transition-all duration-200">
                <GitBranch size={14} className="text-emerald-600 md:text-[16px]" />
                <a
                  href={`https://github.com/${workspace.githubRepo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs md:text-sm font-medium hover:underline"
                >
                  GitHub Connected
                </a>
              </div>
            ) : (
              <div className="px-2 md:px-3 py-1 md:py-1.5 bg-slate-50 text-slate-500 rounded-lg border border-slate-200 flex items-center gap-1 md:gap-1.5">
                <GitBranch size={14} className="md:text-[16px]" />
                <span className="text-xs md:text-sm">Not Linked</span>
              </div>
            )}
          </div>

          {/* Owner & Created Info */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-secondary">
            <div className="flex items-center gap-1">
              <User size={12} />
              <span>Created by {workspace.owner?.name || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{workspace.createdAt ? new Date(workspace.createdAt).toLocaleDateString([], { month: "short", year: "numeric" }) : "Recently"}</span>
            </div>
          </div>
        </div>

        {/* Right Side */}
        {/* Right Side */}
        <div className="flex flex-col items-end justify-start gap-3 shrink-0 w-full sm:w-auto self-start">
          {/* Updated */}
          <div className="px-2 md:px-3 py-0.5 md:py-1 rounded-md bg-slate-100 text-[10px] md:text-xs text-slate-500 font-medium border border-slate-200/40 whitespace-nowrap">
            Updated {getTimeAgo(workspace.updatedAt)}
          </div>

          {/* Settings Button */}
          <button
            onClick={onSettingsClick}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-primary text-white rounded-lg text-xs md:text-sm hover:bg-primary-hover transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
          >
            <Settings size={14} className="md:size-3.5" />
            <span className="hidden sm:inline">Workspace Settings</span>
            <span className="sm:hidden">Settings</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}