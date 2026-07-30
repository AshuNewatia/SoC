// src/components/dashboard/Hero.jsx
import { motion } from "framer-motion";

export default function Hero({ user, summary, greeting, onCreateWorkspace }) {
  const isProfessor = user?.role === "professor";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden bg-gradient-to-r from-white via-sky-50/40 to-primary/5 rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm"
    >
      {/* Decorative blur circle */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        {/* Left Column */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary">
            {greeting} 👋
            <br />
            <span className="text-primary">Welcome back, {user.name?.split(' ')[0]}!</span>
          </h1>
          <p className="text-text-secondary mt-2 text-base md:text-lg max-w-2xl">
            {isProfessor
              ? "Monitor student progress, review submissions, and keep projects on schedule."
              : "Stay on top of your tasks and collaborate effectively with your team."}
          </p>
          <motion.button
            onClick={onCreateWorkspace}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 px-6 py-3.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/30 hover:shadow-xl flex items-center gap-2 font-semibold"
          >
            <span>+</span> Create Workspace
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}