import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import Skeleton from "../../common/Skeleton";
import { getWorkspaceMemberPerformance } from "../../../services/workspaceAnalyticsService";

export default function MemberPerformance({ workspaceId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchPerformance = async () => {
      try {
        const { data } =
          await getWorkspaceMemberPerformance(workspaceId);

        setMembers(data);
      } catch (error) {
        console.error(
          "Failed to fetch workspace member performance",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [workspaceId]);
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

        <Skeleton className="h-7 w-52 mb-2" />

        <Skeleton className="h-4 w-72 mb-8" />

        {[1, 2, 3, 4].map((row) => (
          <div
            key={row}
            className="flex items-center justify-between py-5 border-t border-slate-100"
          >

            <div className="flex items-center gap-4">

              <Skeleton className="w-11 h-11 rounded-full" />

              <div>
                <Skeleton className="h-4 w-32" />
              </div>

            </div>

            <Skeleton className="h-4 w-8" />

            <Skeleton className="h-4 w-8" />

            <Skeleton className="h-2 w-40 rounded-full" />

            <Skeleton className="h-7 w-16 rounded-full" />

          </div>
        ))}

      </div>
    );
  }

  if (!members.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10">

          <div className="flex flex-col items-center justify-center h-65 text-center">

            <CheckCircle2
              size={42}
              className="text-slate-400"
            />

            <h3 className="mt-5 text-lg font-semibold text-text-primary">
              No Team Performance Yet
            </h3>

            <p className="mt-2 text-sm text-text-secondary max-w-sm">
              Member statistics will appear once tasks are assigned and completed.
            </p>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Team Performance
          </h2>

          <p className="text-sm text-text-secondary mt-1">
            Individual contribution and task completion overview
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          {members.length} Members
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">

          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary">
                Member
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary">
                Assigned
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary">
                Completed
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary">
                Completion
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary">
                Overdue
              </th>
            </tr>
          </thead>

          <tbody>
            {members.map((member) => (
              <tr
                key={member.id}
                className="border-t border-slate-200 hover:bg-slate-50 transition"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">

                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                      {member.name
                        ?.split(" ")
                        .map((name) => name[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <span className="font-medium text-text-primary">
                      {member.name}
                    </span>

                  </div>
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <Clock3
                      size={16}
                      className="text-slate-400"
                    />

                    {member.assigned}
                  </div>
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 size={16} />

                    {member.completed}
                  </div>
                </td>

                <td className="px-6 py-5 w-64">
                  <div className="flex items-center gap-4">

                    <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${member.completion}%`,
                        }}
                      />
                    </div>

                    <span className="w-10 text-right font-semibold">
                      {member.completion}%
                    </span>

                  </div>
                </td>

                <td className="px-6 py-5">
                  {member.overdue === 0 ? (
                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      None
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                      <AlertTriangle size={12} />

                      {member.overdue}
                    </span>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}