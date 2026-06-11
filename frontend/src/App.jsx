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

import WorkspaceChat from "./components/workspace/WorkspaceChat";
import WorkspaceActivity from "./components/workspace/WorkspaceActivity"
import WorkspaceOverview from "./components/workspace/WorkspaceOverview"
import WorkspaceMembers from "./components/workspace/WorkspaceMembers"
import WorkspaceBoard from "./components/workspace/WorkspaceBoard"

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

        {/* Protected Routes with both guards and the responsive layout */}
        <Route
          path="/dashboard"
          element={
            // <ProtectedRoute>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
            // </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            // <ProtectedRoute>
            <AuthenticatedLayout>
              <Analytics />
            </AuthenticatedLayout>
            // </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            // <ProtectedRoute>
            <AuthenticatedLayout>
              <Settings />
            </AuthenticatedLayout>
            // </ProtectedRoute>
          }
        />
        <Route
          path="/myboard"
          element={
            // <ProtectedRoute>
            <AuthenticatedLayout>
              <MyBoard />
            </AuthenticatedLayout>
            // </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/:id"
          element={
            // <ProtectedRoute>
              <AuthenticatedLayout>
                <WorkSpace />
              </AuthenticatedLayout>
            // </ProtectedRoute>
          }
        >
          <Route
            path="overview"
            element={<WorkspaceOverview />}
          />

          <Route
            path="board"
            element={<WorkspaceBoard />}
          />

          <Route
            path="chat"
            element={<WorkspaceChat />}
          />

          <Route
            path="activity"
            element={<WorkspaceActivity />}
          />

          <Route
            path="members"
            element={<WorkspaceMembers />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;