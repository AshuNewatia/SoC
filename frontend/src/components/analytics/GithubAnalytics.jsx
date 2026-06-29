import React, { useEffect, useState } from "react";
import {
  GitPullRequest,
  GitCommit,
  GitBranch,
  GitGraph,
} from "lucide-react";

import { getGithubAnalytics } from "../../services/analyticsService";

export default function GithubAnalytics() {
  const [githubStats, setGithubStats] = useState({
    commits: 0,
    pullRequests: 0,
    mergedPRs: 0,
    branches: 0,
    contributionScore: 0,
  });

  useEffect(() => {
    const fetchGithubStats = async () => {
      try {
        const { data } =
          await getGithubAnalytics();

        setGithubStats(data);
      } catch (error) {
        console.error(
          "Failed to fetch github analytics",
          error
        );
      }
    };

    fetchGithubStats();
  }, []);

  const cards = [
    {
      title: "Commits",
      value: githubStats.commits,
      icon: GitCommit,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Pull Requests",
      value: githubStats.pullRequests,
      icon: GitPullRequest,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      title: "Merged PRs",
      value: githubStats.mergedPRs,
      icon: GitGraph,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      title: "Branches",
      value: githubStats.branches,
      icon: GitBranch,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="bg-surface border border-border-light rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            GitHub Analytics
          </h3>

          <p className="text-sm text-text-secondary mt-1">
            Repository contribution overview
          </p>
        </div>

        <GitGraph
          size={22}
          className="text-slate-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border border-border-light p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg}`}
                >
                  <Icon
                    size={18}
                    className={item.color}
                  />
                </div>

                <span className="text-2xl font-bold text-text-primary">
                  {item.value}
                </span>
              </div>

              <p className="text-sm text-text-secondary">
                {item.title}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-text-primary">
            Contribution Score
          </span>

          <span className="text-sm font-semibold text-primary">
            {githubStats.contributionScore}%
          </span>
        </div>

        <div className="h-2 bg-border-light rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{
              width: `${githubStats.contributionScore}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}