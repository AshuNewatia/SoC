import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  GitBranch,
  Layers,
  ArrowRight,
  CheckCircle,
  Users,
  CalendarDays,
  BarChart3,
  Bell,
  FileText,
} from "lucide-react";
import logo from "../assets/logo.png";

const features = [
  {
    icon: LayoutDashboard,
    title: "Smart Task Management",
    description:
      "Organize work with drag-and-drop Kanban boards, priorities, deadlines, and task assignments.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track workspace productivity, member performance, and project progress through beautiful insights.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Collaborate using comments, mentions, workspace invitations, and real-time updates.",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    description:
      "Stay updated with instant notifications for task assignments, comments, mentions, and deadlines.",
  },
  {
    icon: GitBranch,
    title: "GitHub Integration",
    description:
      "Connect repositories, sync issues, and keep development aligned with project management.",
  },
  {
    icon: FileText,
    title: "Professional Reports",
    description:
      "Export analytics as PDF and CSV reports to share project progress with your team.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-light via-white to-bg-light font-sans selection:bg-primary selection:text-white flex flex-col overflow-x-hidden">
      {/* Floating blur circles */}
      <div className="absolute top-40 left-0 w-72 h-72 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-border-light/70 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="CampusFlow"
              className="h-13 w-13 rounded-2xl shadow-lg"
            />
            <span className="text-2xl font-bold text-black bg-clip-text tracking-tight hidden sm:block">
              CampusFlow
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              to="/login"
              className="text-text-secondary hover:text-primary font-medium transition-all duration-200 hover:scale-105 px-3 py-2 text-sm sm:text-base"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-32 pb-16 px-4 sm:px-6 overflow-hidden relative"
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-text-primary leading-[1.05] tracking-[-0.04em] mb-6">
              Manage Projects,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">
                Research & Teams
              </span><br />
              in One Workspace.
            </h1>
            <p className="text-base sm:text-xl text-text-secondary mb-8 max-w-2xl mx-auto lg:mx-0 leading-8">
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
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1.5 transition-transform duration-300"
                />
              </Link>
            </div>
          </div>

          {/* Right Side – Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 relative w-full max-w-2xl mx-auto lg:mx-0 mt-12 lg:mt-0"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
            </div>

            <div className="relative z-10 bg-surface/90 backdrop-blur-md rounded-2xl shadow-2xl border border-border-light/80 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_70px_rgba(0,0,0,0.18)]">
              {/* Mockup Header */}
              <div className="bg-gradient-to-r from-text-primary to-[#1E293B] px-5 py-4 flex items-center justify-between border-b border-border-light/20">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white text-xs font-bold">CF</div>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-surface rounded-xl shadow-sm border border-border-light p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-text-primary text-sm">To Do</h4>
                      <span className="text-xs text-text-secondary">3</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-bg-light p-2 rounded-lg border border-border-light text-xs transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 cursor-pointer">
                        <p className="font-medium">OAuth Integration</p>
                        <p className="text-text-secondary text-[11px]">API · Backend</p>
                      </div>
                      <div className="bg-bg-light p-2 rounded-lg border border-border-light text-xs transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 cursor-pointer">
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
                      <div className="bg-primary/10 p-2 rounded-lg border border-primary/30 text-xs transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 cursor-pointer">
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
                      <div className="bg-success/10 p-2 rounded-lg border border-success/30 text-xs line-through text-text-secondary transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 cursor-pointer">
                        <p className="font-medium">Login System</p>
                        <p className="text-text-secondary text-[11px]">Auth</p>
                      </div>
                      <div className="bg-success/10 p-2 rounded-lg border border-success/30 text-xs line-through text-text-secondary transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 cursor-pointer">
                        <p className="font-medium">Project Setup</p>
                        <p className="text-text-secondary text-[11px]">Infra</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-text-secondary pt-3 border-t border-border-light">
                  <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
                    <GitBranch size={12} /> GitHub Connected
                  </div>
                  <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
                    <Users size={12} /> 8 members
                  </div>
                  <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
                    <CheckCircle size={12} /> 67% done
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ===== POWERFUL FEATURES SECTION ===== */}
      <section className="py-20 px-4 sm:px-6 bg-bg-light mt-30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center px-4 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm">
              Everything you need
            </span>

            <h2 className="mt-6 text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Powerful Features for Modern Teams
            </h2>

            <p className="mt-4 text-text-secondary max-w-3xl mx-auto leading-relaxed">
              CampusFlow combines project management, collaboration, analytics,
              reporting, and GitHub integration into one seamless workspace.
            </p>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="group bg-surface border border-border-light rounded-2xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-primary">
                    <Icon
                      size={26}
                      className="text-primary transition-colors duration-300 group-hover:text-white"
                    />
                  </div>

                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-text-secondary leading-7">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 text-center">
            <div>
              <h3 className="text-4xl font-bold text-primary">10+</h3>
              <p className="text-text-secondary mt-2">Core Features</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary">Real-Time</h3>
              <p className="text-text-secondary mt-2">Collaboration</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary">PDF + CSV</h3>
              <p className="text-text-secondary mt-2">Export Support</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary">GitHub</h3>
              <p className="text-text-secondary mt-2">Integration</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="py-20 px-4 sm:px-6 bg-surface/30"
      >
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
            {[
              {
                icon: Layers,
                title: "Create Workspaces",
                desc: "Separate spaces for courses, research labs, or events.",
              },
              {
                icon: LayoutDashboard,
                title: "Manage Tasks",
                desc: "Drag & drop Kanban board with real‑time updates.",
              },
              {
                icon: GitBranch,
                title: "Sync with GitHub",
                desc: "Bidirectional issues & commits – no extra work.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-surface/70 backdrop-blur-sm p-6 rounded-2xl border border-border-light/50 shadow-sm text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:bg-primary">
                  <feature.icon
                    size={24}
                    className="text-primary group-hover:text-white transition-colors duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border-light/70 bg-surface/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="CampusFlow" className="h-8 w-8 rounded-lg" />
              <span className="text-lg font-bold text-text-primary">CampusFlow</span>
              <span className="text-xs text-text-secondary hidden sm:inline">Built for IIT Indore</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-text-secondary">
              <span>© 2026 CampusFlow</span>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}