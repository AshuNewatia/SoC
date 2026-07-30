import { useState, useEffect } from "react"; // 👈 Added useEffect
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { WorkspaceProvider } from "./context/workspaceContext";

import Landing from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import WorkSpace from "./pages/WorkSpace";
import MyBoard from "./pages/MyBoard";
import OAuthCallback from "./pages/OAuthCallback";
import CreateProfile from "./pages/CreateProfile";
import ViewProfile from "./pages/ViewProfile";
import JoinWorkspace from "./pages/JoinWorkspace";
import Invitation from "./pages/Invitation";

import WorkspaceOverview from "./components/workspace/overview/WorkspaceOverview"
import WorkspaceAnalytics from "./components/workspace/WorkspaceAnalytics";
import WorkspaceActivity from "./components/workspace/WorkspaceActivity";
import WorkspaceMembers from "./components/workspace/WorkspaceMembers";
import WorkspaceBoard from "./components/workspace/WorkspaceBoard";

import Sidebar from "./components/sidebar/Sidebar";
import Header from "./components/header/Header";
import { useAuth } from "./context/authContext";
import socket from "./services/socket";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function AuthenticatedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaceSearch, setWorkspaceSearch] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const userId = user._id || user.id;
    if (!userId) {
      console.log("⚠️ Still missing ID! Click the arrow on this object to find where the ID is stored:", user);
      return;
    }

    // console.log(`🚀 Attempting to emit joinRoom for ID: ${userId}`);

    socket.connect();
    socket.emit("joinRoom", userId);

    socket.on("connect", () => {
      // console.log("🟢 Success! Frontend socket successfully connected to backend server. ID:", socket.id);
    });

    return () => {
      socket.off("joinRoom");
      socket.off("connect");
    };
  }, [user]);

  return (
    <WorkspaceProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} workspaceSearch={workspaceSearch} />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} setWorkspaceSearch={setWorkspaceSearch} workspaceSearch={workspaceSearch} />

          <main className="flex-1 overflow-y-auto focus:outline-none">
            <Outlet />
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/join/workspace/:token" element={<JoinWorkspace />} />

        <Route path="/create-profile" element={<CreateProfile />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedLayout />}>

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/myboard" element={<MyBoard />} />
            <Route path="/profile" element={<ViewProfile />} />
            <Route path="/invitations/:invitationId" element={<Invitation/>}/>

            <Route path="/workspace/:id" element={<WorkSpace />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<WorkspaceOverview />} />
              <Route path="board" element={<WorkspaceBoard />} />
              <Route path="analytics" element={<WorkspaceAnalytics />} />
              <Route path="activity" element={<WorkspaceActivity />} />
              <Route path="members" element={<WorkspaceMembers />} />
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;