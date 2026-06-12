import React from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  GitBranch, 
  Zap, 
  Layers, 
  ArrowRight
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/30 font-sans selection:bg-primary selection:text-white flex flex-col overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
              C
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight hidden sm:block">
              CampusFlow
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link to="/login" className="text-slate-600 hover:text-primary font-medium transition-colors px-3 py-2 text-sm sm:text-base">
              Log in
            </Link>
            <Link to="/signup" className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base rounded-xl font-semibold transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 flex items-center overflow-hidden relative">
        {/* Animated background blobs */}
        <div className="absolute top-20 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-0 w-64 sm:w-80 h-64 sm:h-80 bg-sky-200/30 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 w-full">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-4 sm:mb-6">
              Master your campus{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">
                collaboration.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              The ultimate collaborative workspace for IIT Indore. Manage research
              labs, course projects, and campus events with real-time Kanban boards,
              GitHub sync, and automated analytics.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 justify-center lg:justify-start">
              <Link
                to="/dashboard"
                className="group w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>

          {/* Right Side – Compact 2x2 Grid with Static Central Blue Glow */}
          <div className="flex-1 flex justify-center items-center relative w-full mt-8 lg:mt-0">
            {/* Central static blue glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-primary/30 blur-3xl" />
            </div>

            {/* Card grid (Responsive cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-md sm:max-w-lg relative z-10">
              {/* Card 1 – Workspaces */}
              <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-5 rounded-2xl shadow-2xl border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:-translate-y-1 group cursor-default">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                  <Layers size={22} className="text-primary" />
                </div>
                <h3 className="font-semibold text-slate-800 text-base sm:text-lg mb-1 sm:mb-2">Workspaces</h3>
                <p className="text-xs sm:text-sm text-slate-500">Separate spaces for courses, events & research</p>
              </div>

              {/* Card 2 – Kanban Board */}
              <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-5 rounded-2xl shadow-2xl border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:-translate-y-1 group cursor-default">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                  <LayoutDashboard size={22} className="text-primary" />
                </div>
                <h3 className="font-semibold text-slate-800 text-base sm:text-lg mb-1 sm:mb-2">Kanban Board</h3>
                <p className="text-xs sm:text-sm text-slate-500">Drag & drop: To Do → In Progress → Done</p>
              </div>

              {/* Card 3 – Real-time Sync */}
              <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-5 rounded-2xl shadow-2xl border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:-translate-y-1 group cursor-default">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                  <Zap size={22} className="text-primary" />
                </div>
                <h3 className="font-semibold text-slate-800 text-base sm:text-lg mb-1 sm:mb-2">Real-time Sync</h3>
                <p className="text-xs sm:text-sm text-slate-500">Live updates – no refresh needed</p>
              </div>

              {/* Card 4 – GitHub Integration */}
              <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-5 rounded-2xl shadow-2xl border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:-translate-y-1 group cursor-default">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                  <GitBranch size={22} className="text-primary" />
                </div>
                <h3 className="font-semibold text-slate-800 text-base sm:text-lg mb-1 sm:mb-2">GitHub Sync</h3>
                <p className="text-xs sm:text-sm text-slate-500">Bidirectional issues & tasks</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm py-6 sm:py-8 text-center border-t border-slate-200/50 mt-auto relative z-10">
        <p className="text-slate-500 text-xs sm:text-sm px-4">
          © 2026 CampusFlow — Built exclusively for IIT Indore
        </p>
      </footer>
    </div>
  );
}