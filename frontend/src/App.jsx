import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/LandingPage"
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import WorkSpace from "./pages/WorkSpace";
import MyBoard from "./pages/MyBoard";
import OAuthCallback from "./pages/OAuthCallback";
// 1. Import the new CreateProfile component
import CreateProfile from "./pages/CreateProfile"; 
import KanbanBoard from "./pages/KanbanBoard";

import WorkspaceChat from "./components/workspace/WorkspaceChat";
import WorkspaceActivity from "./components/workspace/WorkspaceActivity";
import WorkspaceOverview from "./components/workspace/WorkspaceOverview";
import WorkspaceMembers from "./components/workspace/WorkspaceMembers";
import WorkspaceBoard from "./components/workspace/WorkspaceBoard";

import Sidebar from "./components/sidebar/Sidebar";
import Header from "./components/header/Header";
import { useAuth } from "./context/authContext";


// function ProtectedRoute({ children }) {
//   const { user, loading } = useAuth();
//   if (loading) {
//     return <div className="flex items-center justify-center h-screen">Loading...</div>;
//   }
//   if (!user) {
//     return <Navigate to="/login" />;
//   }
//   return children;
// }

// This layout includes the responsive sidebar + header
function AuthenticatedLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar stays locked to the screen height */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main interface pane */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Only this area will scroll when content overflows */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          {children}
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
        <Route path ="/" element= {<Landing/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        
        {/* 2. Add the Create Profile route here, outside the ProtectedRoute */}
        <Route path="/create-profile" element={<CreateProfile />} />

        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          {/* Authenticated Layout Wrapper */}
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/myboard" element={<MyBoard />} />
            <Route path="/kanban" element={<KanbanBoard />} />

            {/* Nested Workspace Routes */}
            <Route path="/workspace/:id" element={<WorkSpace />}>
              {/* Redirect /workspace/:id to /workspace/:id/overview automatically */}
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<WorkspaceOverview />} />
              <Route path="board" element={<WorkspaceBoard />} />
              <Route path="chat" element={<WorkspaceChat />} />
              <Route path="activity" element={<WorkspaceActivity />} />
              <Route path="members" element={<WorkspaceMembers />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
