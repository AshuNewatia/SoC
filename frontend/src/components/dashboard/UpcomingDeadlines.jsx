// src/components/dashboard/UpcomingDeadlines.jsx
import { motion } from "framer-motion";
import { CalendarClock, Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";

export default function UpcomingDeadlines({
  tasks,
  currentUser,
  isProfessor,
}) {
  // 1. Filter tasks based on role
  const currentUserId = currentUser?.id || currentUser?._id;

  const filteredTasks = isProfessor
    ? tasks
    : tasks.filter((task) =>
        task.assignedTo?.some(
          (user) => user._id === currentUserId
        )
      );

  // 2. Compute upcoming (next 7 days) from the filtered tasks
  const upcomingTasks = filteredTasks
    .filter((task) => {
      if (!task.dueDate || task.status === "completed") return false;

      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      return dueDate >= today && dueDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const getDaysLeft = (dueDate) => {
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStatusInfo = (dueDate) => {
    const days = getDaysLeft(dueDate);
    
    if (days === 0) {
      return { 
        text: "Today", 
        color: "text-red-600 bg-red-50 border-red-200",
        icon: <AlertCircle size={14} className="text-red-600" />
      };
    }
    if (days === 1) {
      return { 
        text: "Tomorrow", 
        color: "text-orange-600 bg-orange-50 border-orange-200",
        icon: <Clock size={14} className="text-orange-600" />
      };
    }
    if (days <= 3) {
      return { 
        text: `${days} days left`, 
        color: "text-amber-600 bg-amber-50 border-amber-200",
        icon: <Clock size={14} className="text-amber-600" />
      };
    }
    if (days <= 7) {
      return { 
        text: `${days} days left`, 
        color: "text-blue-600 bg-blue-50 border-blue-200",
        icon: <Calendar size={14} className="text-blue-600" />
      };
    }
    return { 
      text: `${days} days`, 
      color: "text-slate-600 bg-slate-50 border-slate-200",
      icon: <Calendar size={14} className="text-slate-600" />
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[420px]"
    >
      {/* Header */}
      <div className="px-4 sm:px-6 py-5 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Upcoming Deadlines
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {upcomingTasks.length} {upcomingTasks.length === 1 ? "task" : "tasks"} due within 7 days
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10">
            <CalendarClock size={14} className="text-primary" />
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
              Upcoming
            </span>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto minimalist-scrollbar">
        {upcomingTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 px-4 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-base font-semibold text-text-primary">
              You're all caught up!
            </h3>
            <p className="text-sm text-text-secondary mt-1 max-w-xs">
              No deadlines this week. Keep up the great work!
            </p>
          </div>
        ) : (
          upcomingTasks.map((task, index) => {
            const statusInfo = getStatusInfo(task.dueDate);
            const days = getDaysLeft(task.dueDate);
            
            return (
              <motion.div
                key={task._id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80 hover:shadow-sm hover:border-l-4 hover:border-primary transition-all duration-200 cursor-default group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl ${statusInfo.color} border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}>
                    {statusInfo.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary text-sm truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {task.workspace?.name || "Workspace"}
                    </p>
                  </div>
                </div>
                
                <div className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusInfo.color} border shrink-0 ml-3`}>
                  {days === 0 ? "🔴" : days <= 2 ? "🟠" : "🟢"} {statusInfo.text}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}