import WorkspaceHero from "../components/workspace/WorkspaceHero";
import WorkspaceNav from "../components/workspace/WorkspaceNav";
import WorkspaceOverview from "../components/workspace/overview/WorkspaceOverview";
import { workspaces } from "../data/workspaces";
import { useParams } from "react-router-dom";
import { Outlet } from "react-router-dom";


export default function Workspace() {
  const { id } = useParams();

  const workspace = workspaces.find(
    (w) => w.id === id
  );

  return (
    <div className="p-5 space-y-4">
      <WorkspaceNav />

      <Outlet />

    </div>
  );
}