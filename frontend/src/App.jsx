import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

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



import WorkspaceChat from "./components/workspace/WorkspaceChat";
import WorkspaceActivity from "./components/workspace/WorkspaceActivity";
import WorkspaceMembers from "./components/workspace/WorkspaceMembers";
import WorkspaceBoard from "./components/workspace/WorkspaceBoard";

import Sidebar from "./components/sidebar/Sidebar";
import Header from "./components/header/Header";
import { useAuth } from "./context/authContext";

// Auth Guard Guardrail
function ProtectedRoute() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // Renders the matched child route layouts/components
  return <Outlet />;
}

// Global Main Panel Layout Wrapper
function AuthenticatedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto focus:outline-none">
          {/* Renders the internal page component */}
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        
        {/* Profile Creation Route */}
        <Route path="/create-profile" element={<CreateProfile />} />

        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          {/* Authenticated Layout Wrapper */}
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/myboard" element={<MyBoard />} />
            <Route path="/profile" element={<ViewProfile />} />
            

            {/* Nested Workspace Routes */}
            <Route path="/workspace/:id" element={<WorkSpace />}>
              {/* Redirect /workspace/:id to /workspace/:id/overview automatically */}
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="board" element={<WorkspaceBoard />} />
              <Route path="chat" element={<WorkspaceChat />} />
              <Route path="activity" element={<WorkspaceActivity />} />
              <Route path="members" element={<WorkspaceMembers />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all Fallback (404 / Redirect) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;