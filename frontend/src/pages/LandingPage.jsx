import React from "react";
import { Link } from "react-router-dom";
import { GitBranch, CheckCircle2 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg-light font-sans selection:bg-primary selection:text-white flex flex-col">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-surface/80 backdrop-blur-md border-b border-border-light">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">
              C
            </div>
            <span className="text-xl font-bold text-text-primary tracking-tight">
              CampusFlow
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-text-secondary hover:text-text-primary font-medium transition-colors px-4 py-2"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-primary/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 pt-32 pb-10 px-6 flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 w-full">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-text-primary leading-[1.15] tracking-tight mb-6">
              Master your campus <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">
                collaboration.
              </span>
            </h1>
            <p className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              The ultimate collaborative workspace for IIT Indore. Manage research
              labs, course projects, and campus events with real-time Kanban boards,
              GitHub sync, and automated analytics.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>

          {/* Right Floating Elements (Hero Graphic) */}
          <div className="flex-1 relative w-full max-w-lg lg:max-w-none h-[400px]">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>

            {/* Floating Kanban Card 1 */}
            <div
              className="absolute top-10 left-10 bg-surface p-5 rounded-[1rem] shadow-xl border border-border-light w-64 animate-float"
              style={{ animationDelay: "0s" }}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-700 rounded-md">
                  In Progress
                </span>
                <GitBranch size={16} className="text-text-secondary" />
              </div>
              <h3 className="font-semibold text-text-primary text-sm mb-1">
                Fix Navigation Bar
              </h3>
              <p className="text-xs text-text-secondary mb-4">CS301 Project Team</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-light">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary border-2 border-white text-[10px] text-white flex items-center justify-center">
                    H
                  </div>
                  <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white text-[10px] text-white flex items-center justify-center">
                    A
                  </div>
                </div>
                <span className="text-[10px] text-text-secondary">#Issue 42</span>
              </div>
            </div>

            {/* Floating Done Card 2 */}
            <div
              className="absolute bottom-10 right-10 bg-surface p-5 rounded-[1rem] shadow-xl border border-border-light w-64 animate-float"
              style={{ animationDelay: "2s" }}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold px-2 py-1 bg-success/10 text-success rounded-md">
                  Verified Done
                </span>
                <CheckCircle2 size={16} className="text-success" />
              </div>
              <h3 className="font-semibold text-text-primary text-sm mb-1">
                Literature Review
              </h3>
              <p className="text-xs text-text-secondary mb-4">AI Research Lab</p>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-light">
                <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-red-600">PDF</span>
                </div>
                <span className="text-xs text-text-secondary">Attached</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface py-6 text-center border-t border-border-light mt-auto">
        <p className="text-text-secondary text-sm">
          © 2026 CampusFlow. Built exclusively for IIT Indore.
        </p>
      </footer>
    </div>
  );
}