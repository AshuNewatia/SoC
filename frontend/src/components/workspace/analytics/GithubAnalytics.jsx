import { useState, useEffect } from "react";
import axios from "axios";
import { GitCommit, GitPullRequest, GitMerge } from "lucide-react";

export default function GithubAnalytics({ githubRepo, workspaceId }) {
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("useEffect running check. repo:", githubRepo, "ID:", workspaceId);

    if (!githubRepo) {
      setLoading(false);
      return;
    }

    async function fetchGitStats() {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`/api/workspace-analytics/github-stats?repo=${githubRepo}`);

        if (res.data && res.data.stats) {
          setRepoData(res.data.stats);
        } else {
          setRepoData(res.data);
        }
      } catch (err) {
        console.error("❌ Axios API Request Crashed:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load repo statistics.");
      } finally {
        setLoading(false);
      }
    }

    fetchGitStats();
  }, [githubRepo, workspaceId]); 

  if (loading) {
    return (
      <div className="bg-white border border-border-light rounded-2xl p-6 my-4 animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-20 bg-slate-50 rounded-xl"></div>
          <div className="h-20 bg-slate-50 rounded-xl"></div>
          <div className="h-20 bg-slate-50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 my-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-sans text-xs">
        <strong>GitHub Analytics Sync Error:</strong> {error}
      </div>
    );
  }

  if (!repoData) {
    return null;
  }

  return (
    <div className="bg-white border border-border-light rounded-2xl p-6 shadow-xs my-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">Linked Repository Insights</h3>
            <p className="text-xs text-text-secondary font-sans mt-0.5">{githubRepo}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold tracking-wider text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full uppercase">
          Live Syncing
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <GitCommit size={22} />
          </div>
          <div>
            <span className="block text-xs font-semibold text-text-secondary">Total Commits</span>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{repoData?.totalCommits ?? 0}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <GitPullRequest size={22} />
          </div>
          <div>
            <span className="block text-xs font-semibold text-text-secondary">Open Pull Requests</span>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{repoData?.openPRs ?? 0}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <GitMerge size={22} />
          </div>
          <div>
            <span className="block text-xs font-semibold text-text-secondary">Closed Pull Requests</span>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{repoData?.closedPRs ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}