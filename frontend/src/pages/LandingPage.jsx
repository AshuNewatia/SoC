import React from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  GitBranch, 
  Layers, 
  ArrowRight,
  CheckCircle,
  Users
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg-light font-sans selection:bg-primary selection:text-white flex flex-col overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-surface/90 backdrop-blur-md border-b border-border-light shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-xl shadow-md">
              C
            </div>
            <span className="text-2xl font-bold bg-linear-to-r from-text-primary to-text-secondary bg-clip-text text-transparent tracking-tight hidden sm:block">
              CampusFlow
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link to="/login" className="text-text-secondary hover:text-primary font-medium transition-colors px-3 py-2 text-sm sm:text-base">
              Log in
            </Link>
            <Link to="/signup" className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base rounded-xl font-semibold transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-text-primary leading-[1.05] tracking-[-0.04em] mb-6">
              Manage Projects,<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary-hover">
                Research & Teams
              </span><br />
              in One Workspace.
            </h1>
            <p className="text-base sm:text-xl text-text-secondary mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              The ultimate collaborative workspace for IIT Indore. Manage research
              labs, course projects, and campus events with real-time Kanban boards,
              GitHub sync, and automated analytics.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
              <Link
                to="/dashboard"
                className="group w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Start Collaborating
                <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>

          {/* Right Side – Dashboard Preview */}
          <div className="flex-1 relative w-full max-w-2xl mx-auto lg:mx-0 mt-12 lg:mt-0">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
            </div>

            <div className="relative z-10 bg-surface/90 backdrop-blur-md rounded-2xl shadow-2xl border border-border-light/80 overflow-hidden hover:shadow-3xl transition-shadow duration-300">
              {/* Mockup Header */}
              <div className="bg-linear-to-r from-text-primary to-[#1E293B] px-5 py-4 flex items-center justify-between border-b border-border-light/20">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white text-xs font-bold">C</div>
                  <span className="text-white font-semibold text-sm">CampusFlow</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
              </div>
              {/* Mockup Kanban Board */}
              <div className="p-5 bg-bg-light">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface rounded-xl shadow-sm border border-border-light p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-text-primary text-sm">To Do</h4>
                      <span className="text-xs text-text-secondary">3</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-bg-light p-2 rounded-lg border border-border-light text-xs">
                        <p className="font-medium">OAuth Integration</p>
                        <p className="text-text-secondary text-[11px]">API · Backend</p>
                      </div>
                      <div className="bg-bg-light p-2 rounded-lg border border-border-light text-xs">
                        <p className="font-medium">Analytics Dashboard</p>
                        <p className="text-text-secondary text-[11px]">Frontend</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface rounded-xl shadow-sm border border-border-light p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-text-primary text-sm">In Progress</h4>
                      <span className="text-xs text-text-secondary">2</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-primary/10 p-2 rounded-lg border border-primary/30 text-xs">
                        <p className="font-medium">Real‑time Sync</p>
                        <p className="text-text-secondary text-[11px]">WebSocket</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface rounded-xl shadow-sm border border-border-light p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-text-primary text-sm">Done</h4>
                      <span className="text-xs text-text-secondary">4</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-success/10 p-2 rounded-lg border border-success/30 text-xs line-through text-text-secondary">
                        <p className="font-medium">Login System</p>
                        <p className="text-text-secondary text-[11px]">Auth</p>
                      </div>
                      <div className="bg-success/10 p-2 rounded-lg border border-success/30 text-xs line-through text-text-secondary">
                        <p className="font-medium">Project Setup</p>
                        <p className="text-text-secondary text-[11px]">Infra</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-text-secondary pt-3 border-t border-border-light">
                  <div className="flex items-center gap-2">
                    <GitBranch size={12} /> GitHub Connected
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={12} /> 8 members
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={12} /> 67% done
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 sm:px-6 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
              How CampusFlow Works
            </h2>
            <p className="text-text-secondary mt-3 max-w-2xl mx-auto">
              Everything you need to collaborate seamlessly – from ideation to delivery.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-surface/70 backdrop-blur-sm p-6 rounded-2xl border border-border-light/50 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Layers size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Workspaces</h3>
              <p className="text-text-secondary">Separate spaces for courses, research labs, or events.</p>
            </div>
            <div className="bg-surface/70 backdrop-blur-sm p-6 rounded-2xl border border-border-light/50 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <LayoutDashboard size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Manage Tasks</h3>
              <p className="text-text-secondary">Drag & drop Kanban board with real‑time updates.</p>
            </div>
            <div className="bg-surface/70 backdrop-blur-sm p-6 rounded-2xl border border-border-light/50 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <GitBranch size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sync with GitHub</h3>
              <p className="text-text-secondary">Bidirectional issues & commits – no extra work.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}