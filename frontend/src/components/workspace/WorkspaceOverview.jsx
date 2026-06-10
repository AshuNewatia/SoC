import WorkspaceHero from "./WorkspaceHero";
import { workspaces } from "../../data/workspaces";
import { useParams } from "react-router-dom";

export default function WorkspaceOverview({ workspace }) {
  const { id } = useParams();

  const ws= workspaces.find(
    (w) => w.id === id
  );
  return (
    <div className="space-y-4">
      <WorkspaceHero workspace={ws} />
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-2xl font-semibold">
        Workspace Overview
      </h2>

      <p className="mt-2 text-text-secondary">
        Workspace details will appear here.
      </p>
    </div>
    </div>
  );
}