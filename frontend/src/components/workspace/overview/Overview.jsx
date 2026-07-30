// src/components/workspace/overview/Overview.jsx
import { Plus, Activity, CheckCircle2, Users, Clock3 } from "lucide-react";
import { motion } from "framer-motion";

export default function Overview({
  onlineUsers,
  totalTasks,
  completedTasks,
  onCreateTask,
}) {
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingTasks = totalTasks - completedTasks;

  // Stagger animation for stats cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8 rounded-3xl border border-border-light bg-white to-primary/5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-2xl lg:text-[32px] font-bold text-text-primary leading-tight tracking-tight">
              Workspace Overview
            </h1>
            <p className="mt-1 md:mt-2 text-sm md:text-base text-text-secondary leading-7">
              Track progress, manage tasks, and collaborate efficiently.
            </p>
          </div>
          <motion.button
            onClick={() => onCreateTask("todo")}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-xl bg-primary text-white font-medium shadow-sm hover:shadow-lg transition-all duration-300 text-sm md:text-base"
          >
            <Plus size={18} />
            Create Task
          </motion.button>
        </div>

        {/* Progress */}
        <div className="mt-6 md:mt-8">
          <div className="flex justify-between mb-1.5">
            <span className="text-sm font-medium text-text-secondary">Sprint Progress</span>
            <span className="text-sm font-semibold text-text-primary">{progress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-text-secondary">
          {completedTasks} of {totalTasks} tasks completed
        </p>

        {/* Stats – responsive grid: 2 cols on mobile, 4 on large */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8"
        >
          {/* Active Tasks */}
          <motion.div
            variants={cardVariants}
            className="group rounded-2xl border border-border-light bg-white p-4 md:p-5 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 group-hover:bg-primary transition-all duration-300 flex items-center justify-center">
                <Activity size={18} className="text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="text-xs md:text-sm text-text-secondary">Active Tasks</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold mt-2 md:mt-3 text-text-primary">{totalTasks}</p>
          </motion.div>

          {/* Completed */}
          <motion.div
            variants={cardVariants}
            className="group rounded-2xl border border-border-light bg-white p-4 md:p-5 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 group-hover:bg-emerald-500 transition-all duration-300 flex items-center justify-center">
                <CheckCircle2 size={18} className="text-emerald-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="text-xs md:text-sm text-text-secondary">Completed</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold mt-2 md:mt-3 text-text-primary">{completedTasks}</p>
          </motion.div>

          {/* Members Online */}
          <motion.div
            variants={cardVariants}
            className="group rounded-2xl border border-border-light bg-white p-4 md:p-5 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 group-hover:bg-indigo-500 transition-all duration-300 flex items-center justify-center">
                <Users size={18} className="text-indigo-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="text-xs md:text-sm text-text-secondary">Members Online</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold mt-2 md:mt-3 text-text-primary">{onlineUsers.length}</p>
          </motion.div>

          {/* Pending */}
          <motion.div
            variants={cardVariants}
            className="group rounded-2xl border border-border-light bg-white p-4 md:p-5 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-11 h-11 rounded-xl bg-violet-50 group-hover:bg-violet-500 transition-all duration-300 flex items-center justify-center">
                <Clock3 size={18} className="text-violet-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="text-xs md:text-sm text-text-secondary">Pending</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold mt-2 md:mt-3 text-text-primary">
              {pendingTasks === 0 ? "0 🎉" : pendingTasks}
            </p>
          </motion.div>
        </motion.div>

        {/* Active Collaborators */}
        <div className="mt-6 md:mt-8">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Active Collaborators</h3>
          {onlineUsers.length === 0 ? (
            <div className="text-sm text-text-secondary italic">No members online</div>
          ) : (
            <div className="flex -space-x-2.5">
              {onlineUsers.slice(0, 5).map((user, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group/collab"
                >
                  <div className="h-10 w-10 md:h-11 md:w-11 rounded-full border-2 border-white bg-gradient-to-br from-primary to-primary-hover text-white flex items-center justify-center font-semibold text-sm shadow-md hover:scale-105 transition-transform duration-200 cursor-default">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/collab:opacity-100 transition-opacity duration-200 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                    {user.name || 'User'}
                  </div>
                </motion.div>
              ))}

              {onlineUsers.length > 5 && (
                <div className="h-10 w-10 md:h-11 md:w-11 rounded-full border-2 border-white bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-sm shadow-md">
                  +{onlineUsers.length - 5}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}